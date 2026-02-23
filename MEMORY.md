# 🧠 OpenClaw Memory System

**系统**: 长期记忆 + 每日记录 + 快速检索  
**最后更新**: 2026-02-22 22:33 (Asia/Shanghai)  
**架构**: 文件版 (当前) → Next.js + Convex (目标)

---

## 🏢 团队组织架构

**架构类型**: Human Director + Chief AI Officer + 5 Departments + 12 Subagents  
**架构文档**: [TEAM_STRUCTURE.md](./TEAM_STRUCTURE.md)  
**数字办公室**: [digital-office.html](./digital-office.html)

### 顶层角色

| 角色 | 名称 | 类型 | 职责 |
|------|------|------|------|
| Human Director | Hourglass | 人类 | 决策方向、设定目标、批准任务 |
| Chief AI Officer | 侧影 | AI | 任务调度、子代理管理、资源分配 |

### 执行层部门 (12 Subagents)

| 部门 | 角色 | 动漫代号 | 职责 |
|------|------|----------|------|
| **Intel** | Africa Intel Collector | 罗布·路奇 (海贼王) | 非洲情报收集 |
| **Intel** | Intel Analyst | 奈良鹿丸 (火影忍者) | 情报分析 |
| **Intel** | Risk Scoring Agent | 比克 (七龙珠) | 风险评估 |
| **Policy** | Policy Collector | 波风水门 (火影忍者) | 政策收集 |
| **Policy** | Policy Analyst | 宇智波鼬 (火影忍者) | 政策分析 |
| **Market** | Prediction Market Collector | 山治 (海贼王) | 市场数据收集 |
| **Market** | Market Signal Analyst | 布尔玛 (七龙珠) | 市场信号分析 |
| **Engineering** | UI Developer Agent | 弗兰奇 (海贼王) | UI开发 |
| **Engineering** | Backend Developer Agent | 卡卡西 (火影忍者) | 后端开发 |
| **Engineering** | QA Agent | 天津饭 (七龙珠) | 质量保证 |
| **Memory/Admin** | Memory Manager Agent | 乔巴 (海贼王) | 记忆管理 |
| **Memory/Admin** | System Maintenance Agent | 克林 (七龙珠) | 系统维护 |

---

## 📚 记忆文档库

### 🗂️ 长期记忆 (Long-term Memory)

| 文档 | 类型 | 最后更新 | 内容概要 |
|------|------|----------|----------|
| [AGENTS.md](./AGENTS.md) | 配置 | 2026-02-15 | 工作空间指南、记忆管理规则 |
| [IDENTITY.md](./IDENTITY.md) | 身份 | 2026-02-21 | 侧影的身份定义、性格特质 |
| [SOUL.md](./SOUL.md) | 灵魂 | 2026-02-15 | 人格锚点、品味、厌恶、立场 |
| [USER.md](./USER.md) | 用户 | 2026-02-21 | Hourglass 的用户画像 |
| [TOOLS.md](./TOOLS.md) | 工具 | 2026-02-15 | 本地工具配置、环境信息 |
| [BOOTSTRAP.md](./BOOTSTRAP.md) | 引导 | 2026-02-15 | 首次启动指南 |

### 📝 每日记忆 (Daily Logs)

| 日期 | 文档 | 关键事件 | 标签 |
|------|------|----------|------|
| 2026-02-22 | [2026-02-22.md](./memory/2026-02-22.md) | 卫星遥感报告、非洲情报系统、QQ邮箱配置、Task Board、美国对华政策监控系统 | #研究报告 #情报系统 #自动化 #对华政策 |

### 📄 项目文档 (Project Documents)

| 文档 | 类型 | 创建时间 | 标签 |
|------|------|----------|------|
| [research_report_satellite_economic_indicators.md](./research_report_satellite_economic_indicators.md) | 研究报告 | 2026-02-22 | #卫星遥感 #经济评估 #世界银行 |
| [africa_report_20260222.md](./africa_report_20260222.md) | 情报报告 | 2026-02-22 | #非洲 #涉华情报 #OSINT |
| [africa_china_intelligence_report_20260221.md](./africa_china_intelligence_report_20260221.md) | 情报报告 | 2026-02-21 | #非洲 #中国 #情报 |
| [satellite_emission_economic_research_report.md](./satellite_emission_economic_research_report.md) | 研究报告 | 2026-02-22 | #卫星遥感 #NO2 #经济 |

### 🎯 系统文档 (System Documents)

| 文档 | 类型 | 最后更新 | 说明 |
|------|------|----------|------|
| [MISSION_CONTROL.md](./MISSION_CONTROL.md) | 任务控制 | 2026-02-22 | Task Board + Calendar + Cron Jobs |
| [TASK_BOARD.md](./TASK_BOARD.md) | 任务看板 | 2026-02-22 | 初代任务看板 |
| [TASK_BOARD_v2.md](./TASK_BOARD_v2.md) | 任务看板 | 2026-02-22 | 增强版任务看板 |
| [us-china-data-sources.md](./memory/us-china-data-sources.md) | 数据源 | 2026-02-22 | 美国对华政策监控数据源清单 |
| [us-china-monitoring-accounts.md](./memory/us-china-monitoring-accounts.md) | 监控账号 | 2026-02-22 | Twitter/X 账号清单（备用） |

---

## 🔍 快速搜索

### 按标签搜索

| 标签 | 相关文档 |
|------|----------|
| #卫星遥感 | research_report_satellite_economic_indicators.md, satellite_emission_economic_research_report.md |
| #非洲情报 | africa_report_20260222.md, africa_china_intelligence_report_20260221.md |
| #自动化 | 2026-02-22.md (QQ邮箱清理、定时任务) |
| #研究报告 | research_report_satellite_economic_indicators.md, satellite_emission_economic_research_report.md |
| #OSINT | africa_report_20260222.md, africa_china_intelligence_report_20260221.md |
| #对华政策 | us-china-data-sources.md, us-china-monitoring-accounts.md |

### 按时间搜索

| 时间段 | 文档数量 | 关键事件 |
|--------|----------|----------|
| 2026-02-22 | 5+ | 卫星遥感报告完成、非洲情报系统上线、Task Board创建 |
| 2026-02-21 | 2+ | 首批非洲情报报告 |

### 按主题搜索

| 主题 | 相关记忆 |
|------|----------|
| **世界银行NO₂研究** | 2026-02-22.md, research_report_satellite_economic_indicators.md |
| **QQ邮箱配置** | 2026-02-22.md, MISSION_CONTROL.md |
| **非洲涉华情报** | africa_report_20260222.md, MISSION_CONTROL.md |
| **定时任务系统** | MISSION_CONTROL.md, TASK_BOARD_v2.md |
| **美国对华政策监控** | us-china-data-sources.md, us-china-monitoring-accounts.md, MISSION_CONTROL.md |

---

## 🏗️ Next.js + Convex Memory System 架构

### 数据库 Schema

```typescript
// convex/schema.ts (Memory 部分)

memories: defineTable({
  title: v.string(),
  content: v.string(),
  type: v.union(
    v.literal("long_term"),    // 长期记忆
    v.literal("daily"),        // 每日记录
    v.literal("project"),      // 项目文档
    v.literal("system")        // 系统文档
  ),
  tags: v.array(v.string()),
  relatedMemories: v.array(v.id("memories")),
  createdAt: v.number(),
  updatedAt: v.number(),
  sourceFile: v.optional(v.string()), // 原始文件路径
  importance: v.number(), // 1-10 重要性评分
})
  .index("by_type", ["type"])
  .index("by_tags", ["tags"])
  .index("by_importance", ["importance"])
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["type", "tags"],
  }),

memoryEmbeddings: defineTable({
  memoryId: v.id("memories"),
  embedding: v.array(v.number()), // 向量嵌入
})
  .index("by_memory", ["memoryId"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
  }),

memoryAccess: defineTable({
  memoryId: v.id("memories"),
  accessedAt: v.number(),
  accessCount: v.number(),
})
  .index("by_memory", ["memoryId"])
  .index("by_access_time", ["accessedAt"]),
```

### 前端组件

```typescript
// app/components/MemoryScreen.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MemoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const memories = useQuery(api.memories.search, {
    query: searchQuery,
    type: selectedType === "all" ? undefined : selectedType,
    tags: selectedTags,
  });

  const allTags = useQuery(api.memories.getAllTags);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">🧠 Memory Screen</h1>
        <p className="text-gray-600">搜索、浏览、管理所有记忆</p>
      </header>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索记忆..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">全部类型</option>
            <option value="long_term">长期记忆</option>
            <option value="daily">每日记录</option>
            <option value="project">项目文档</option>
            <option value="system">系统文档</option>
          </select>
        </div>

        {/* 标签筛选 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allTags?.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 记忆列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories?.map((memory) => (
          <MemoryCard key={memory._id} memory={memory} />
        ))}
      </div>
    </div>
  );
}

// MemoryCard 组件
function MemoryCard({ memory }: { memory: any }) {
  const typeIcons = {
    long_term: "🧠",
    daily: "📝",
    project: "📄",
    system: "⚙️",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{typeIcons[memory.type]}</span>
        <span className="text-sm text-gray-500">
          {new Date(memory.updatedAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="font-semibold mt-2">{memory.title}</h3>
      <p className="text-gray-600 text-sm mt-1 line-clamp-3">
        {memory.content.substring(0, 100)}...
      </p>
      <div className="flex flex-wrap gap-1 mt-3">
        {memory.tags.map((tag: string) => (
          <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// app/components/MemoryDetail.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MemoryDetail({ memoryId }: { memoryId: string }) {
  const memory = useQuery(api.memories.get, { id: memoryId });
  const relatedMemories = useQuery(api.memories.getRelated, { memoryId });

  if (!memory) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article className="bg-white rounded-lg shadow p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{memory.title}</h1>
          <div className="flex gap-4 text-sm text-gray-500 mt-2">
            <span>类型: {memory.type}</span>
            <span>更新: {new Date(memory.updatedAt).toLocaleString()}</span>
            <span>重要度: {memory.importance}/10</span>
          </div>
        </header>

        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans">
            {memory.content}
          </pre>
        </div>

        <footer className="mt-8 pt-4 border-t">
          <h3 className="font-semibold mb-2">标签</h3>
          <div className="flex gap-2">
            {memory.tags.map((tag: string) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      </article>

      {/* 相关记忆 */}
      {relatedMemories && relatedMemories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">相关记忆</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedMemories.map((related) => (
              <MemoryCard key={related._id} memory={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 搜索功能设计

### 全文搜索
- 基于 Convex 的 searchIndex
- 支持内容、标题、标签搜索
- 结果按相关性和重要性排序

### 语义搜索 (未来)
- 使用 OpenAI Embedding
- 向量相似度匹配
- 找到概念相关的记忆

### 筛选器
- 按类型筛选 (长期/每日/项目/系统)
- 按标签筛选
- 按时间范围筛选
- 按重要性筛选

---

## 📊 记忆统计

| 类型 | 数量 | 最后更新 |
|------|------|----------|
| 长期记忆 | 6 | 2026-02-21 |
| 每日记录 | 1 | 2026-02-22 |
| 项目文档 | 4 | 2026-02-22 |
| 系统文档 | 3 | 2026-02-22 |
| **总计** | **14** | - |

---

## 🔗 集成到 Mission Control

Memory Screen 作为 Mission Control 的第四个模块：

```
Mission Control
├── 📋 Task Board (任务看板)
├── 📅 Calendar (日历)
├── 🔁 Cron Jobs (定时任务)
└── 🧠 Memory Screen (记忆系统) ← 新增
```

---

*Memory System v1.0 | 支持全文搜索 | 集成 Mission Control*
