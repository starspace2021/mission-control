#!/usr/bin/env python3
"""
系统健康仪表盘
Memory & Admin Department - 乔巴、克林
功能：系统健康检查、定时任务状态监控、生成健康报告
"""

import json
import os
import sys
import time
import subprocess
import psutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field
from enum import Enum

class HealthStatus(Enum):
    HEALTHY = "healthy"      # 健康
    WARNING = "warning"      # 警告
    CRITICAL = "critical"    # 严重
    UNKNOWN = "unknown"      # 未知

@dataclass
class HealthCheck:
    """健康检查项"""
    name: str
    status: HealthStatus
    message: str
    value: Any = None
    threshold: Any = None
    last_checked: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "status": self.status.value,
            "message": self.message,
            "value": self.value,
            "threshold": self.threshold,
            "last_checked": self.last_checked.isoformat()
        }

@dataclass
class DepartmentHealth:
    """部门健康状态"""
    name: str
    status: HealthStatus
    tasks_total: int
    tasks_healthy: int
    tasks_warning: int
    tasks_critical: int
    checks: List[HealthCheck] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "status": self.status.value,
            "tasks_total": self.tasks_total,
            "tasks_healthy": self.tasks_healthy,
            "tasks_warning": self.tasks_warning,
            "tasks_critical": self.tasks_critical,
            "checks": [c.to_dict() for c in self.checks]
        }

@dataclass
class SystemHealthReport:
    """系统健康报告"""
    generated_at: datetime
    overall_status: HealthStatus
    departments: List[DepartmentHealth]
    system_checks: List[HealthCheck]
    summary: Dict
    
    def to_dict(self) -> Dict:
        return {
            "generated_at": self.generated_at.isoformat(),
            "overall_status": self.overall_status.value,
            "departments": [d.to_dict() for d in self.departments],
            "system_checks": [c.to_dict() for c in self.system_checks],
            "summary": self.summary
        }

class HealthDashboard:
    """健康仪表盘"""
    
    def __init__(self, workspace_dir: str = None):
        self.workspace_dir = Path(workspace_dir or "/root/.openclaw/workspace")
        self.monitor_dir = self.workspace_dir / "monitoring"
        self.report_dir = self.monitor_dir / "reports"
        
        # 创建目录
        self.monitor_dir.mkdir(exist_ok=True)
        self.report_dir.mkdir(exist_ok=True)
        
        # 部门定义
        self.departments = {
            "Africa Intel Department": {
                "tasks": ["africa-osint-daily-summary", "africa-osint-10am", 
                         "africa-osint-2pm", "africa-osint-5pm", "africa-osint-8pm"],
                "agents": ["Africa Intel Collector", "Intel Analyst", "Risk Scoring Agent"]
            },
            "US-China Policy Department": {
                "tasks": ["us-china-policy-morning", "us-china-policy-afternoon", 
                         "us-china-policy-evening"],
                "agents": ["Policy Collector", "Policy Analyst"]
            },
            "Financial Intelligence Department": {
                "tasks": ["polymarket-morning", "polymarket-afternoon", "polymarket-evening"],
                "agents": ["Prediction Market Collector", "Market Signal Analyst"]
            },
            "Engineering Department": {
                "tasks": ["mission-control-ui-iter", "qa-assessment"],
                "agents": ["UI Developer Agent", "Backend Developer Agent", "QA Agent"]
            },
            "Memory & Admin Department": {
                "tasks": ["memory-export", "memory-cleanup", "qq-mail-cleanup"],
                "agents": ["Memory Manager Agent", "System Maintenance Agent"]
            }
        }
    
    def check_disk_space(self) -> HealthCheck:
        """检查磁盘空间"""
        try:
            disk = psutil.disk_usage('/')
            used_percent = disk.percent
            free_gb = disk.free / (1024**3)
            
            if used_percent > 90:
                status = HealthStatus.CRITICAL
                message = f"磁盘空间严重不足: {used_percent}% 已使用，仅剩 {free_gb:.1f}GB"
            elif used_percent > 80:
                status = HealthStatus.WARNING
                message = f"磁盘空间不足: {used_percent}% 已使用，剩余 {free_gb:.1f}GB"
            else:
                status = HealthStatus.HEALTHY
                message = f"磁盘空间正常: {used_percent}% 已使用，剩余 {free_gb:.1f}GB"
            
            return HealthCheck(
                name="磁盘空间",
                status=status,
                message=message,
                value=f"{used_percent}%",
                threshold="80%"
            )
        except Exception as e:
            return HealthCheck(
                name="磁盘空间",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_memory(self) -> HealthCheck:
        """检查内存使用"""
        try:
            memory = psutil.virtual_memory()
            used_percent = memory.percent
            available_gb = memory.available / (1024**3)
            
            if used_percent > 95:
                status = HealthStatus.CRITICAL
                message = f"内存严重不足: {used_percent}% 已使用"
            elif used_percent > 85:
                status = HealthStatus.WARNING
                message = f"内存使用较高: {used_percent}% 已使用"
            else:
                status = HealthStatus.HEALTHY
                message = f"内存使用正常: {used_percent}% 已使用"
            
            return HealthCheck(
                name="内存使用",
                status=status,
                message=message,
                value=f"{used_percent}%",
                threshold="85%"
            )
        except Exception as e:
            return HealthCheck(
                name="内存使用",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_cpu(self) -> HealthCheck:
        """检查CPU使用"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            
            if cpu_percent > 90:
                status = HealthStatus.CRITICAL
                message = f"CPU负载过高: {cpu_percent}%"
            elif cpu_percent > 70:
                status = HealthStatus.WARNING
                message = f"CPU负载较高: {cpu_percent}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"CPU负载正常: {cpu_percent}%"
            
            return HealthCheck(
                name="CPU负载",
                status=status,
                message=message,
                value=f"{cpu_percent}%",
                threshold="70%"
            )
        except Exception as e:
            return HealthCheck(
                name="CPU负载",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_load_average(self) -> HealthCheck:
        """检查系统负载"""
        try:
            load1, load5, load15 = os.getloadavg()
            cpu_count = psutil.cpu_count()
            load_percent = (load1 / cpu_count) * 100
            
            if load_percent > 150:
                status = HealthStatus.CRITICAL
                message = f"系统负载严重: {load1:.2f} (1min)"
            elif load_percent > 100:
                status = HealthStatus.WARNING
                message = f"系统负载较高: {load1:.2f} (1min)"
            else:
                status = HealthStatus.HEALTHY
                message = f"系统负载正常: {load1:.2f} (1min)"
            
            return HealthCheck(
                name="系统负载",
                status=status,
                message=message,
                value=f"{load1:.2f}",
                threshold=f"{cpu_count:.0f}"
            )
        except Exception as e:
            return HealthCheck(
                name="系统负载",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_workspace_size(self) -> HealthCheck:
        """检查工作区大小"""
        try:
            total_size = 0
            file_count = 0
            for dirpath, dirnames, filenames in os.walk(self.workspace_dir):
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    if not os.path.islink(fp):
                        total_size += os.path.getsize(fp)
                        file_count += 1
            
            size_mb = total_size / (1024**2)
            
            if size_mb > 1000:  # > 1GB
                status = HealthStatus.WARNING
                message = f"工作区较大: {size_mb:.1f}MB, {file_count} 个文件"
            else:
                status = HealthStatus.HEALTHY
                message = f"工作区正常: {size_mb:.1f}MB, {file_count} 个文件"
            
            return HealthCheck(
                name="工作区大小",
                status=status,
                message=message,
                value=f"{size_mb:.1f}MB",
                threshold="1000MB"
            )
        except Exception as e:
            return HealthCheck(
                name="工作区大小",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_git_status(self) -> HealthCheck:
        """检查Git状态"""
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                return HealthCheck(
                    name="Git状态",
                    status=HealthStatus.WARNING,
                    message="无法获取Git状态"
                )
            
            changes = result.stdout.strip().split('\n') if result.stdout.strip() else []
            change_count = len([c for c in changes if c.strip()])
            
            if change_count > 0:
                status = HealthStatus.WARNING
                message = f"有 {change_count} 个未提交的更改"
            else:
                status = HealthStatus.HEALTHY
                message = "Git工作区干净"
            
            return HealthCheck(
                name="Git状态",
                status=status,
                message=message,
                value=change_count,
                threshold=0
            )
        except Exception as e:
            return HealthCheck(
                name="Git状态",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_task_executions(self, task_id: str) -> HealthCheck:
        """检查任务执行状态"""
        try:
            # 加载执行记录
            db_file = self.monitor_dir / "task_executions.json"
            if not db_file.exists():
                return HealthCheck(
                    name=f"任务: {task_id}",
                    status=HealthStatus.UNKNOWN,
                    message="无执行记录"
                )
            
            with open(db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 获取最近24小时的执行记录
            since = datetime.now() - timedelta(hours=24)
            recent_execs = [
                e for e in data.get('executions', [])
                if e['task_id'] == task_id and 
                datetime.fromisoformat(e['start_time']) >= since
            ]
            
            if not recent_execs:
                return HealthCheck(
                    name=f"任务: {task_id}",
                    status=HealthStatus.WARNING,
                    message="24小时内无执行记录"
                )
            
            # 检查最近执行状态
            latest = max(recent_execs, key=lambda x: x['start_time'])
            
            if latest['status'] == 'failed':
                return HealthCheck(
                    name=f"任务: {task_id}",
                    status=HealthStatus.CRITICAL,
                    message=f"最近执行失败: {latest.get('error_message', 'Unknown error')}",
                    value="failed"
                )
            elif latest['status'] == 'success':
                exec_time = datetime.fromisoformat(latest['start_time'])
                hours_ago = (datetime.now() - exec_time).total_seconds() / 3600
                
                if hours_ago > 12:
                    return HealthCheck(
                        name=f"任务: {task_id}",
                        status=HealthStatus.WARNING,
                        message=f"上次成功执行在 {hours_ago:.1f} 小时前",
                        value=f"{hours_ago:.1f}h"
                    )
                else:
                    return HealthCheck(
                        name=f"任务: {task_id}",
                        status=HealthStatus.HEALTHY,
                        message=f"最近执行成功 ({hours_ago:.1f}小时前)",
                        value="success"
                    )
            else:
                return HealthCheck(
                    name=f"任务: {task_id}",
                    status=HealthStatus.WARNING,
                    message=f"任务状态: {latest['status']}",
                    value=latest['status']
                )
                
        except Exception as e:
            return HealthCheck(
                name=f"任务: {task_id}",
                status=HealthStatus.UNKNOWN,
                message=f"检查失败: {str(e)}"
            )
    
    def check_department_health(self, dept_name: str, dept_info: Dict) -> DepartmentHealth:
        """检查部门健康状态"""
        checks = []
        healthy = 0
        warning = 0
        critical = 0
        
        for task_id in dept_info['tasks']:
            check = self.check_task_executions(task_id)
            checks.append(check)
            
            if check.status == HealthStatus.HEALTHY:
                healthy += 1
            elif check.status == HealthStatus.WARNING:
                warning += 1
            elif check.status == HealthStatus.CRITICAL:
                critical += 1
        
        # 确定部门整体状态
        if critical > 0:
            overall_status = HealthStatus.CRITICAL
        elif warning > 0:
            overall_status = HealthStatus.WARNING
        else:
            overall_status = HealthStatus.HEALTHY
        
        return DepartmentHealth(
            name=dept_name,
            status=overall_status,
            tasks_total=len(dept_info['tasks']),
            tasks_healthy=healthy,
            tasks_warning=warning,
            tasks_critical=critical,
            checks=checks
        )
    
    def generate_report(self) -> SystemHealthReport:
        """生成系统健康报告"""
        print("🔍 正在生成系统健康报告...")
        
        # 系统级检查
        system_checks = [
            self.check_disk_space(),
            self.check_memory(),
            self.check_cpu(),
            self.check_load_average(),
            self.check_workspace_size(),
            self.check_git_status()
        ]
        
        # 部门健康检查
        departments = []
        for dept_name, dept_info in self.departments.items():
            print(f"  检查部门: {dept_name}...")
            dept_health = self.check_department_health(dept_name, dept_info)
            departments.append(dept_health)
        
        # 确定整体状态
        all_statuses = [d.status for d in departments] + [c.status for c in system_checks]
        if HealthStatus.CRITICAL in all_statuses:
            overall_status = HealthStatus.CRITICAL
        elif HealthStatus.WARNING in all_statuses:
            overall_status = HealthStatus.WARNING
        else:
            overall_status = HealthStatus.HEALTHY
        
        # 生成摘要
        total_tasks = sum(d.tasks_total for d in departments)
        healthy_tasks = sum(d.tasks_healthy for d in departments)
        warning_tasks = sum(d.tasks_warning for d in departments)
        critical_tasks = sum(d.tasks_critical for d in departments)
        
        summary = {
            "total_departments": len(departments),
            "total_tasks": total_tasks,
            "healthy_tasks": healthy_tasks,
            "warning_tasks": warning_tasks,
            "critical_tasks": critical_tasks,
            "system_checks_total": len(system_checks),
            "system_checks_healthy": sum(1 for c in system_checks if c.status == HealthStatus.HEALTHY),
            "system_checks_warning": sum(1 for c in system_checks if c.status == HealthStatus.WARNING),
            "system_checks_critical": sum(1 for c in system_checks if c.status == HealthStatus.CRITICAL)
        }
        
        report = SystemHealthReport(
            generated_at=datetime.now(),
            overall_status=overall_status,
            departments=departments,
            system_checks=system_checks,
            summary=summary
        )
        
        return report
    
    def save_report(self, report: SystemHealthReport):
        """保存报告"""
        timestamp = report.generated_at.strftime('%Y%m%d_%H%M%S')
        
        # JSON格式
        json_file = self.report_dir / f"health_report_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(report.to_dict(), f, ensure_ascii=False, indent=2)
        
        # Markdown格式
        md_file = self.report_dir / f"health_report_{timestamp}.md"
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(self._format_markdown_report(report))
        
        # 最新报告链接
        latest_json = self.report_dir / "health_report_latest.json"
        latest_md = self.report_dir / "health_report_latest.md"
        
        # 复制为最新
        import shutil
        shutil.copy2(json_file, latest_json)
        shutil.copy2(md_file, latest_md)
        
        return json_file, md_file
    
    def _format_markdown_report(self, report: SystemHealthReport) -> str:
        """格式化Markdown报告"""
        status_emoji = {
            HealthStatus.HEALTHY: "✅",
            HealthStatus.WARNING: "⚠️",
            HealthStatus.CRITICAL: "🚨",
            HealthStatus.UNKNOWN: "❓"
        }
        
        md = f"""# 🏥 OpenClaw 系统健康报告

**生成时间**: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}  
**整体状态**: {status_emoji[report.overall_status]} {report.overall_status.value.upper()}

---

## 📊 总体概况

| 指标 | 数值 |
|------|------|
| 部门数量 | {report.summary['total_departments']} |
| 任务总数 | {report.summary['total_tasks']} |
| 健康任务 | ✅ {report.summary['healthy_tasks']} |
| 警告任务 | ⚠️ {report.summary['warning_tasks']} |
| 严重任务 | 🚨 {report.summary['critical_tasks']} |
| 系统检查项 | {report.summary['system_checks_total']} |

---

## 🖥️ 系统状态

"""
        
        for check in report.system_checks:
            emoji = status_emoji[check.status]
            md += f"""### {emoji} {check.name}
- **状态**: {check.status.value}
- **消息**: {check.message}
- **数值**: {check.value if check.value is not None else 'N/A'}
- **阈值**: {check.threshold if check.threshold is not None else 'N/A'}

"""
        
        md += "---\n\n## 🏢 部门健康状态\n\n"
        
        for dept in report.departments:
            emoji = status_emoji[dept.status]
            md += f"""### {emoji} {dept.name}

**任务统计**: 总计 {dept.tasks_total} | ✅ {dept.tasks_healthy} 健康 | ⚠️ {dept.tasks_warning} 警告 | 🚨 {dept.tasks_critical} 严重

**任务详情**:

| 任务 | 状态 | 消息 |
|------|------|------|
"""
            for check in dept.checks:
                check_emoji = status_emoji[check.status]
                md += f"| {check.name} | {check_emoji} {check.status.value} | {check.message} |\n"
            
            md += "\n"
        
        md += """---

*报告由 Memory & Admin Department 自动生成*
"""
        
        return md
    
    def print_console_report(self, report: SystemHealthReport):
        """打印控制台报告"""
        status_emoji = {
            HealthStatus.HEALTHY: "✅",
            HealthStatus.WARNING: "⚠️",
            HealthStatus.CRITICAL: "🚨",
            HealthStatus.UNKNOWN: "❓"
        }
        
        print("\n" + "="*70)
        print("🏥 OpenClaw 系统健康报告")
        print("="*70)
        print(f"生成时间: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"整体状态: {status_emoji[report.overall_status]} {report.overall_status.value.upper()}")
        print("="*70)
        
        print("\n📊 总体概况")
        print(f"  部门数量: {report.summary['total_departments']}")
        print(f"  任务总数: {report.summary['total_tasks']}")
        print(f"  健康任务: ✅ {report.summary['healthy_tasks']}")
        print(f"  警告任务: ⚠️ {report.summary['warning_tasks']}")
        print(f"  严重任务: 🚨 {report.summary['critical_tasks']}")
        
        print("\n🖥️ 系统状态")
        for check in report.system_checks:
            emoji = status_emoji[check.status]
            print(f"  {emoji} {check.name}: {check.message}")
        
        print("\n🏢 部门健康状态")
        for dept in report.departments:
            emoji = status_emoji[dept.status]
            print(f"\n  {emoji} {dept.name}")
            print(f"     任务: 总计{dept.tasks_total} | ✅{dept.tasks_healthy} | ⚠️{dept.tasks_warning} | 🚨{dept.tasks_critical}")
            for check in dept.checks:
                check_emoji = status_emoji[check.status]
                print(f"     {check_emoji} {check.name}: {check.message[:50]}...")
        
        print("\n" + "="*70)

def main():
    """主函数"""
    dashboard = HealthDashboard()
    
    # 生成报告
    report = dashboard.generate_report()
    
    # 打印到控制台
    dashboard.print_console_report(report)
    
    # 保存报告
    json_file, md_file = dashboard.save_report(report)
    print(f"\n✓ JSON报告已保存: {json_file}")
    print(f"✓ Markdown报告已保存: {md_file}")

if __name__ == "__main__":
    main()
