#!/usr/bin/env python3
"""
US-China Policy Alert Monitor
美中政策实时告警监控脚本
部门: US-China Policy Department (波风水门、宇智波鼬)

功能:
- 监控多个数据源变化
- 触发条件判断
- 发送飞书通知
"""

import os
import sys
import json
import yaml
import time
import hashlib
import logging
import requests
import feedparser
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from urllib.parse import urljoin
import hmac
import base64

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/us-china-policy-alerts.log', encoding='utf-8')
    ]
)
logger = logging.getLogger('US-China-Alert')

# 确保日志目录存在
Path('logs').mkdir(exist_ok=True)
Path('memory').mkdir(exist_ok=True)


@dataclass
class Alert:
    """告警数据类"""
    id: str
    rule_id: str
    title: str
    severity: str
    source: str
    content: str
    timestamp: datetime
    url: str
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'rule_id': self.rule_id,
            'title': self.title,
            'severity': self.severity,
            'source': self.source,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'url': self.url,
            'metadata': self.metadata
        }


class FeishuNotifier:
    """飞书通知器"""
    
    def __init__(self, webhook_url: str, secret: Optional[str] = None):
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
    
    def send_alert(self, alert: Alert, template: Dict[str, str]) -> bool:
        """发送告警通知"""
        try:
            timestamp = int(time.time())
            
            # 根据严重级别设置颜色
            color_map = {
                'critical': 'red',
                'high': 'orange',
                'medium': 'yellow',
                'low': 'blue'
            }
            
            # 格式化消息内容
            title = template.get('title', '政策告警')
            content = template.get('content', '').format(**alert.metadata)
            
            # 构建飞书卡片消息
            message = {
                "msg_type": "interactive",
                "card": {
                    "config": {
                        "wide_screen_mode": True
                    },
                    "header": {
                        "title": {
                            "tag": "plain_text",
                            "content": title
                        },
                        "template": color_map.get(alert.severity, 'blue')
                    },
                    "elements": [
                        {
                            "tag": "div",
                            "text": {
                                "tag": "lark_md",
                                "content": content
                            }
                        },
                        {
                            "tag": "action",
                            "actions": [
                                {
                                    "tag": "button",
                                    "text": {
                                        "tag": "plain_text",
                                        "content": "查看详情"
                                    },
                                    "type": "primary",
                                    "url": alert.url
                                }
                            ]
                        }
                    ]
                }
            }
            
            # 添加签名
            if self.secret:
                message['timestamp'] = timestamp
                message['sign'] = self._generate_sign(timestamp)
            
            response = requests.post(
                self.webhook_url,
                json=message,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('code') == 0:
                    logger.info(f"飞书通知发送成功: {alert.title}")
                    return True
                else:
                    logger.error(f"飞书通知发送失败: {result}")
                    return False
            else:
                logger.error(f"飞书通知HTTP错误: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"发送飞书通知异常: {e}")
            return False
    
    def send_test_message(self) -> bool:
        """发送测试消息"""
        try:
            timestamp = int(time.time())
            message = {
                "msg_type": "text",
                "content": {
                    "text": "🧪 US-China Policy Alert System 测试消息\n\n告警系统运行正常！"
                }
            }
            
            if self.secret:
                message['timestamp'] = timestamp
                message['sign'] = self._generate_sign(timestamp)
            
            response = requests.post(
                self.webhook_url,
                json=message,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            return response.status_code == 200 and response.json().get('code') == 0
            
        except Exception as e:
            logger.error(f"发送测试消息异常: {e}")
            return False


class DataSourceMonitor:
    """数据源监控器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.state_file = Path('memory/alert_state.json')
        self.state = self._load_state()
        
    def _load_state(self) -> Dict:
        """加载监控状态"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"加载状态文件失败: {e}")
        return {}
    
    def _save_state(self):
        """保存监控状态"""
        try:
            with open(self.state_file, 'w', encoding='utf-8') as f:
                json.dump(self.state, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存状态文件失败: {e}")
    
    def _get_content_hash(self, content: str) -> str:
        """计算内容哈希"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def check_rss_feed(self, source_id: str, source_config: Dict) -> List[Dict]:
        """检查RSS源更新"""
        changes = []
        try:
            rss_url = source_config.get('rss', source_config.get('url'))
            feed = feedparser.parse(rss_url)
            
            if not feed.entries:
                logger.warning(f"RSS源无内容: {source_id}")
                return changes
            
            keywords = source_config.get('keywords', [])
            last_check = self.state.get(source_id, {}).get('last_check', '')
            
            for entry in feed.entries[:10]:  # 检查最近10条
                entry_id = entry.get('id', entry.get('link', ''))
                entry_hash = self._get_content_hash(entry_id)
                
                # 检查是否已处理过
                if entry_hash in self.state.get(source_id, {}).get('processed', []):
                    continue
                
                # 检查关键词匹配
                title = entry.get('title', '')
                summary = entry.get('summary', '')
                content_text = f"{title} {summary}".lower()
                
                matched_keywords = [kw for kw in keywords if kw.lower() in content_text]
                
                if matched_keywords:
                    changes.append({
                        'id': entry_hash,
                        'title': title,
                        'summary': summary,
                        'link': entry.get('link', ''),
                        'published': entry.get('published', ''),
                        'matched_keywords': matched_keywords,
                        'source': source_config.get('name', source_id)
                    })
                
                # 记录已处理
                if source_id not in self.state:
                    self.state[source_id] = {'processed': []}
                self.state[source_id]['processed'].append(entry_hash)
                # 保留最近100条记录
                self.state[source_id]['processed'] = self.state[source_id]['processed'][-100:]
            
            self.state[source_id]['last_check'] = datetime.now().isoformat()
            self._save_state()
            
        except Exception as e:
            logger.error(f"检查RSS源失败 {source_id}: {e}")
        
        return changes
    
    def check_api_endpoint(self, source_id: str, source_config: Dict) -> List[Dict]:
        """检查API端点更新"""
        changes = []
        try:
            api_url = source_config.get('api_endpoint')
            if not api_url:
                return changes
            
            response = requests.get(api_url, timeout=30)
            if response.status_code != 200:
                logger.warning(f"API请求失败 {source_id}: {response.status_code}")
                return changes
            
            data = response.json()
            content_hash = self._get_content_hash(json.dumps(data, sort_keys=True))
            
            last_hash = self.state.get(source_id, {}).get('content_hash')
            if last_hash != content_hash:
                changes.append({
                    'id': content_hash,
                    'title': f"{source_config.get('name')} 数据更新",
                    'summary': '检测到数据源内容变化',
                    'link': source_config.get('url', ''),
                    'published': datetime.now().isoformat(),
                    'matched_keywords': ['data_update'],
                    'source': source_config.get('name', source_id),
                    'data': data
                })
                
                self.state[source_id] = {
                    'content_hash': content_hash,
                    'last_check': datetime.now().isoformat()
                }
                self._save_state()
                
        except Exception as e:
            logger.error(f"检查API端点失败 {source_id}: {e}")
        
        return changes
    
    def check_all_sources(self) -> Dict[str, List[Dict]]:
        """检查所有数据源"""
        results = {}
        data_sources = self.config.get('data_sources', {})
        
        for source_id, source_config in data_sources.items():
            source_type = source_config.get('type', 'rss')
            
            if source_type == 'rss':
                changes = self.check_rss_feed(source_id, source_config)
            elif source_type == 'api':
                changes = self.check_api_endpoint(source_id, source_config)
            else:
                logger.warning(f"未知数据源类型: {source_type}")
                changes = []
            
            if changes:
                results[source_id] = changes
                logger.info(f"数据源 {source_id} 发现 {len(changes)} 条更新")
        
        return results


class AlertEngine:
    """告警引擎"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.monitor = DataSourceMonitor(config)
        self.notifier = self._init_notifier()
        self.templates = config.get('notification_templates', {})
        self.rules = config.get('alert_rules', [])
        
    def _init_notifier(self) -> Optional[FeishuNotifier]:
        """初始化通知器"""
        feishu_config = self.config.get('feishu_config', {})
        webhook_url = feishu_config.get('webhook_url', '')
        
        # 从环境变量获取
        if webhook_url.startswith('${') and webhook_url.endswith('}'):
            env_var = webhook_url[2:-1]
            webhook_url = os.getenv(env_var, '')
        
        secret = feishu_config.get('secret', '')
        if secret.startswith('${') and secret.endswith('}'):
            env_var = secret[2:-1]
            secret = os.getenv(env_var, '')
        
        if webhook_url:
            return FeishuNotifier(webhook_url, secret)
        return None
    
    def _match_rule(self, rule: Dict, change: Dict, source_id: str) -> bool:
        """判断变更是否匹配规则"""
        # 检查数据源匹配
        if rule.get('source') != source_id:
            return False
        
        conditions = rule.get('trigger_conditions', [])
        
        for condition in conditions:
            condition_type = condition.get('type')
            
            if condition_type == 'keyword_match':
                keywords = condition.get('keywords', [])
                match_mode = condition.get('match_mode', 'any')
                
                matched_keywords = change.get('matched_keywords', [])
                
                if match_mode == 'any':
                    if not any(kw in matched_keywords for kw in keywords):
                        return False
                elif match_mode == 'all':
                    if not all(kw in matched_keywords for kw in keywords):
                        return False
            
            elif condition_type == 'new_document':
                within_hours = condition.get('within_hours', 24)
                published = change.get('published', '')
                try:
                    pub_time = datetime.fromisoformat(published.replace('Z', '+00:00'))
                    if datetime.now() - pub_time > timedelta(hours=within_hours):
                        return False
                except:
                    pass
        
        return True
    
    def _generate_alert(self, rule: Dict, change: Dict) -> Alert:
        """生成告警对象"""
        rule_id = rule.get('id', 'unknown')
        severity = rule.get('severity', 'medium')
        template_key = rule.get('notification', {}).get('template', 'default')
        template = self.templates.get(template_key, {})
        
        # 构建元数据
        metadata = {
            'case_name': change.get('title', 'N/A'),
            'date': change.get('published', datetime.now().isoformat()),
            'summary': change.get('summary', '')[:200] + '...',
            'china_related_points': ', '.join(change.get('matched_keywords', [])),
            'url': change.get('link', ''),
            'source_name': change.get('source', 'Unknown'),
            'entity_name': change.get('title', 'N/A'),
            'change_type': '新增',
            'country': 'China',
            'restrictions': '待确认',
            'effective_date': change.get('published', 'N/A'),
            'policy_type': rule.get('name', '政策更新'),
            'products': '待分析',
            'rate_change': '待确认',
            'description': change.get('summary', '')[:300],
            'eo_number': '待确认',
            'title': change.get('title', 'N/A'),
            'signing_date': change.get('published', 'N/A'),
            'key_points': change.get('summary', '')[:200],
            'china_impact': '需要进一步分析',
            'sanction_type': 'SDN',
            'target_entities': change.get('title', 'N/A'),
            'countries': 'China',
            'reasoning': change.get('summary', '')[:200],
            'rule_number': '待确认',
            'comment_deadline': '待确认'
        }
        
        return Alert(
            id=f"{rule_id}_{change.get('id', '')}_{int(time.time())}",
            rule_id=rule_id,
            title=change.get('title', '政策告警'),
            severity=severity,
            source=change.get('source', 'Unknown'),
            content=change.get('summary', ''),
            timestamp=datetime.now(),
            url=change.get('link', ''),
            metadata=metadata
        )
    
    def process_changes(self, changes_by_source: Dict[str, List[Dict]]) -> List[Alert]:
        """处理所有变更，生成告警"""
        alerts = []
        
        for source_id, changes in changes_by_source.items():
            for change in changes:
                for rule in self.rules:
                    if self._match_rule(rule, change, source_id):
                        alert = self._generate_alert(rule, change)
                        alerts.append(alert)
                        logger.info(f"生成告警: {alert.title} (规则: {rule.get('id')})")
        
        return alerts
    
    def send_alerts(self, alerts: List[Alert]):
        """发送告警通知"""
        if not self.notifier:
            logger.warning("通知器未配置，跳过发送")
            return
        
        for alert in alerts:
            template_key = None
            for rule in self.rules:
                if rule.get('id') == alert.rule_id:
                    template_key = rule.get('notification', {}).get('template')
                    break
            
            template = self.templates.get(template_key, {
                'title': f"[{alert.severity.upper()}] {alert.title}",
                'content': alert.content
            })
            
            self.notifier.send_alert(alert, template)
            
            # 紧急告警添加延迟避免频率限制
            if alert.severity == 'critical':
                time.sleep(1)
    
    def run(self):
        """运行一次监控检查"""
        logger.info("开始执行监控检查...")
        
        # 检查所有数据源
        changes = self.monitor.check_all_sources()
        
        if not changes:
            logger.info("未发现数据更新")
            return []
        
        # 处理变更生成告警
        alerts = self.process_changes(changes)
        
        # 发送告警
        if alerts:
            logger.info(f"共生成 {len(alerts)} 条告警")
            self.send_alerts(alerts)
        
        return alerts
    
    def test_notification(self) -> bool:
        """测试通知渠道"""
        if not self.notifier:
            logger.error("通知器未配置")
            return False
        
        return self.notifier.send_test_message()


def load_config() -> Dict:
    """加载配置文件"""
    config_path = Path('memory/us-china-policy-alerts.yaml')
    if not config_path.exists():
        logger.error(f"配置文件不存在: {config_path}")
        sys.exit(1)
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='US-China Policy Alert Monitor')
    parser.add_argument('--test', action='store_true', help='发送测试通知')
    parser.add_argument('--daemon', action='store_true', help='守护模式运行')
    parser.add_argument('--interval', type=int, default=300, help='检查间隔(秒)')
    
    args = parser.parse_args()
    
    # 加载配置
    config = load_config()
    
    # 创建告警引擎
    engine = AlertEngine(config)
    
    if args.test:
        print("发送测试通知...")
        if engine.test_notification():
            print("✅ 测试通知发送成功")
        else:
            print("❌ 测试通知发送失败")
        return
    
    if args.daemon:
        print(f"守护模式启动，检查间隔: {args.interval}秒")
        try:
            while True:
                engine.run()
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n监控已停止")
    else:
        # 单次运行
        alerts = engine.run()
        if alerts:
            print(f"生成 {len(alerts)} 条告警")
        else:
            print("未发现需要告警的更新")


if __name__ == '__main__':
    main()
