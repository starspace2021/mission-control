#!/usr/bin/env python3
"""
Polymarket 通知投递系统 - 优化版
Financial Intelligence Department - 山治负责

优化内容:
1. 检查飞书 webhook URL 配置
2. 添加邮件备用通知渠道
3. 添加重试机制（最多3次）
4. 添加详细的错误日志
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
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
import requests

# ============ 配置 ============
# 飞书配置
FEISHU_WEBHOOK_URL = os.getenv('FEISHU_WEBHOOK_URL', '')
FEISHU_SECRET = os.getenv('FEISHU_SECRET', '')

# 邮件备用配置
EMAIL_SMTP_SERVER = os.getenv('EMAIL_SMTP_SERVER', 'smtp.qq.com')
EMAIL_SMTP_PORT = int(os.getenv('EMAIL_SMTP_PORT', '587'))
EMAIL_USERNAME = os.getenv('EMAIL_USERNAME', '495168397@qq.com')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')
EMAIL_TO = os.getenv('EMAIL_TO', '495168397@qq.com')

# 重试配置
MAX_RETRIES = 3
RETRY_DELAY = 2  # 秒

@dataclass
class NotificationMessage:
    """通知消息"""
    title: str
    content: str
    severity: str = 'info'  # info, warning, critical
    metadata: Dict[str, Any] = None
    url: str = ''

class FeishuNotifier:
    """飞书通知器 - 带重试机制"""
    
    def __init__(self, webhook_url: str, secret: Optional[str] = None):
        self.webhook_url = webhook_url
        self.secret = secret
        self.enabled = bool(webhook_url)
        
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
    
    def _build_message(self, msg: NotificationMessage, timestamp: int) -> Dict:
        """构建飞书消息"""
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
                        "content": msg.title
                    },
                    "template": color_map.get(msg.severity, 'blue')
                },
                "elements": [
                    {
                        "tag": "div",
                        "text": {
                            "tag": "lark_md",
                            "content": msg.content
                        }
                    }
                ]
            }
        }
        
        # 添加详情按钮
        if msg.url:
            message["card"]["elements"].append({
                "tag": "action",
                "actions": [
                    {
                        "tag": "button",
                        "text": {
                            "tag": "plain_text",
                            "content": "查看详情"
                        },
                        "type": "primary",
                        "url": msg.url
                    }
                ]
            })
        
        # 添加签名
        if self.secret:
            message['timestamp'] = timestamp
            message['sign'] = self._generate_sign(timestamp)
        
        return message
    
    def send(self, msg: NotificationMessage) -> tuple[bool, str]:
        """发送通知，带重试机制"""
        if not self.enabled:
            return False, "飞书通知器未启用（缺少webhook URL）"
        
        timestamp = int(time.time())
        message = self._build_message(msg, timestamp)
        
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
                        return True, f"飞书通知发送成功（尝试 {attempt}/{MAX_RETRIES}）"
                    else:
                        error_msg = f"飞书API错误: {result}"
                        if attempt < MAX_RETRIES:
                            time.sleep(RETRY_DELAY * attempt)
                            continue
                        return False, error_msg
                else:
                    error_msg = f"HTTP错误: {response.status_code}"
                    if attempt < MAX_RETRIES:
                        time.sleep(RETRY_DELAY * attempt)
                        continue
                    return False, error_msg
                    
            except requests.exceptions.Timeout:
                error_msg = f"请求超时（尝试 {attempt}/{MAX_RETRIES}）"
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY * attempt)
                    continue
                return False, error_msg
            except Exception as e:
                error_msg = f"异常: {str(e)}（尝试 {attempt}/{MAX_RETRIES}）"
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY * attempt)
                    continue
                return False, error_msg
        
        return False, "所有重试均失败"

class EmailNotifier:
    """邮件通知器 - 备用渠道"""
    
    def __init__(self, smtp_server: str, smtp_port: int, 
                 username: str, password: str, to_addr: str):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.to_addr = to_addr
        self.enabled = all([smtp_server, username, password, to_addr])
    
    def send(self, msg: NotificationMessage) -> tuple[bool, str]:
        """发送邮件通知"""
        if not self.enabled:
            return False, "邮件通知器未启用（缺少配置）"
        
        try:
            # 构建邮件
            email_msg = MIMEMultipart('alternative')
            email_msg['Subject'] = f"[Polymarket] {msg.title}"
            email_msg['From'] = self.username
            email_msg['To'] = self.to_addr
            
            # 纯文本内容
            text_content = f"""
{msg.title}
严重级别: {msg.severity}
时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{msg.content}

{msg.url if msg.url else ''}
"""
            
            # HTML内容
            severity_colors = {
                'critical': '#ff4d4f',
                'warning': '#faad14',
                'info': '#1890ff'
            }
            color = severity_colors.get(msg.severity, '#1890ff')
            
            html_content = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: {color}; border-bottom: 2px solid {color}; padding-bottom: 10px;">
            {msg.title}
        </h2>
        <p><strong>严重级别:</strong> <span style="color: {color};">{msg.severity.upper()}</span></p>
        <p><strong>时间:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            {msg.content.replace(chr(10), '<br>')}
        </div>
        {f'<p><a href="{msg.url}" style="display: inline-block; background: {color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">查看详情</a></p>' if msg.url else ''}
    </div>
</body>
</html>
"""
            
            email_msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            email_msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            # 发送邮件
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(email_msg)
            
            return True, "邮件通知发送成功"
            
        except Exception as e:
            return False, f"邮件发送失败: {str(e)}"

class PolymarketNotifier:
    """Polymarket 通知管理器"""
    
    def __init__(self):
        self.feishu = FeishuNotifier(FEISHU_WEBHOOK_URL, FEISHU_SECRET)
        self.email = EmailNotifier(
            EMAIL_SMTP_SERVER, 
            EMAIL_SMTP_PORT,
            EMAIL_USERNAME,
            EMAIL_PASSWORD,
            EMAIL_TO
        )
        self.log_file = Path('logs/polymarket_notifications.log')
        self.log_file.parent.mkdir(exist_ok=True)
    
    def _log(self, level: str, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] [{level}] {message}\n"
        
        print(log_entry.strip())
        
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry)
    
    def send(self, msg: NotificationMessage, use_backup: bool = True) -> Dict[str, Any]:
        """
        发送通知，优先使用飞书，失败时使用邮件备用
        
        Args:
            msg: 通知消息
            use_backup: 是否使用备用渠道
        
        Returns:
            发送结果统计
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'title': msg.title,
            'channels': {},
            'success': False,
            'primary_success': False,
            'backup_used': False
        }
        
        self._log('INFO', f'开始发送通知: {msg.title}')
        
        # 尝试主渠道（飞书）
        if self.feishu.enabled:
            success, message = self.feishu.send(msg)
            results['channels']['feishu'] = {'success': success, 'message': message}
            
            if success:
                results['success'] = True
                results['primary_success'] = True
                self._log('INFO', f'飞书通知发送成功: {message}')
                return results
            else:
                self._log('WARNING', f'飞书通知失败: {message}')
        else:
            results['channels']['feishu'] = {'success': False, 'message': '未启用'}
            self._log('WARNING', '飞书通知器未启用')
        
        # 主渠道失败，尝试备用渠道（邮件）
        if use_backup and self.email.enabled:
            self._log('INFO', '尝试使用邮件备用渠道')
            success, message = self.email.send(msg)
            results['channels']['email'] = {'success': success, 'message': message}
            results['backup_used'] = True
            
            if success:
                results['success'] = True
                self._log('INFO', f'邮件备用通知发送成功: {message}')
            else:
                self._log('ERROR', f'邮件备用通知也失败: {message}')
        else:
            results['channels']['email'] = {'success': False, 'message': '未启用或未使用'}
        
        if not results['success']:
            self._log('ERROR', '所有通知渠道均失败')
        
        return results
    
    def test_channels(self) -> Dict[str, Any]:
        """测试所有通知渠道"""
        test_msg = NotificationMessage(
            title='Polymarket 通知系统测试',
            content='这是一条测试消息，用于验证通知系统是否正常工作。',
            severity='info',
            url='https://polymarket.com'
        )
        
        print('='*60)
        print('Polymarket 通知渠道测试')
        print('='*60)
        
        results = self.send(test_msg)
        
        print('\n' + '='*60)
        print('测试结果')
        print('='*60)
        print(f"整体状态: {'✅ 成功' if results['success'] else '❌ 失败'}")
        print(f"主渠道成功: {'是' if results['primary_success'] else '否'}")
        print(f"使用备用: {'是' if results['backup_used'] else '否'}")
        print("\n渠道详情:")
        for channel, result in results['channels'].items():
            status = '✅' if result['success'] else '❌'
            print(f"  {status} {channel}: {result['message']}")
        
        return results
    
    def get_status(self) -> Dict[str, Any]:
        """获取通知系统状态"""
        return {
            'timestamp': datetime.now().isoformat(),
            'feishu': {
                'enabled': self.feishu.enabled,
                'webhook_configured': bool(FEISHU_WEBHOOK_URL),
                'secret_configured': bool(FEISHU_SECRET)
            },
            'email': {
                'enabled': self.email.enabled,
                'smtp_server': EMAIL_SMTP_SERVER,
                'username': EMAIL_USERNAME,
                'to': EMAIL_TO
            },
            'config': {
                'max_retries': MAX_RETRIES,
                'retry_delay': RETRY_DELAY
            }
        }

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Polymarket 通知系统')
    parser.add_argument('--test', action='store_true', help='测试通知渠道')
    parser.add_argument('--status', action='store_true', help='显示系统状态')
    parser.add_argument('--title', type=str, help='通知标题')
    parser.add_argument('--content', type=str, help='通知内容')
    parser.add_argument('--severity', type=str, default='info', 
                       choices=['info', 'warning', 'critical'],
                       help='严重级别')
    parser.add_argument('--url', type=str, help='详情链接')
    parser.add_argument('--no-backup', action='store_true', help='不使用备用渠道')
    
    args = parser.parse_args()
    
    notifier = PolymarketNotifier()
    
    if args.status:
        status = notifier.get_status()
        print(json.dumps(status, ensure_ascii=False, indent=2))
        return
    
    if args.test:
        notifier.test_channels()
        return
    
    if args.title and args.content:
        msg = NotificationMessage(
            title=args.title,
            content=args.content,
            severity=args.severity,
            url=args.url or ''
        )
        results = notifier.send(msg, use_backup=not args.no_backup)
        
        if results['success']:
            print(f"\n✅ 通知发送成功")
            if results['backup_used']:
                print("   (使用备用渠道)")
        else:
            print(f"\n❌ 通知发送失败")
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
