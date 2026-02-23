#!/usr/bin/env python3
"""
US-China Policy Department - 告警机制
功能：监控美国对华政策相关任务和指标，触发告警
"""

import json
import os
import sys
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class AlertChannel(Enum):
    FEISHU = "feishu"
    EMAIL = "email"
    CONSOLE = "console"
    WEBHOOK = "webhook"

@dataclass
class AlertRule:
    """告警规则定义"""
    id: str
    name: str
    description: str
    department: str
    metric: str  # 监控的指标
    condition: str  # 条件: >, <, ==, contains
    threshold: Any  # 阈值
    level: AlertLevel
    channels: List[AlertChannel]
    enabled: bool = True
    cooldown_minutes: int = 30  # 冷却时间
    last_triggered: Optional[datetime] = None
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "department": self.department,
            "metric": self.metric,
            "condition": self.condition,
            "threshold": self.threshold,
            "level": self.level.value,
            "channels": [c.value for c in self.channels],
            "enabled": self.enabled,
            "cooldown_minutes": self.cooldown_minutes,
            "last_triggered": self.last_triggered.isoformat() if self.last_triggered else None
        }

@dataclass
class AlertEvent:
    """告警事件"""
    id: str
    rule_id: str
    rule_name: str
    level: AlertLevel
    message: str
    metric_value: Any
    threshold: Any
    timestamp: datetime
    acknowledged: bool = False
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "level": self.level.value,
            "message": self.message,
            "metric_value": self.metric_value,
            "threshold": self.threshold,
            "timestamp": self.timestamp.isoformat(),
            "acknowledged": self.acknowledged
        }

class PolicyAlertManager:
    """美国对华政策告警管理器"""
    
    def __init__(self, workspace_dir: str = None):
        self.workspace_dir = Path(workspace_dir or "/root/.openclaw/workspace")
        self.alert_dir = self.workspace_dir / "monitoring" / "alerts"
        self.config_file = self.alert_dir / "policy_alert_rules.json"
        self.events_file = self.alert_dir / "policy_alert_events.json"
        
        # 创建目录
        self.alert_dir.mkdir(parents=True, exist_ok=True)
        
        # 告警规则
        self.rules: Dict[str, AlertRule] = {}
        self.events: List[AlertEvent] = []
        
        # 加载配置
        self._load_rules()
        self._load_events()
        
        # 飞书Webhook配置
        self.feishu_webhook = os.environ.get("FEISHU_WEBHOOK_URL", "")
    
    def _load_rules(self):
        """加载告警规则"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data.get('rules', []):
                        rule = AlertRule(
                            id=item['id'],
                            name=item['name'],
                            description=item['description'],
                            department=item['department'],
                            metric=item['metric'],
                            condition=item['condition'],
                            threshold=item['threshold'],
                            level=AlertLevel(item['level']),
                            channels=[AlertChannel(c) for c in item['channels']],
                            enabled=item.get('enabled', True),
                            cooldown_minutes=item.get('cooldown_minutes', 30),
                            last_triggered=datetime.fromisoformat(item['last_triggered']) if item.get('last_triggered') else None
                        )
                        self.rules[rule.id] = rule
            except Exception as e:
                print(f"加载告警规则失败: {e}")
    
    def _save_rules(self):
        """保存告警规则"""
        try:
            data = {
                "last_updated": datetime.now().isoformat(),
                "rules": [r.to_dict() for r in self.rules.values()]
            }
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存告警规则失败: {e}")
    
    def _load_events(self):
        """加载告警事件"""
        if self.events_file.exists():
            try:
                with open(self.events_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.events = []
                    for item in data.get('events', []):
                        event = AlertEvent(
                            id=item['id'],
                            rule_id=item['rule_id'],
                            rule_name=item['rule_name'],
                            level=AlertLevel(item['level']),
                            message=item['message'],
                            metric_value=item['metric_value'],
                            threshold=item['threshold'],
                            timestamp=datetime.fromisoformat(item['timestamp']),
                            acknowledged=item.get('acknowledged', False)
                        )
                        self.events.append(event)
            except Exception as e:
                print(f"加载告警事件失败: {e}")
    
    def _save_events(self):
        """保存告警事件"""
        try:
            data = {
                "last_updated": datetime.now().isoformat(),
                "events": [e.to_dict() for e in self.events[-500:]]  # 保留最近500条
            }
            with open(self.events_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存告警事件失败: {e}")
    
    def register_default_rules(self):
        """注册默认告警规则"""
        default_rules = [
            AlertRule(
                id="policy-task-failure",
                name="政策监控任务失败",
                description="美国对华政策监控任务执行失败",
                department="US-China Policy Department",
                metric="task_failure_count",
                condition=">",
                threshold=0,
                level=AlertLevel.CRITICAL,
                channels=[AlertChannel.CONSOLE, AlertChannel.FEISHU],
                cooldown_minutes=15
            ),
            AlertRule(
                id="policy-high-impact-news",
                name="高影响政策新闻",
                description="检测到高影响级别的美国对华政策新闻",
                department="US-China Policy Department",
                metric="news_impact_level",
                condition=">=",
                threshold=4,  # 1-5级
                level=AlertLevel.WARNING,
                channels=[AlertChannel.CONSOLE, AlertChannel.FEISHU],
                cooldown_minutes=60
            ),
            AlertRule(
                id="policy-source-unavailable",
                name="政策数据源不可用",
                description="重要的政策新闻源无法访问",
                department="US-China Policy Department",
                metric="source_failure_rate",
                condition=">",
                threshold=0.5,  # 50%
                level=AlertLevel.WARNING,
                channels=[AlertChannel.CONSOLE],
                cooldown_minutes=30
            ),
            AlertRule(
                id="policy-keyword-spike",
                name="关键词热度激增",
                description="特定政策关键词出现频率异常增长",
                department="US-China Policy Department",
                metric="keyword_frequency_change",
                condition=">",
                threshold=3.0,  # 3倍增长
                level=AlertLevel.INFO,
                channels=[AlertChannel.CONSOLE],
                cooldown_minutes=120
            ),
            AlertRule(
                id="policy-collection-delay",
                name="情报收集延迟",
                description="政策情报收集任务执行时间超过预期",
                department="US-China Policy Department",
                metric="task_duration_minutes",
                condition=">",
                threshold=10,  # 10分钟
                level=AlertLevel.WARNING,
                channels=[AlertChannel.CONSOLE],
                cooldown_minutes=60
            ),
            AlertRule(
                id="policy-sanctions-update",
                name="制裁政策更新",
                description="检测到新的制裁相关政策措施",
                department="US-China Policy Department",
                metric="sanctions_news_detected",
                condition="==",
                threshold=True,
                level=AlertLevel.EMERGENCY,
                channels=[AlertChannel.CONSOLE, AlertChannel.FEISHU],
                cooldown_minutes=5
            )
        ]
        
        for rule in default_rules:
            self.rules[rule.id] = rule
            print(f"✓ 注册告警规则: {rule.name}")
        
        self._save_rules()
    
    def evaluate_rule(self, rule: AlertRule, metric_value: Any) -> bool:
        """评估规则是否触发"""
        if not rule.enabled:
            return False
        
        # 检查冷却时间
        if rule.last_triggered:
            cooldown = timedelta(minutes=rule.cooldown_minutes)
            if datetime.now() - rule.last_triggered < cooldown:
                return False
        
        # 评估条件
        triggered = False
        if rule.condition == ">":
            triggered = metric_value > rule.threshold
        elif rule.condition == ">=":
            triggered = metric_value >= rule.threshold
        elif rule.condition == "<":
            triggered = metric_value < rule.threshold
        elif rule.condition == "<=":
            triggered = metric_value <= rule.threshold
        elif rule.condition == "==":
            triggered = metric_value == rule.threshold
        elif rule.condition == "contains":
            triggered = rule.threshold in str(metric_value)
        
        return triggered
    
    def trigger_alert(self, rule: AlertRule, metric_value: Any):
        """触发告警"""
        event_id = f"evt_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{rule.id}"
        
        # 构建告警消息
        level_emoji = {
            AlertLevel.INFO: "ℹ️",
            AlertLevel.WARNING: "⚠️",
            AlertLevel.CRITICAL: "🚨",
            AlertLevel.EMERGENCY: "🔥"
        }
        
        message = f"""
{level_emoji[rule.level]} **{rule.name}**

**部门**: {rule.department}
**级别**: {rule.level.value.upper()}
**时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**指标**: {rule.metric}
**当前值**: {metric_value}
**阈值**: {rule.threshold} ({rule.condition})

**描述**: {rule.description}
"""
        
        event = AlertEvent(
            id=event_id,
            rule_id=rule.id,
            rule_name=rule.name,
            level=rule.level,
            message=message,
            metric_value=metric_value,
            threshold=rule.threshold,
            timestamp=datetime.now()
        )
        
        self.events.append(event)
        rule.last_triggered = datetime.now()
        
        # 发送到各渠道
        for channel in rule.channels:
            self._send_to_channel(channel, event, message)
        
        self._save_events()
        self._save_rules()
        
        return event
    
    def _send_to_channel(self, channel: AlertChannel, event: AlertEvent, message: str):
        """发送到指定渠道"""
        if channel == AlertChannel.CONSOLE:
            print(f"\n{'='*60}")
            print(f"[告警] {event.rule_name}")
            print(f"{'='*60}")
            print(message)
            print(f"{'='*60}\n")
        
        elif channel == AlertChannel.FEISHU and self.feishu_webhook:
            self._send_feishu(message)
        
        elif channel == AlertChannel.EMAIL:
            self._send_email(event, message)
    
    def _send_feishu(self, message: str):
        """发送到飞书"""
        try:
            payload = {
                "msg_type": "text",
                "content": {
                    "text": message
                }
            }
            # 实际使用时需要配置webhook
            # response = requests.post(self.feishu_webhook, json=payload, timeout=10)
            print(f"[飞书] 告警消息已准备: {message[:50]}...")
        except Exception as e:
            print(f"[飞书] 发送失败: {e}")
    
    def _send_email(self, event: AlertEvent, message: str):
        """发送邮件"""
        try:
            print(f"[邮件] 告警邮件已准备: {event.rule_name}")
        except Exception as e:
            print(f"[邮件] 发送失败: {e}")
    
    def check_metrics(self, metrics: Dict[str, Any]):
        """检查所有指标"""
        triggered_rules = []
        
        for rule in self.rules.values():
            if rule.metric in metrics:
                metric_value = metrics[rule.metric]
                if self.evaluate_rule(rule, metric_value):
                    event = self.trigger_alert(rule, metric_value)
                    triggered_rules.append((rule, event))
        
        return triggered_rules
    
    def get_active_alerts(self) -> List[AlertEvent]:
        """获取未确认的告警"""
        return [e for e in self.events if not e.acknowledged]
    
    def acknowledge_alert(self, event_id: str):
        """确认告警"""
        for event in self.events:
            if event.id == event_id:
                event.acknowledged = True
                self._save_events()
                return True
        return False
    
    def get_alert_stats(self, hours: int = 24) -> Dict:
        """获取告警统计"""
        since = datetime.now() - timedelta(hours=hours)
        recent_events = [e for e in self.events if e.timestamp >= since]
        
        stats = {
            "total": len(recent_events),
            "by_level": {},
            "by_rule": {},
            "unacknowledged": len([e for e in recent_events if not e.acknowledged])
        }
        
        for event in recent_events:
            level = event.level.value
            stats["by_level"][level] = stats["by_level"].get(level, 0) + 1
            
            rule_name = event.rule_name
            stats["by_rule"][rule_name] = stats["by_rule"].get(rule_name, 0) + 1
        
        return stats

def main():
    """主函数"""
    manager = PolicyAlertManager()
    manager.register_default_rules()
    
    print("\n" + "="*60)
    print("US-China Policy Department - 告警系统")
    print("="*60)
    print(f"\n已加载 {len(manager.rules)} 条告警规则")
    
    # 显示所有规则
    print("\n【告警规则列表】")
    for rule in manager.rules.values():
        status = "✓ 启用" if rule.enabled else "✗ 禁用"
        print(f"  [{rule.level.value.upper()}] {rule.name} - {status}")
    
    # 模拟测试
    print("\n【模拟测试】")
    test_metrics = {
        "task_failure_count": 1,  # 触发任务失败告警
        "news_impact_level": 5,   # 触发高影响新闻告警
        "keyword_frequency_change": 2.5  # 不触发
    }
    
    triggered = manager.check_metrics(test_metrics)
    
    if triggered:
        print(f"\n✓ 触发了 {len(triggered)} 条告警")
        for rule, event in triggered:
            print(f"  - {event.rule_name} ({event.level.value})")
    else:
        print("\n✓ 未触发任何告警")
    
    # 显示统计
    stats = manager.get_alert_stats()
    print(f"\n【告警统计(24小时)】")
    print(f"  总计: {stats['total']}")
    print(f"  未确认: {stats['unacknowledged']}")
    print(f"  按级别: {stats['by_level']}")
    
    print("\n" + "="*60)
    print("告警系统运行正常")
    print("="*60)

if __name__ == "__main__":
    main()
