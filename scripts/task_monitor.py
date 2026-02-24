#!/usr/bin/env python3
"""
任务执行状态监控系统
Memory & Admin Department - 乔巴、克林
功能：监控所有定时任务执行状态，跟踪执行历史，失败告警
"""

import json
import os
import sys
import time
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    SKIPPED = "skipped"

@dataclass
class TaskExecution:
    """单次任务执行记录"""
    task_id: str
    task_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: TaskStatus = TaskStatus.PENDING
    exit_code: Optional[int] = None
    stdout: str = ""
    stderr: str = ""
    error_message: str = ""
    duration_ms: int = 0
    
    def to_dict(self) -> Dict:
        return {
            "task_id": self.task_id,
            "task_name": self.task_name,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "status": self.status.value,
            "exit_code": self.exit_code,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "error_message": self.error_message,
            "duration_ms": self.duration_ms
        }

@dataclass
class TaskDefinition:
    """任务定义"""
    id: str
    name: str
    command: str
    schedule: str  # cron表达式或描述
    department: str
    owner: str
    timeout_seconds: int = 300
    retry_count: int = 0
    enabled: bool = True
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "command": self.command,
            "schedule": self.schedule,
            "department": self.department,
            "owner": self.owner,
            "timeout_seconds": self.timeout_seconds,
            "retry_count": self.retry_count,
            "enabled": self.enabled
        }

class TaskMonitor:
    """任务监控器"""
    
    def __init__(self, workspace_dir: str = None):
        self.workspace_dir = Path(workspace_dir or "/root/.openclaw/workspace")
        self.monitor_dir = self.workspace_dir / "monitoring"
        self.log_dir = self.monitor_dir / "logs"
        self.db_file = self.monitor_dir / "task_executions.json"
        
        # 创建目录
        self.monitor_dir.mkdir(exist_ok=True)
        self.log_dir.mkdir(exist_ok=True)
        
        # 任务注册表
        self.tasks: Dict[str, TaskDefinition] = {}
        self.executions: List[TaskExecution] = []
        
        # 加载历史记录
        self._load_executions()
        
    def _load_executions(self):
        """加载历史执行记录"""
        if self.db_file.exists():
            try:
                with open(self.db_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.executions = []
                    for item in data.get('executions', []):
                        exec_record = TaskExecution(
                            task_id=item['task_id'],
                            task_name=item['task_name'],
                            start_time=datetime.fromisoformat(item['start_time']),
                            end_time=datetime.fromisoformat(item['end_time']) if item['end_time'] else None,
                            status=TaskStatus(item['status']),
                            exit_code=item.get('exit_code'),
                            stdout=item.get('stdout', ''),
                            stderr=item.get('stderr', ''),
                            error_message=item.get('error_message', ''),
                            duration_ms=item.get('duration_ms', 0)
                        )
                        self.executions.append(exec_record)
            except Exception as e:
                print(f"加载执行记录失败: {e}")
                self.executions = []
    
    def _save_executions(self):
        """保存执行记录"""
        try:
            data = {
                "last_updated": datetime.now().isoformat(),
                "executions": [e.to_dict() for e in self.executions[-1000:]]  # 保留最近1000条
            }
            with open(self.db_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存执行记录失败: {e}")
    
    def register_task(self, task: TaskDefinition):
        """注册任务"""
        self.tasks[task.id] = task
        print(f"✓ 注册任务: {task.name} ({task.id})")
    
    def register_default_tasks(self):
        """注册系统默认任务"""
        default_tasks = [
            TaskDefinition(
                id="africa-osint-daily-summary",
                name="非洲情报每日摘要",
                command="africa_intel_daily",
                schedule="0 7 * * *",
                department="Africa Intel Department",
                owner="Africa Intel Collector",
                timeout_seconds=600
            ),
            TaskDefinition(
                id="africa-osint-10am",
                name="非洲情报上午收集",
                command="africa_intel_10am",
                schedule="0 16 * * *",
                department="Africa Intel Department",
                owner="Africa Intel Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="africa-osint-2pm",
                name="非洲情报下午收集",
                command="africa_intel_2pm",
                schedule="0 20 * * *",
                department="Africa Intel Department",
                owner="Africa Intel Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="africa-osint-5pm",
                name="非洲情报傍晚收集",
                command="africa_intel_5pm",
                schedule="0 23 * * *",
                department="Africa Intel Department",
                owner="Africa Intel Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="africa-osint-8pm",
                name="非洲情报晚间收集",
                command="africa_intel_8pm",
                schedule="0 2 * * *",
                department="Africa Intel Department",
                owner="Africa Intel Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="us-china-policy-morning",
                name="美国对华政策早间监控",
                command="us_china_policy_morning",
                schedule="0 8 * * *",
                department="US-China Policy Department",
                owner="Policy Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="us-china-policy-afternoon",
                name="美国对华政策下午监控",
                command="us_china_policy_afternoon",
                schedule="0 14 * * *",
                department="US-China Policy Department",
                owner="Policy Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="us-china-policy-evening",
                name="美国对华政策晚间监控",
                command="us_china_policy_evening",
                schedule="0 20 * * *",
                department="US-China Policy Department",
                owner="Policy Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="polymarket-morning",
                name="Polymarket早间分析",
                command="polymarket_morning",
                schedule="0 9 * * *",
                department="Financial Intelligence Department",
                owner="Prediction Market Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="polymarket-afternoon",
                name="Polymarket下午分析",
                command="polymarket_afternoon",
                schedule="0 15 * * *",
                department="Financial Intelligence Department",
                owner="Prediction Market Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="polymarket-evening",
                name="Polymarket晚间分析",
                command="polymarket_evening",
                schedule="0 21 * * *",
                department="Financial Intelligence Department",
                owner="Prediction Market Collector",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="mission-control-ui-iter",
                name="Mission Control UI迭代",
                command="mission_control_ui_iter",
                schedule="0 */2 * * *",
                department="Engineering Department",
                owner="UI Developer Agent",
                timeout_seconds=600
            ),
            TaskDefinition(
                id="qa-assessment",
                name="质量评估",
                command="qa_assessment",
                schedule="0 */8 * * *",
                department="Engineering Department",
                owner="QA Agent",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="memory-export",
                name="记忆导出",
                command="python3 /root/.openclaw/workspace/memory_export_daily_optimized.py",
                schedule="0 0 * * *",
                department="Memory & Admin Department",
                owner="Memory Manager Agent",
                timeout_seconds=60
            ),
            TaskDefinition(
                id="memory-cleanup",
                name="记忆清理",
                command="memory_cleanup",
                schedule="0 0 1 * *",
                department="Memory & Admin Department",
                owner="Memory Manager Agent",
                timeout_seconds=300
            ),
            TaskDefinition(
                id="qq-mail-cleanup",
                name="QQ邮箱清理",
                command="python3 /root/.openclaw/workspace/qq_mail_cleanup_optimized.py",
                schedule="16 6 * * *",
                department="Memory & Admin Department",
                owner="System Maintenance Agent",
                timeout_seconds=120
            )
        ]
        
        for task in default_tasks:
            self.register_task(task)
    
    def start_execution(self, task_id: str) -> TaskExecution:
        """开始执行任务"""
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"未知任务: {task_id}")
        
        execution = TaskExecution(
            task_id=task_id,
            task_name=task.name,
            start_time=datetime.now()
        )
        
        self.executions.append(execution)
        self._save_executions()
        
        return execution
    
    def complete_execution(self, execution: TaskExecution, 
                          status: TaskStatus,
                          exit_code: int = None,
                          stdout: str = "",
                          stderr: str = "",
                          error_message: str = ""):
        """完成任务执行"""
        execution.end_time = datetime.now()
        execution.status = status
        execution.exit_code = exit_code
        execution.stdout = stdout
        execution.stderr = stderr
        execution.error_message = error_message
        
        if execution.start_time:
            duration = execution.end_time - execution.start_time
            execution.duration_ms = int(duration.total_seconds() * 1000)
        
        self._save_executions()
        
        # 如果失败，触发告警
        if status == TaskStatus.FAILED:
            self._send_alert(execution)
    
    def _send_alert(self, execution: TaskExecution):
        """发送失败告警"""
        alert_message = f"""
🚨 **任务执行失败告警**

**任务**: {execution.task_name}
**任务ID**: {execution.task_id}
**时间**: {execution.end_time.strftime('%Y-%m-%d %H:%M:%S')}
**状态**: ❌ FAILED
**退出码**: {execution.exit_code}
**错误**: {execution.error_message}

**标准错误输出**:
```
{execution.stderr[:500]}
```

请尽快检查任务配置和系统状态。
"""
        
        # 写入告警日志
        alert_file = self.log_dir / f"alert_{execution.task_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        with open(alert_file, 'w', encoding='utf-8') as f:
            f.write(alert_message)
        
        print(f"⚠️ 告警已记录: {alert_file}")
        
        # 这里可以集成实际的通知渠道（飞书、邮件等）
        return alert_message
    
    def get_task_stats(self, task_id: str, days: int = 7) -> Dict:
        """获取任务统计信息"""
        since = datetime.now() - timedelta(days=days)
        task_execs = [e for e in self.executions 
                      if e.task_id == task_id and e.start_time >= since]
        
        if not task_execs:
            return {
                "task_id": task_id,
                "total_runs": 0,
                "success_count": 0,
                "failed_count": 0,
                "success_rate": 0,
                "avg_duration_ms": 0
            }
        
        total = len(task_execs)
        success = sum(1 for e in task_execs if e.status == TaskStatus.SUCCESS)
        failed = sum(1 for e in task_execs if e.status == TaskStatus.FAILED)
        avg_duration = sum(e.duration_ms for e in task_execs) / total
        
        return {
            "task_id": task_id,
            "total_runs": total,
            "success_count": success,
            "failed_count": failed,
            "success_rate": round(success / total * 100, 2),
            "avg_duration_ms": round(avg_duration, 2)
        }
    
    def get_all_stats(self, days: int = 7) -> Dict:
        """获取所有任务统计"""
        stats = {
            "generated_at": datetime.now().isoformat(),
            "period_days": days,
            "tasks": []
        }
        
        for task_id in self.tasks:
            task_stats = self.get_task_stats(task_id, days)
            task_stats["task_info"] = self.tasks[task_id].to_dict()
            stats["tasks"].append(task_stats)
        
        # 总体统计
        all_execs = [e for e in self.executions 
                     if e.start_time >= datetime.now() - timedelta(days=days)]
        total_execs = len(all_execs)
        success_execs = sum(1 for e in all_execs if e.status == TaskStatus.SUCCESS)
        failed_execs = sum(1 for e in all_execs if e.status == TaskStatus.FAILED)
        
        stats["summary"] = {
            "total_executions": total_execs,
            "total_success": success_execs,
            "total_failed": failed_execs,
            "overall_success_rate": round(success_execs / total_execs * 100, 2) if total_execs > 0 else 0
        }
        
        return stats
    
    def get_recent_failures(self, hours: int = 24) -> List[TaskExecution]:
        """获取最近的失败记录"""
        since = datetime.now() - timedelta(hours=hours)
        return [e for e in self.executions 
                if e.status == TaskStatus.FAILED and e.start_time >= since]
    
    def simulate_task_execution(self, task_id: str, success: bool = True):
        """模拟任务执行（用于测试）"""
        execution = self.start_execution(task_id)
        
        # 模拟执行时间
        time.sleep(0.1)
        
        if success:
            self.complete_execution(
                execution,
                status=TaskStatus.SUCCESS,
                exit_code=0,
                stdout="Task completed successfully"
            )
        else:
            self.complete_execution(
                execution,
                status=TaskStatus.FAILED,
                exit_code=1,
                stderr="Error: Connection timeout",
                error_message="Connection timeout after 30s"
            )
        
        return execution

def main():
    """主函数"""
    monitor = TaskMonitor()
    monitor.register_default_tasks()
    
    # 显示任务列表
    print("\n" + "="*60)
    print("任务监控系统 - 已注册任务")
    print("="*60)
    
    for task_id, task in monitor.tasks.items():
        print(f"\n📋 {task.name}")
        print(f"   ID: {task_id}")
        print(f"   部门: {task.department}")
        print(f"   负责人: {task.owner}")
        print(f"   调度: {task.schedule}")
    
    print("\n" + "="*60)
    print(f"总计: {len(monitor.tasks)} 个任务")
    print("="*60)
    
    # 保存任务定义
    tasks_file = monitor.monitor_dir / "task_definitions.json"
    with open(tasks_file, 'w', encoding='utf-8') as f:
        json.dump({tid: t.to_dict() for tid, t in monitor.tasks.items()}, 
                  f, ensure_ascii=False, indent=2)
    print(f"\n✓ 任务定义已保存: {tasks_file}")

if __name__ == "__main__":
    main()
