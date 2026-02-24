# 团队状态模板

## 使用说明
当用户询问"团队状态"、"部门状态"、"团队情况"等时，使用以下模板回复。

---

```
🏢 团队状态总览
═══════════════════════════════════════════════════

👤 Human Director        🤖 Chief AI Officer
─────────────────        ─────────────────
Hourglass (雷利)          侧影 (贝加庞克)
状态: 在线               状态: 运行中
职责: 决策/审批          职责: 调度/协调

═══════════════════════════════════════════════════
📊 部门状态 (12 Subagents)
═══════════════════════════════════════════════════

🌍 Intel Dept (3)        🇺🇸 Policy Dept (2)
─────────────────        ─────────────────
罗布·路奇 [{intel_status}]       波风水门 [{policy_status}]
奈良鹿丸 [{intel_status2}]          宇智波鼬 [{policy_status2}]
比克 [{intel_status3}]              

💰 Market Dept (2)       🔧 Eng Dept (3)
─────────────────        ─────────────────
山治 [{market_status}]            弗兰奇 [{eng_status}]
布尔玛 [{market_status2}]           卡卡西 [{eng_status2}]
                                    天津饭 [{eng_status3}]

🧠 Memory & Admin (2)
─────────────────
乔巴 [{memory_status}]
克林 [{memory_status2}]

═══════════════════════════════════════════════════
📈 今日任务统计
═══════════════════════════════════════════════════

总任务:     {total_tasks}个
已完成:     {completed_tasks}个
进行中:     {in_progress_tasks}个
待执行:     {pending_tasks}个
成功率:     {success_rate}%

活跃部门:   {active_departments}
```

---

## 状态变量说明

| 变量 | 说明 | 可选值 |
|------|------|--------|
| intel_status | 罗布·路奇状态 | 运行中, 待命, 休息 |
| intel_status2 | 奈良鹿丸状态 | 运行中, 待命, 休息 |
| intel_status3 | 比克状态 | 运行中, 待命, 休息 |
| policy_status | 波风水门状态 | 运行中, 待命, 休息 |
| policy_status2 | 宇智波鼬状态 | 运行中, 待命, 休息 |
| market_status | 山治状态 | 运行中, 待命, 休息 |
| market_status2 | 布尔玛状态 | 运行中, 待命, 休息 |
| eng_status | 弗兰奇状态 | 运行中, 待命, 休息 |
| eng_status2 | 卡卡西状态 | 运行中, 待命, 休息 |
| eng_status3 | 天津饭状态 | 运行中, 待命, 休息 |
| memory_status | 乔巴状态 | 运行中, 待命, 休息 |
| memory_status2 | 克林状态 | 运行中, 待命, 休息 |
| total_tasks | 总任务数 | 数字 |
| completed_tasks | 已完成任务数 | 数字 |
| in_progress_tasks | 进行中任务数 | 数字 |
| pending_tasks | 待执行任务数 | 数字 |
| success_rate | 成功率 | 数字% |
| active_departments | 活跃部门列表 | 逗号分隔 |

---

## 部门职责速查

| 部门 | 职责 | 主要任务 |
|------|------|----------|
| Intel Dept | 非洲涉华情报收集、全球风险监控 | 非洲情报日报(5个/天) |
| Policy Dept | 美国对华政策监控、政策影响分析 | 美国对华政策日报(3个/天) |
| Market Dept | Polymarket分析、预测市场情报 | Polymarket日报(4个/天) |
| Eng Dept | UI开发、后端开发、QA | Mission Control UI |
| Memory & Admin | 记忆管理、系统维护 | 记忆导出、邮箱清理 |

---

## 更新记录
- 2026-02-24: 创建团队状态模板
