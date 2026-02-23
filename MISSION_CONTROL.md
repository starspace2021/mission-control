# 🎯 OpenClaw Mission Control

**集成系统**: Task Board + Calendar + Cron Jobs + Memory Screen  
**最后更新**: 2026-02-22 11:37 (Asia/Shanghai)  
**架构**: 文件版 (当前) → Next.js + Convex (目标)

---

## 🧭 系统导航

```
Mission Control
├── 📋 Task Board    - 任务看板 (Kanban)
├── 📅 Calendar      - 日历视图
├── 🔁 Cron Jobs     - 定时任务
└── 🧠 Memory Screen - 记忆系统
```

---

## 📅 Calendar 日历视图

### 今日 (2026-02-22 周日)

| 时间 | 任务 | 类型 | 状态 | 输出渠道 |
|------|------|------|------|----------|
| 06:16 | QQ邮箱垃圾邮件清理 | 🔁 Cron | ✅ 已完成 | 飞书通知 |
| 07:00 | 非洲情报-24小时综合简报 | 🔁 Cron | ✅ 已完成 | 飞书+QQ邮箱 |
| 16:00 | 非洲情报-10:00简报 | 🔁 Cron | ⏳ 待执行 | 飞书+QQ邮箱 |
| 20:00 | 非洲情报-14:00简报 | 🔁 Cron | ⏳ 待执行 | 飞书+QQ邮箱 |
| 23:00 | 非洲情报-17:00简报 | 🔁 Cron | ⏳ 待执行 | 飞书+QQ邮箱 |

### 明日 (2026-02-23 周一)

| 时间 | 任务 | 类型 | 状态 |
|------|------|------|------|
| 02:00 | 非洲情报-20:00简报+汇总 | 🔁 Cron | ⏳ 待执行 |
| 06:16 | QQ邮箱垃圾邮件清理 | 🔁 Cron | ⏳ 待执行 |
| 07:00 | 非洲情报-24小时综合简报 | 🔁 Cron | ⏳ 待执行 |
| 16:00 | 非洲情报-10:00简报 | 🔁 Cron | ⏳ 待执行 |
| 20:00 | 非洲情报-14:00简报 | 🔁 Cron | ⏳ 待执行 |
| 23:00 | 非洲情报-17:00简报 | 🔁 Cron | ⏳ 待执行 |

### 本周概览

```
周日(2/22)  周一(2/23)  周二(2/24)  周三(2/25)  周四(2/26)  周五(2/27)  周六(2/28)
   📋          📋          📋          📋          📋          📋          📋
  6任务       6任务       6任务       6任务       6任务       6任务       6任务
```

---

## 📋 Task Board 任务看板

### 📥 待办 (To Do)
| ID | 任务 | 优先级 | 负责人 | 截止日期 |
|----|------|--------|--------|----------|
| - | - | - | - | - |

### 🔄 进行中 (In Progress)
| ID | 任务 | 优先级 | 负责人 | 开始时间 |
|----|------|--------|--------|----------|
| TASK-001 | 非洲涉华情报收集系统 | 🔴 高 | 侧影 (AI) | 2026-02-22 |
| TASK-002 | QQ邮箱自动清理 | 🟡 中 | 侧影 (AI) | 2026-02-22 |
| TASK-003 | Mission Control 系统开发 | 🟡 中 | 侧影 (AI) | 2026-02-22 |

### ✅ 已完成 (Done)
| ID | 任务 | 负责人 | 完成时间 |
|----|------|--------|----------|
| TASK-000 | 卫星遥感研究报告 | 侧影 (AI) | 2026-02-22 06:00 |

---

## 🔁 Cron Jobs 定时任务清单

| 任务ID | 名称 | 执行时间 | 负责人 | 状态 | 下次执行 | 最后执行 | 结果 |
|--------|------|----------|--------|------|----------|----------|------|
| CRON-001 | 非洲情报-24小时综合简报 | 每天 07:00 | 侧影 | ✅ 正常 | 明天 07:00 | 今天 07:00 | ✅ 成功 |
| CRON-002 | 非洲情报-10:00简报 | 每天 16:00 | 侧影 | ✅ 正常 | 今天 16:00 | - | - |
| CRON-003 | 非洲情报-14:00简报 | 每天 20:00 | 侧影 | ✅ 正常 | 今天 20:00 | - | - |
| CRON-004 | 非洲情报-17:00简报 | 每天 23:00 | 侧影 | ✅ 正常 | 今天 23:00 | - | - |
| CRON-005 | 非洲情报-20:00简报 | 每天 02:00 | 侧影 | ✅ 正常 | 明天 02:00 | 昨天 02:00 | ✅ 成功 |
| CRON-006 | QQ邮箱垃圾邮件清理 | 每天 06:16 | 侧影 | ✅ 正常 | 明天 06:16 | 今天 06:27 | ✅ 成功 |

---

## 👥 团队成员

| 角色 | 名称 | 职责 | 当前任务数 |
|------|------|------|-----------|
| 👤 用户 | **Hourglass** | 任务发起者、审批者、接收报告 | 0 |
| 🤖 AI助手 | **侧影** | 任务执行者、情报收集、报告生成 | 3 |

---

## 🏗️ Next.js + Convex 架构设计

### 数据库 Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 任务表
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    assignee: v.union(v.literal("hourglass"), v.literal("ceying")),
    creator: v.string(),
    dueDate: v.optional(v.number()),
    scheduledTime: v.optional(v.number()), // 定时执行时间
    isRecurring: v.boolean(), // 是否重复任务
    cronExpression: v.optional(v.string()), // cron表达式
    createdAt: v.number(),
    updatedAt: v.number(),
    tags: v.array(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_scheduled_time", ["scheduledTime"]),

  // 日历事件表
  calendarEvents: defineTable({
    taskId: v.id("tasks"),
    title: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    type: v.union(v.literal("cron"), v.literal("onetime"), v.literal("recurring")),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    outputChannel: v.array(v.string()), // ["feishu", "email"]
  })
    .index("by_start_time", ["startTime"])
    .index("by_task", ["taskId"]),

  // 执行历史
  executions: defineTable({
    taskId: v.id("tasks"),
    eventId: v.id("calendarEvents"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.union(v.literal("running"), v.literal("success"), v.literal("failed")),
    duration: v.optional(v.number()), // 毫秒
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_task", ["taskId"])
    .index("by_time", ["startedAt"]),
});
```

### 前端页面结构

```
app/
├── page.tsx                    # Mission Control 主控台
├── calendar/
│   ├── page.tsx               # 日历视图 (日/周/月)
│   └── layout.tsx
├── tasks/
│   ├── page.tsx               # 任务看板 (Kanban)
│   └── layout.tsx
├── components/
│   ├── MissionControl.tsx     # 主控台组件
│   ├── CalendarView.tsx       # 日历视图
│   ├── TaskBoard.tsx          # 任务看板
│   ├── TaskCard.tsx           # 任务卡片
│   ├── EventCard.tsx          # 日历事件卡片
│   ├── Timeline.tsx           # 时间线视图
│   └── StatsDashboard.tsx     # 统计仪表板
├── hooks/
│   ├── useTasks.ts            # 任务数据钩子
│   ├── useCalendar.ts         # 日历数据钩子
│   └── useRealtime.ts         # 实时更新钩子
└── lib/
    ├── utils.ts               # 工具函数
    └── constants.ts           # 常量定义
```

### 核心组件代码

```typescript
// app/components/MissionControl.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CalendarView } from "./CalendarView";
import { TaskBoard } from "./TaskBoard";
import { Timeline } from "./Timeline";
import { StatsDashboard } from "./StatsDashboard";

export function MissionControl() {
  const todayEvents = useQuery(api.calendar.getTodayEvents);
  const activeTasks = useQuery(api.tasks.getByStatus, { status: "in_progress" });
  const stats = useQuery(api.dashboard.getStats);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 顶部导航 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">🎯 Mission Control</h1>
        <p className="text-gray-600">Task Board + Calendar + Cron Jobs</p>
      </header>

      {/* 统计卡片 */}
      <StatsDashboard stats={stats} />

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* 左侧：今日日程 */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">📅 今日日程</h2>
          <Timeline events={todayEvents} />
        </div>

        {/* 中间：任务看板 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">📋 任务看板</h2>
          <TaskBoard tasks={activeTasks} />
        </div>
      </div>

      {/* 底部：完整日历 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">🗓️ 日历视图</h2>
        <CalendarView />
      </div>
    </div>
  );
}
```

```typescript
// app/components/CalendarView.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  
  const events = useQuery(api.calendar.getEvents, {
    startTime: startOfWeek(currentDate).getTime(),
    endTime: addDays(startOfWeek(currentDate), 7).getTime(),
  });

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* 视图切换 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded ${
                viewMode === mode ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
            >
              {mode === "day" ? "日" : mode === "week" ? "周" : "月"}
            </button>
          ))}
        </div>
        <div className="text-lg font-semibold">
          {format(currentDate, "yyyy年MM月")}
        </div>
      </div>

      {/* 周视图 */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div key={day} className="text-center font-medium py-2 bg-gray-50">
            {day}
          </div>
        ))}
        {Array.from({ length: 7 }).map((_, index) => {
          const date = addDays(startOfWeek(currentDate), index);
          const dayEvents = events?.filter((e) =>
            isSameDay(new Date(e.startTime), date)
          );

          return (
            <div
              key={index}
              className={`min-h-[120px] border rounded p-2 ${
                isSameDay(date, new Date()) ? "bg-blue-50 border-blue-300" : ""
              }`}
            >
              <div className="text-sm text-gray-500 mb-1">
                {format(date, "d")}
              </div>
              {dayEvents?.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const typeColors = {
    cron: "bg-green-100 text-green-800",
    onetime: "bg-blue-100 text-blue-800",
    recurring: "bg-purple-100 text-purple-800",
  };

  return (
    <div className={`text-xs p-1 rounded mb-1 ${typeColors[event.type]}`}>
      <div className="font-medium">{event.title}</div>
      <div className="text-gray-500">
        {format(new Date(event.startTime), "HH:mm")}
      </div>
    </div>
  );
}
```

---

## 🔧 当前文件版使用指南

### 添加定时任务到日历
1. 在 "Cron Jobs 定时任务清单" 表格中添加一行
2. 在 "Calendar 日历视图" 的对应日期添加事件
3. 更新 "Task Board" 中的任务状态

### 任务执行后更新
1. 在 Cron Jobs 表中更新 "最后执行" 和 "结果"
2. 在 Calendar 视图中标记为 "✅ 已完成"
3. 如有错误，记录到 "执行历史"

---

## 🧠 Memory Screen 记忆系统

### 记忆文档概览

| 类型 | 数量 | 最后更新 | 关键文档 |
|------|------|----------|----------|
| 长期记忆 | 6 | 2026-02-21 | AGENTS.md, IDENTITY.md, SOUL.md |
| 每日记录 | 1 | 2026-02-22 | 2026-02-22.md |
| 项目文档 | 4 | 2026-02-22 | 卫星遥感报告、非洲情报报告 |
| 系统文档 | 4 | 2026-02-22 | MISSION_CONTROL, TASK_BOARD |
| **总计** | **15** | - | - |

### 热门标签

`#卫星遥感` `#非洲情报` `#OSINT` `#自动化` `#研究报告` `#世界银行`

### 最近访问

| 文档 | 访问时间 | 类型 |
|------|----------|------|
| MISSION_CONTROL.md | 2026-02-22 11:37 | 系统 |
| MEMORY.md | 2026-02-22 11:37 | 系统 |
| 2026-02-22.md | 2026-02-22 11:30 | 每日 |

---

## 📊 系统统计

| 指标 | 数值 |
|------|------|
| 总任务数 | 3 |
| 定时任务数 | 6 |
| 今日待执行 | 3 |
| 已完成任务 | 1 |
| 运行成功率 | 100% |
| 记忆文档数 | 15 |
| 记忆标签数 | 6+ |

---

*Mission Control v2.0 | 集成 Task Board + Calendar + Memory | 实时更新*
