#!/usr/bin/env python3
"""
Africa Intel 情报投递系统 - 优化版
Africa Intel Department - 罗布·路奇负责

优化内容:
1. 将飞书通知和 QQ 邮箱通知拆分为独立函数
2. 任一失败不影响另一个
3. 添加渠道状态跟踪
4. 支持单独启用/禁用某个渠道
"""

import os
import sys
import json
import time
import hmac
import hashlib
import base64
import smtplib
from datetime import datetime
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Callable
from enum import Enum
import requests

# ============ 配置 ============
# 飞书配置
FEISHU_WEBHOOK_URL = os.getenv('FEISHU_WEBHOOK_URL', '')
FEISHU_SECRET = os.getenv('FEISHU_SECRET', '')

# QQ邮箱配置
QQ_EMAIL = '495168397@qq.com'
QQ_EMAIL_PASSWORD = 'ghvuapitdfwqbiee'
QQ_EMAIL_SMTP = 'smtp.qq.com'
QQ_EMAIL_SMTP_PORT = 587

# 渠道启用配置
ENABLE_FEISHU = os.getenv('ENABLE_FEISHU', 'true').lower() == 'true'
ENABLE_QQ_EMAIL = os.getenv('ENABLE_QQ_EMAIL', 'true').lower() == 'true'

# 重试配置
MAX_RETRIES = 3
RETRY_DELAY = 2  # 秒

class ChannelStatus(Enum):
    """渠道状态"""
    ENABLED = "enabled"
    DISABLED = "disabled"
    FAILED = "failed"
    SUCCESS = "success"

@dataclass
class IntelReport:
    """情报报告"""
    title: str
    content: str
    summary: str = ""
    source: str = "Africa Intel Department"
    timestamp: datetime = field(default_factory=datetime.now)
    severity: str = "info"  # info, warning, critical
    metadata: Dict[str, Any] = field(default_factory=dict)
    attachments: List[str] = field(default_factory=list)

@dataclass
class DeliveryResult:
    """投递结果"""
    channel: str
    success: bool
    message: str
    timestamp: datetime = field(default_factory=datetime.now)
    retry_count: int = 0

class Channel:
    """投递渠道基类"""
    
    def __init__(self, name: str, enabled: bool = True):
        self.name = name
        self.enabled = enabled
        self.status = ChannelStatus.ENABLED if enabled else ChannelStatus.DISABLED
    
    def deliver(self, report: IntelReport) -> DeliveryResult:
        """投递报告 - 子类必须实现"""
        raise NotImplementedError
    
    def test(self) -> DeliveryResult:
        """测试渠道"""
        test_report = IntelReport(
            title='渠道测试',
            content='这是一条测试消息，用于验证渠道是否正常工作。',
            severity='info'
        )
        return self.deliver(test_report)

class FeishuChannel(Channel):
    """飞书投递渠道"""
    
    def __init__(self, webhook_url: str, secret: Optional[str] = None):
        super().__init__('feishu', enabled=bool(webhook_url) and ENABLE_FEISHU)
        self.webhook_url = webhook_url
        self.secret = secret
    
    def _generate_sign(self, timestamp: int) -> str:
        """生成飞书签名"""
        if not self.secret:
            return ""
        string_to_sign = f"{timestamp}\n{self.secret}"
        hmac_code = hmac.new(
            string_to_sign.encode('utf-8'),
            digestmod=hashlib.sha256
        ).digest()
        return base64.b64encode(hmac_code).decode('utf-8')
    
    def deliver(self, report: IntelReport) -> DeliveryResult:
        """投递到飞书"""
        if not self.enabled:
            return DeliveryResult(
                channel=self.name,
                success=False,
                message='渠道未启用'
            )
        
        timestamp = int(time.time())
        
        # 根据严重级别设置颜色
        color_map = {
            'critical': 'red',
            'warning': 'orange',
            'info': 'blue'
        }
        
        # 构建卡片消息
        message = {
            "msg_type": "interactive",
            "card": {
                "config": {
                    "wide_screen_mode": True
                },
                "header": {
                    "title": {
                        "tag": "plain_text",
                        "content": report.title
                    },
                    "template": color_map.get(report.severity, 'blue')
                },
                "elements": [
                    {
                        "tag": "div",
                        "text": {
                            "tag": "lark_md",
                            "content": report.content
                        }
                    }
                ]
            }
        }
        
        # 添加元数据
        if report.metadata:
            meta_text = "\n".join([f"**{k}**: {v}" for k, v in report.metadata.items()])
            message["card"]["elements"].insert(0, {
                "tag": "div",
                "text": {
                    "tag": "lark_md",
                    "content": meta_text
                }
            })
        
        # 添加签名
        if self.secret:
            message['timestamp'] = timestamp
            message['sign'] = self._generate_sign(timestamp)
        
        # 发送，带重试
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = requests.post(
                    self.webhook_url,
                    json=message,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('code') == 0:
                        self.status = ChannelStatus.SUCCESS
                        return DeliveryResult(
                            channel=self.name,
                            success=True,
                            message=f'发送成功（尝试 {attempt}/{MAX_RETRIES}）',
                            retry_count=attempt
                        )
                    else:
                        if attempt < MAX_RETRIES:
                            time.sleep(RETRY_DELAY * attempt)
                            continue
                        self.status = ChannelStatus.FAILED
                        return DeliveryResult(
                            channel=self.name,
                            success=False,
                            message=f'API错误: {result}',
                            retry_count=attempt
                        )
                else:
                    if attempt < MAX_RETRIES:
                        time.sleep(RETRY_DELAY * attempt)
                        continue
                    self.status = ChannelStatus.FAILED
                    return DeliveryResult(
                        channel=self.name,
                        success=False,
                        message=f'HTTP错误: {response.status_code}',
                        retry_count=attempt
                    )
                        
            except Exception as e:
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY * attempt)
                    continue
                self.status = ChannelStatus.FAILED
                return DeliveryResult(
                    channel=self.name,
                    success=False,
                    message=f'异常: {str(e)}',
                    retry_count=attempt
                )
        
        self.status = ChannelStatus.FAILED
        return DeliveryResult(
            channel=self.name,
            success=False,
            message='所有重试均失败',
            retry_count=MAX_RETRIES
        )

class QQEmailChannel(Channel):
    """QQ邮箱投递渠道"""
    
    def __init__(self, email: str, password: str, 
                 smtp_server: str = 'smtp.qq.com', smtp_port: int = 587):
        super().__init__('qq_email', enabled=bool(email and password) and ENABLE_QQ_EMAIL)
        self.email = email
        self.password = password
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
    
    def deliver(self, report: IntelReport) -> DeliveryResult:
        """投递到QQ邮箱"""
        if not self.enabled:
            return DeliveryResult(
                channel=self.name,
                success=False,
                message='渠道未启用'
            )
        
        try:
            # 构建邮件
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[Africa Intel] {report.title}"
            msg['From'] = self.email
            msg['To'] = self.email
            
            # 纯文本内容
            text_content = f"""
{report.title}
来源: {report.source}
时间: {report.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
严重级别: {report.severity}

{report.content}

{chr(10).join([f"{k}: {v}" for k, v in report.metadata.items()]) if report.metadata else ''}
"""
            
            # HTML内容
            severity_colors = {
                'critical': '#ff4d4f',
                'warning': '#faad14',
                'info': '#1890ff'
            }
            color = severity_colors.get(report.severity, '#1890ff')
            
            html_content = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: {color}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">{report.title}</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">{report.source} | {report.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none;">
            {report.content.replace(chr(10), '<br>')}
        </div>
        
        {f'<div style="background: #fff3cd; padding: 15px; border: 1px solid #e9ecef; border-top: none;"><strong>元数据:</strong><br>' + '<br>'.join([f"{k}: {v}" for k, v in report.metadata.items()]) + '</div>' if report.metadata else ''}
        
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
            Africa Intel Department | 自动情报投递系统
        </div>
    </div>
</body>
</html>
"""
            
            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            # 发送邮件
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.send_message(msg)
            
            self.status = ChannelStatus.SUCCESS
            return DeliveryResult(
                channel=self.name,
                success=True,
                message='邮件发送成功'
            )
            
        except Exception as e:
            self.status = ChannelStatus.FAILED
            return DeliveryResult(
                channel=self.name,
                success=False,
                message=f'邮件发送失败: {str(e)}'
            )

class AfricaIntelDelivery:
    """Africa Intel 情报投递管理器"""
    
    def __init__(self):
        self.channels: Dict[str, Channel] = {}
        self.log_file = Path('logs/africa_intel_delivery.log')
        self.log_file.parent.mkdir(exist_ok=True)
        
        # 初始化渠道
        self._init_channels()
    
    def _init_channels(self):
        """初始化所有渠道"""
        # 飞书渠道
        self.channels['feishu'] = FeishuChannel(FEISHU_WEBHOOK_URL, FEISHU_SECRET)
        
        # QQ邮箱渠道
        self.channels['qq_email'] = QQEmailChannel(
            QQ_EMAIL, 
            QQ_EMAIL_PASSWORD,
            QQ_EMAIL_SMTP,
            QQ_EMAIL_SMTP_PORT
        )
    
    def _log(self, level: str, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] [{level}] {message}\n"
        
        print(log_entry.strip())
        
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry)
    
    def deliver(self, report: IntelReport, channels: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        投递情报报告
        
        Args:
            report: 情报报告
            channels: 指定渠道列表，None表示所有启用的渠道
        
        Returns:
            投递结果汇总
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'report_title': report.title,
            'channels': {},
            'success_count': 0,
            'failed_count': 0,
            'overall_success': False
        }
        
        self._log('INFO', f'开始投递报告: {report.title}')
        
        # 确定要使用的渠道
        target_channels = channels if channels else list(self.channels.keys())
        
        # 独立投递到每个渠道
        for channel_name in target_channels:
            if channel_name not in self.channels:
                results['channels'][channel_name] = DeliveryResult(
                    channel=channel_name,
                    success=False,
                    message='未知渠道'
                )
                results['failed_count'] += 1
                continue
            
            channel = self.channels[channel_name]
            self._log('INFO', f'使用渠道: {channel_name}')
            
            try:
                result = channel.deliver(report)
                results['channels'][channel_name] = result
                
                if result.success:
                    results['success_count'] += 1
                    self._log('INFO', f'{channel_name} 投递成功: {result.message}')
                else:
                    results['failed_count'] += 1
                    self._log('WARNING', f'{channel_name} 投递失败: {result.message}')
                    
            except Exception as e:
                error_result = DeliveryResult(
                    channel=channel_name,
                    success=False,
                    message=f'异常: {str(e)}'
                )
                results['channels'][channel_name] = error_result
                results['failed_count'] += 1
                self._log('ERROR', f'{channel_name} 投递异常: {str(e)}')
        
        # 只要有一个渠道成功，整体就算成功
        results['overall_success'] = results['success_count'] > 0
        
        if results['overall_success']:
            self._log('INFO', f'投递完成: {results["success_count"]}/{len(target_channels)} 个渠道成功')
        else:
            self._log('ERROR', '所有渠道投递均失败')
        
        return results
    
    def deliver_to_single_channel(self, report: IntelReport, channel_name: str) -> DeliveryResult:
        """投递到单个渠道"""
        if channel_name not in self.channels:
            return DeliveryResult(
                channel=channel_name,
                success=False,
                message='未知渠道'
            )
        
        return self.channels[channel_name].deliver(report)
    
    def test_all_channels(self) -> Dict[str, Any]:
        """测试所有渠道"""
        test_report = IntelReport(
            title='Africa Intel 渠道测试',
            content='这是一条测试消息，用于验证情报投递渠道是否正常工作。',
            summary='渠道测试',
            severity='info',
            metadata={'测试类型': '系统自检', '版本': '2.0'}
        )
        
        print('='*60)
        print('Africa Intel 双渠道测试')
        print('='*60)
        
        results = self.deliver(test_report)
        
        print('\n' + '='*60)
        print('测试结果汇总')
        print('='*60)
        print(f"整体状态: {'✅ 成功' if results['overall_success'] else '❌ 失败'}")
        print(f"成功渠道: {results['success_count']}")
        print(f"失败渠道: {results['failed_count']}")
        print("\n渠道详情:")
        for channel_name, result in results['channels'].items():
            status = '✅' if result.success else '❌'
            print(f"  {status} {channel_name}: {result.message}")
        
        return results
    
    def get_channel_status(self) -> Dict[str, Any]:
        """获取所有渠道状态"""
        return {
            'timestamp': datetime.now().isoformat(),
            'channels': {
                name: {
                    'enabled': ch.enabled,
                    'status': ch.status.value
                }
                for name, ch in self.channels.items()
            },
            'config': {
                'feishu_webhook_configured': bool(FEISHU_WEBHOOK_URL),
                'feishu_secret_configured': bool(FEISHU_SECRET),
                'qq_email_configured': bool(QQ_EMAIL and QQ_EMAIL_PASSWORD)
            }
        }

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Africa Intel 情报投递系统')
    parser.add_argument('--test', action='store_true', help='测试所有渠道')
    parser.add_argument('--status', action='store_true', help='显示渠道状态')
    parser.add_argument('--title', type=str, help='报告标题')
    parser.add_argument('--content', type=str, help='报告内容')
    parser.add_argument('--severity', type=str, default='info',
                       choices=['info', 'warning', 'critical'],
                       help='严重级别')
    parser.add_argument('--channel', type=str, choices=['feishu', 'qq_email'],
                       help='指定单个渠道投递')
    
    args = parser.parse_args()
    
    delivery = AfricaIntelDelivery()
    
    if args.status:
        status = delivery.get_channel_status()
        print(json.dumps(status, ensure_ascii=False, indent=2))
        return
    
    if args.test:
        delivery.test_all_channels()
        return
    
    if args.title and args.content:
        report = IntelReport(
            title=args.title,
            content=args.content,
            severity=args.severity
        )
        
        if args.channel:
            # 单渠道投递
            result = delivery.deliver_to_single_channel(report, args.channel)
            print(f"\n{'✅' if result.success else '❌'} {args.channel}: {result.message}")
        else:
            # 全渠道投递
            results = delivery.deliver(report)
            print(f"\n整体状态: {'✅ 成功' if results['overall_success'] else '❌ 失败'}")
            print(f"成功: {results['success_count']}, 失败: {results['failed_count']}")
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
