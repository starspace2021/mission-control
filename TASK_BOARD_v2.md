# 📋 OpenClaw Task Board - 增强版

**系统架构**: 文件版 (当前) → Next.js + Convex (目标架构)  
**最后更新**: 2026-02-22 11:21 (Asia/Shanghai)  
**更新频率**: 实时

---

## 🎯 任务看板 (Kanban View)

### 📥 待办 (To Do)
| ID | 任务 | 优先级 | 负责人 | 截止日期 |
|----|------|--------|--------|----------|
| - | - | - | - | - |

### 🔄 进行中 (In Progress)
| ID | 任务 | 优先级 | 负责人 | 开始时间 |
|----|------|--------|--------|----------|
| TASK-001 | 非洲涉华情报收集系统 | 🔴 高 | 侧影 (AI) | 2026-02-22 |
| TASK-002 | QQ邮箱自动清理 | 🟡 中 | 侧影 (AI) | 2026-02-22 |
| TASK-003 | Task Board 系统开发 | 🟡 中 | 侧影 (AI) | 2026-02-22 |

### ✅ 已完成 (Done)
| ID | 任务 | 负责人 | 完成时间 |
|----|------|--------|----------|
| TASK-000 | 卫星遥感研究报告 | 侧影 (AI) | 2026-02-22 06:00 |

---

## 👥 团队成员

| 角色 | 名称 | 职责 |
|------|------|------|
| 👤 用户 | Hourglass | 任务发起者、审批者、接收报告 |
| 🤖 AI助手 | 侧影 | 任务执行者、情报收集、报告生成 |

---

## 📊 自动化任务 (Cron Jobs)

| 任务ID | 名称 | 执行时间 | 负责人 | 状态 | 下次执行 |
|--------|------|----------|--------|------|----------|
| CRON-001 | 非洲情报-24小时简报 | 每天 07:00 | 侧影 | ✅ 正常 | 明天 07:00 |
| CRON-002 | 非洲情报-10:00简报 | 每天 16:00 | 侧影 | ✅ 正常 | 今天 16:00 |
| CRON-003 | 非洲情报-14:00简报 | 每天 20:00 | 侧影 | ✅ 正常 | 今天 20:00 |
| CRON-004 | 非洲情报-17:00简报 | 每天 23:00 | 侧影 | ✅ 正常 | 今天 23:00 |
| CRON-005 | 非洲情报-20:00简报 | 每天 02:00 | 侧影 | ✅ 正常 | 明天 02:00 |
| CRON-006 | QQ邮箱清理 | 每天 06:16 | 侧影 | ✅ 正常 | 明天 06:16 |

---

## 🏗️ Next.js + Convex 架构设计

### 技术栈
```
前端: Next.js 14 + React + Tailwind CSS
后端: Convex (实时数据库)
部署: Vercel
```

### 数据库 Schema (Convex)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    dueDate: v.optional(v.number()), // timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
    tags: v.array(v.string()),
    cronJobId: v.optional(v.string()), // 关联的定时任务
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_assignee_status", ["assignee", "status"]),

  taskHistory: defineTable({
    taskId: v.id("tasks"),
    action: v.string(), // "created", "updated", "status_changed"
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    performedBy: v.string(),
    performedAt: v.number(),
  }).index("by_task", ["taskId"]),

  cronJobs: defineTable({
    name: v.string(),
    schedule: v.string(), // cron expression
    enabled: v.boolean(),
    lastRunAt: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
    nextRunAt: v.optional(v.number()),
  }),
});
```

### API 设计 (Convex Functions)

```typescript
// convex/tasks.ts

// 查询所有任务
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query("tasks").withIndex("by_status", q => q.eq("status", args.status)).collect();
    }
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

// 创建任务
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    assignee: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
      creator: ctx.auth.userId || "system",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    });
    
    // 记录历史
    await ctx.db.insert("taskHistory", {
      taskId,
      action: "created",
      performedBy: ctx.auth.userId || "system",
      performedAt: Date.now(),
    });
    
    return taskId;
  },
});

// 更新任务状态
export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    
    const oldStatus = task.status;
    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    // 记录历史
    await ctx.db.insert("taskHistory", {
      taskId: args.taskId,
      action: "status_changed",
      oldValue: oldStatus,
      newValue: args.status,
      performedBy: ctx.auth.userId || "system",
      performedAt: Date.now(),
    });
    
    return args.taskId;
  },
});
```

### 前端组件 (Next.js)

```typescript
// app/components/TaskBoard.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskBoard() {
  const tasks = useQuery(api.tasks.list, {});
  const createTask = useMutation(api.tasks.create);
  const updateStatus = useMutation(api.tasks.updateStatus);

  const columns = [
    { id: "todo", title: "待办", color: "bg-gray-100" },
    { id: "in_progress", title: "进行中", color: "bg-blue-100" },
    { id: "review", title: "审核中", color: "bg-yellow-100" },
    { id: "done", title: "已完成", color: "bg-green-100" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {columns.map((column) => (
        <div key={column.id} className={`${column.color} rounded-lg p-4 min-w-[300px]`}>
          <h3 className="font-bold mb-4">{column.title}</h3>
          <div className="space-y-2">
            {tasks
              ?.filter((t) => t.status === column.id)
              .map((task) => (
                <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// TaskCard 组件
function TaskCard({ task, onStatusChange }: { task: any; onStatusChange: any }) {
  const assigneeEmoji = task.assignee === "hourglass" ? "👤" : "🤖";
  const priorityColor = {
    high: "text-red-600",
    medium: "text-yellow-600",
    low: "text-green-600",
  }[task.priority];

  return (
    <div className="bg-white rounded p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{task.title}</h4>
        <span className={priorityColor}>●</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>{assigneeEmoji} {task.assignee}</span>
        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
```

---

## 🔧 当前文件版使用指南

### 添加新任务
编辑此文件，在对应状态区域添加任务行：

```markdown
| TASK-XXX | 任务名称 | 🔴 高/🟡 中/🟢 低 | Hourglass/侧影 | YYYY-MM-DD |
```

### 更新任务状态
1. 将任务行从原区域剪切
2. 粘贴到新的状态区域
3. 更新时间戳

### 任务完成时
1. 移至"已完成"区域
2. 添加完成时间

---

## 📋 当前活跃任务清单

### Hourglass (用户) 的任务
暂无待办任务

### 侧影 (AI) 的任务
| ID | 任务 | 状态 | 优先级 |
|----|------|------|--------|
| CRON-001~006 | 非洲情报收集系统 | 🔄 运行中 | 🔴 高 |
| CRON-006 | QQ邮箱自动清理 | 🔄 运行中 | 🟡 中 |
| TASK-003 | Task Board 系统开发 | 🔄 进行中 | 🟡 中 |

---

## 🚀 下一步行动

1. **短期** (文件版)
   - [ ] 每次任务状态变化时更新此文件
   - [ ] 添加任务历史记录
   - [ ] 设置定时任务自动更新看板

2. **长期** (Next.js + Convex)
   - [ ] 初始化 Next.js 项目
   - [ ] 配置 Convex 数据库
   - [ ] 部署到 Vercel
   - [ ] 接入 OpenClaw API 实现实时同步

---

*Task Board v2.0 | 支持实时协作 | 最后更新: 2026-02-22 11:21*
