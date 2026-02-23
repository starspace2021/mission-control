#!/usr/bin/env python3
"""
监控测试脚本
Memory & Admin Department - 乔巴、克林
功能：测试任务监控和健康检查功能
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from task_monitor import TaskMonitor, TaskStatus
from health_dashboard import HealthDashboard, HealthStatus
from datetime import datetime

def test_task_monitor():
    """测试任务监控功能"""
    print("\n" + "="*70)
    print("🧪 测试任务监控系统")
    print("="*70)
    
    monitor = TaskMonitor()
    monitor.register_default_tasks()
    
    # 测试1: 模拟成功任务
    print("\n📋 测试1: 模拟成功任务执行")
    task_id = "qq-mail-cleanup"
    execution = monitor.simulate_task_execution(task_id, success=True)
    print(f"  ✓ 任务 {task_id} 执行完成")
    print(f"    状态: {execution.status.value}")
    print(f"    耗时: {execution.duration_ms}ms")
    
    # 测试2: 模拟失败任务
    print("\n📋 测试2: 模拟失败任务执行")
    execution = monitor.simulate_task_execution(task_id, success=False)
    print(f"  ✓ 任务 {task_id} 执行完成")
    print(f"    状态: {execution.status.value}")
    print(f"    错误: {execution.error_message}")
    
    # 测试3: 获取任务统计
    print("\n📋 测试3: 获取任务统计")
    stats = monitor.get_task_stats(task_id, days=1)
    print(f"  任务: {task_id}")
    print(f"    总执行次数: {stats['total_runs']}")
    print(f"    成功次数: {stats['success_count']}")
    print(f"    失败次数: {stats['failed_count']}")
    print(f"    成功率: {stats['success_rate']}%")
    
    # 测试4: 获取最近失败
    print("\n📋 测试4: 获取最近失败记录")
    failures = monitor.get_recent_failures(hours=1)
    print(f"  最近1小时失败数: {len(failures)}")
    for f in failures:
        print(f"    - {f.task_name}: {f.error_message}")
    
    # 测试5: 获取所有统计
    print("\n📋 测试5: 获取所有任务统计")
    all_stats = monitor.get_all_stats(days=1)
    print(f"  生成时间: {all_stats['generated_at']}")
    print(f"  任务总数: {len(all_stats['tasks'])}")
    print(f"  总执行次数: {all_stats['summary']['total_executions']}")
    print(f"  整体成功率: {all_stats['summary']['overall_success_rate']}%")
    
    print("\n✅ 任务监控系统测试完成")
    return True

def test_health_dashboard():
    """测试健康仪表盘功能"""
    print("\n" + "="*70)
    print("🧪 测试健康仪表盘")
    print("="*70)
    
    dashboard = HealthDashboard()
    
    # 测试1: 系统检查
    print("\n📋 测试1: 系统检查项")
    checks = [
        ("磁盘空间", dashboard.check_disk_space()),
        ("内存使用", dashboard.check_memory()),
        ("CPU负载", dashboard.check_cpu()),
        ("系统负载", dashboard.check_load_average()),
        ("工作区大小", dashboard.check_workspace_size()),
        ("Git状态", dashboard.check_git_status())
    ]
    
    for name, check in checks:
        emoji = "✅" if check.status == HealthStatus.HEALTHY else "⚠️" if check.status == HealthStatus.WARNING else "🚨"
        print(f"  {emoji} {name}: {check.message}")
    
    # 测试2: 部门健康检查
    print("\n📋 测试2: 部门健康检查")
    for dept_name, dept_info in dashboard.departments.items():
        dept_health = dashboard.check_department_health(dept_name, dept_info)
        emoji = "✅" if dept_health.status == HealthStatus.HEALTHY else "⚠️" if dept_health.status == HealthStatus.WARNING else "🚨"
        print(f"  {emoji} {dept_name}")
        print(f"     任务: {dept_health.tasks_total} | 健康:{dept_health.tasks_healthy} | 警告:{dept_health.tasks_warning} | 严重:{dept_health.tasks_critical}")
    
    # 测试3: 生成完整报告
    print("\n📋 测试3: 生成完整健康报告")
    report = dashboard.generate_report()
    print(f"  ✓ 报告生成完成")
    print(f"    整体状态: {report.overall_status.value}")
    print(f"    部门数: {len(report.departments)}")
    print(f"    系统检查项: {len(report.system_checks)}")
    
    # 测试4: 保存报告
    print("\n📋 测试4: 保存报告")
    json_file, md_file = dashboard.save_report(report)
    print(f"  ✓ JSON报告: {json_file}")
    print(f"  ✓ Markdown报告: {md_file}")
    
    print("\n✅ 健康仪表盘测试完成")
    return True

def test_alert_system():
    """测试告警系统"""
    print("\n" + "="*70)
    print("🧪 测试告警系统")
    print("="*70)
    
    monitor = TaskMonitor()
    monitor.register_default_tasks()
    
    # 模拟失败任务以触发告警
    print("\n📋 测试: 模拟失败任务触发告警")
    task_id = "memory-export"
    execution = monitor.simulate_task_execution(task_id, success=False)
    
    # 检查告警日志
    alert_dir = monitor.log_dir
    alert_files = list(alert_dir.glob("alert_*.log"))
    
    print(f"  ✓ 告警日志文件数: {len(alert_files)}")
    if alert_files:
        latest_alert = max(alert_files, key=lambda p: p.stat().st_mtime)
        print(f"  ✓ 最新告警: {latest_alert.name}")
        with open(latest_alert, 'r') as f:
            content = f.read()
            print(f"  ✓ 告警内容预览:")
            for line in content.split('\n')[:10]:
                if line.strip():
                    print(f"      {line}")
    
    print("\n✅ 告警系统测试完成")
    return True

def run_all_tests():
    """运行所有测试"""
    print("\n" + "🚀"*35)
    print("🚀 启动监控测试套件")
    print("🚀"*35)
    
    results = []
    
    try:
        results.append(("任务监控系统", test_task_monitor()))
    except Exception as e:
        print(f"\n❌ 任务监控系统测试失败: {e}")
        results.append(("任务监控系统", False))
    
    try:
        results.append(("健康仪表盘", test_health_dashboard()))
    except Exception as e:
        print(f"\n❌ 健康仪表盘测试失败: {e}")
        results.append(("健康仪表盘", False))
    
    try:
        results.append(("告警系统", test_alert_system()))
    except Exception as e:
        print(f"\n❌ 告警系统测试失败: {e}")
        results.append(("告警系统", False))
    
    # 测试总结
    print("\n" + "="*70)
    print("📊 测试总结")
    print("="*70)
    
    for name, passed in results:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"  {status}: {name}")
    
    all_passed = all(r[1] for r in results)
    
    if all_passed:
        print("\n🎉 所有测试通过！")
        return 0
    else:
        print("\n⚠️ 部分测试失败")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
