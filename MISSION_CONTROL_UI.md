# 🎯 Mission Control - 科技感未来感设计

**设计风格**: Cyberpunk / Sci-Fi / Glassmorphism  
**配色方案**: 深色背景 + 霓虹蓝/紫/青  
**技术栈**: Next.js + Tailwind CSS + Framer Motion

---

## 🎨 设计系统

### 配色方案

```css
/* 主色调 */
--bg-primary: #0a0a0f;        /* 深空黑 */
--bg-secondary: #12121a;      /* 暗蓝黑 */
--bg-card: rgba(18, 18, 26, 0.8);  /* 玻璃态 */

/* 霓虹色 */
--neon-cyan: #00f5ff;         /* 青色 */
--neon-blue: #0080ff;         /* 蓝色 */
--neon-purple: #b829dd;       /* 紫色 */
--neon-pink: #ff0080;         /* 粉色 */
--neon-green: #00ff88;        /* 绿色 */

/* 文字 */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-muted: rgba(255, 255, 255, 0.5);

/* 边框 */
--border-glow: rgba(0, 245, 255, 0.3);
--border-subtle: rgba(255, 255, 255, 0.1);
```

### 视觉效果

1. **玻璃态 (Glassmorphism)**
   - 背景模糊: `backdrop-filter: blur(20px)`
   - 半透明: `background: rgba(18, 18, 26, 0.7)`
   - 边框发光: `border: 1px solid rgba(0, 245, 255, 0.2)`

2. **霓虹发光 (Neon Glow)**
   - 文字阴影: `text-shadow: 0 0 20px rgba(0, 245, 255, 0.5)`
   - 盒子阴影: `box-shadow: 0 0 30px rgba(0, 245, 255, 0.3)`

3. **渐变效果**
   - 背景渐变: `linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)`
   - 文字渐变: `linear-gradient(90deg, #00f5ff, #b829dd)`

4. **动画效果**
   - 扫描线: 模拟 CRT 显示器效果
   - 脉冲动画: 状态指示灯呼吸效果
   - 数据流动: 边框流光动画

---

## 💻 前端代码实现

### 全局样式 (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --neon-cyan: #00f5ff;
  --neon-blue: #0080ff;
  --neon-purple: #b829dd;
  --neon-pink: #ff0080;
  --neon-green: #00ff88;
}

body {
  background: #0a0a0f;
  color: #ffffff;
  font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(18, 18, 26, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 16px;
}

/* 霓虹文字 */
.neon-text {
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(0, 245, 255, 0.5);
}

/* 霓虹边框 */
.neon-border {
  border: 1px solid rgba(0, 245, 255, 0.3);
  box-shadow: 
    0 0 20px rgba(0, 245, 255, 0.2),
    inset 0 0 20px rgba(0, 245, 255, 0.05);
}

/* 扫描线效果 */
.scan-line {
  position: relative;
  overflow: hidden;
}

.scan-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

/* 脉冲动画 */
.pulse-glow {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(0, 245, 255, 0.6);
  }
}

/* 数据流动边框 */
.data-flow {
  position: relative;
  overflow: hidden;
}

.data-flow::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, var(--neon-cyan), var(--neon-purple), var(--neon-pink), var(--neon-cyan));
  background-size: 400% 400%;
  border-radius: inherit;
  z-index: -1;
  animation: gradient-flow 3s ease infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 网格背景 */
.grid-bg {
  background-image: 
    linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

### 主控台组件 (MissionControl.tsx)

```typescript
"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  CalendarView, 
  TaskBoard, 
  MemoryScreen, 
  StatsDashboard,
  Navigation 
} from "./components";

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg relative overflow-hidden">
      {/* 背景光效 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f5ff] rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#b829dd] rounded-full filter blur-[150px] opacity-20" />
      </div>

      {/* 扫描线 */}
      <div className="fixed inset-0 pointer-events-none scan-line opacity-30" />

      {/* 主内容 */}
      <div className="relative z-10 flex">
        {/* 侧边导航 */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 主面板 */}
        <main className="flex-1 p-8">
          {/* 头部 */}
          <header className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold neon-text tracking-wider"
            >
              MISSION CONTROL
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#00f5ff]/70 mt-2 font-mono text-sm"
            >
              SYSTEM STATUS: ONLINE // TASK BOARD + CALENDAR + MEMORY
            </motion.p>
          </header>

          {/* 内容区 */}
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <DashboardView key="dashboard" />
            )}
            {activeTab === "tasks" && (
              <TaskBoardView key="tasks" />
            )}
            {activeTab === "calendar" && (
              <CalendarView key="calendar" />
            )}
            {activeTab === "memory" && (
              <MemoryScreen key="memory" />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// 仪表盘视图
function DashboardView() {
  const stats = useQuery(api.dashboard.getStats);
  const todayEvents = useQuery(api.calendar.getTodayEvents);
  const activeTasks = useQuery(api.tasks.getByStatus, { status: "in_progress" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard 
          title="ACTIVE TASKS" 
          value={stats?.activeTasks || 0} 
          color="cyan"
          icon="⚡"
        />
        <StatCard 
          title="CRON JOBS" 
          value={stats?.cronJobs || 0} 
          color="purple"
          icon="🔁"
        />
        <StatCard 
          title="MEMORIES" 
          value={stats?.memories || 0} 
          color="pink"
          icon="🧠"
        />
        <StatCard 
          title="SUCCESS RATE" 
          value={`${stats?.successRate || 0}%`} 
          color="green"
          icon="✓"
        />
      </div>

      {/* 主面板网格 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 任务看板预览 */}
        <div className="col-span-2 glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00f5ff] rounded-full pulse-glow" />
            TASK BOARD
          </h2>
          <TaskPreview tasks={activeTasks} />
        </div>

        {/* 今日日程 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#b829dd] rounded-full pulse-glow" />
            TODAY
          </h2>
          <TimelinePreview events={todayEvents} />
        </div>
      </div>
    </motion.div>
  );
}

// 统计卡片组件
function StatCard({ title, value, color, icon }: { 
  title: string; 
  value: number | string; 
  color: string;
  icon: string;
}) {
  const colorMap = {
    cyan: "from-[#00f5ff] to-[#0080ff]",
    purple: "from-[#b829dd] to-[#ff0080]",
    pink: "from-[#ff0080] to-[#ff4444]",
    green: "from-[#00ff88] to-[#00cc66]",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${colorMap[color]} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-sm text-white/50 mt-1 font-mono">{title}</div>
    </motion.div>
  );
}
```

### 任务看板组件 (TaskBoard.tsx)

```typescript
"use client";

import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskBoard() {
  const tasks = useQuery(api.tasks.list, {});
  const updateStatus = useMutation(api.tasks.updateStatus);

  const columns = [
    { id: "todo", title: "TO DO", color: "#ff0080" },
    { id: "in_progress", title: "IN PROGRESS", color: "#00f5ff" },
    { id: "review", title: "REVIEW", color: "#b829dd" },
    { id: "done", title: "DONE", color: "#00ff88" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="glass-card min-h-[500px]">
          {/* 列标题 */}
          <div 
            className="p-4 border-b border-white/10"
            style={{ borderColor: `${column.color}30` }}
          >
            <h3 
              className="font-bold text-sm tracking-wider"
              style={{ color: column.color }}
            >
              {column.title}
            </h3>
            <div className="text-xs text-white/40 mt-1">
              {tasks?.filter(t => t.status === column.id).length || 0} TASKS
            </div>
          </div>

          {/* 任务列表 */}
          <div className="p-4 space-y-3">
            {tasks
              ?.filter((t) => t.status === column.id)
              .map((task, index) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  index={index}
                  onStatusChange={updateStatus}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, index, onStatusChange }: { 
  task: any; 
  index: number;
  onStatusChange: any;
}) {
  const priorityColors = {
    high: "#ff0080",
    medium: "#b829dd",
    low: "#00f5ff",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card p-4 cursor-pointer group relative overflow-hidden"
    >
      {/* 优先级指示条 */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: priorityColors[task.priority] }}
      />

      {/* 内容 */}
      <div className="pl-3">
        <h4 className="font-medium text-white group-hover:text-[#00f5ff] transition-colors">
          {task.title}
        </h4>
        <p className="text-sm text-white/50 mt-1 line-clamp-2">
          {task.description}
        </p>
        
        {/* 元信息 */}
        <div className="flex items-center gap-3 mt-3 text-xs">
          <span className="flex items-center gap-1 text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff]" />
            {task.assignee}
          </span>
          {task.dueDate && (
            <span className="text-white/30 font-mono">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* 标签 */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag: string) => (
              <span 
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

### 日历组件 (CalendarView.tsx)

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="glass-card p-6">
      {/* 头部控制 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                viewMode === mode 
                  ? "bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/50" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="text-2xl font-bold neon-text">
          {format(currentDate, "yyyy.MM")}
        </div>
      </div>

      {/* 周视图 */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className="text-center py-3 text-sm font-mono text-white/40 border-b border-white/10"
          >
            {day}
          </div>
        ))}
        
        {Array.from({ length: 7 }).map((_, index) => {
          const date = addDays(startOfWeek(currentDate), index);
          const dayEvents = events?.filter((e) =>
            isSameDay(new Date(e.startTime), date)
          );
          const isToday = isSameDay(date, new Date());

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`min-h-[150px] glass-card p-3 relative overflow-hidden ${
                isToday ? "border-[#00f5ff]/50" : ""
              }`}
            >
              {/* 日期 */}
              <div className={`text-lg font-bold mb-2 ${
                isToday ? "text-[#00f5ff]" : "text-white/70"
              }`}>
                {format(date, "d")}
                {isToday && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#00f5ff]/20 text-[#00f5ff]">
                    TODAY
                  </span>
                )}
              </div>

              {/* 事件 */}
              <div className="space-y-2">
                {dayEvents?.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const typeConfig = {
    cron: { color: "#00ff88", label: "CRON" },
    onetime: { color: "#00f5ff", label: "ONCE" },
    recurring: { color: "#b829dd", label: "LOOP" },
  };

  const config = typeConfig[event.type];

  return (
    <div 
      className="p-2 rounded text-xs cursor-pointer hover:brightness-110 transition-all"
      style={{ 
        backgroundColor: `${config.color}15`,
        borderLeft: `2px solid ${config.color}`
      }}
    >
      <div className="font-medium" style={{ color: config.color }}>
        {event.title}
      </div>
      <div className="text-white/40 mt-1 font-mono">
        {format(new Date(event.startTime), "HH:mm")}
      </div>
    </div>
  );
}
```

### 记忆屏幕组件 (MemoryScreen.tsx)

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Filter, Brain, FileText, Calendar, Settings } from "lucide-react";

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

  const typeIcons = {
    long_term: Brain,
    daily: Calendar,
    project: FileText,
    system: Settings,
  };

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <div className="glass-card p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="SEARCH MEMORY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder:text-white/30 focus:border-[#00f5ff]/50 
                         focus:outline-none transition-colors font-mono"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                       text-white focus:border-[#00f5ff]/50 focus:outline-none"
          >
            <option value="all">ALL TYPES</option>
            <option value="long_term">LONG TERM</option>
            <option value="daily">DAILY</option>
            <option value="project">PROJECT</option>
            <option value="system">SYSTEM</option>
          </select>
        </div>

        {/* 标签筛选 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allTags?.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${
                selectedTags.includes(tag)
                  ? "bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/50"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 记忆网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {memories?.map((memory, index) => {
            const Icon = typeIcons[memory.type];
            return (
              <MemoryCard 
                key={memory._id} 
                memory={memory} 
                index={index}
                icon={Icon}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MemoryCard({ memory, index, icon: Icon }: { 
  memory: any; 
  index: number;
  icon: any;
}) {
  const typeColors = {
    long_term: "#b829dd",
    daily: "#00f5ff",
    project: "#00ff88",
    system: "#ff0080",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* 类型指示 */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: typeColors[memory.type] }}
      />

      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${typeColors[memory.type]}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: typeColors[memory.type] }} />
        </div>
        <span className="text-xs text-white/30 font-mono">
          {new Date(memory.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* 内容 */}
      <h3 className="font-bold text-white group-hover:text-[#00f5ff] transition-colors mb-2">
        {memory.title}
      </h3>
      <p className="text-sm text-white/50 line-clamp-3">
        {memory.content.substring(0, 150)}...
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1 mt-4">
        {memory.tags.map((tag: string) => (
          <span 
            key={tag}
            className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 重要性指示 */}
      <div className="absolute bottom-4 right-4 flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i}
            className="w-1 h-3 rounded-sm"
            style={{ 
              backgroundColor: i < memory.importance 
                ? typeColors[memory.type] 
                : "rgba(255,255,255,0.1)"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
```

### 侧边导航组件 (Navigation.tsx)

```typescript
"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Brain,
  Settings 
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { id: "tasks", label: "TASKS", icon: ClipboardList },
  { id: "calendar", label: "CALENDAR", icon: Calendar },
  { id: "memory", label: "MEMORY", icon: Brain },
];

export function Navigation({ activeTab, onTabChange }: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}) {
  return (
    <nav className="w-64 glass-card min-h-screen m-4 mr-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#b829dd] flex items-center justify-center">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div>
            <div className="font-bold text-white">MISSION</div>
            <div className="text-xs text-[#00f5ff] font-mono">CONTROL v2.0</div>
          </div>
        </div>
      </div>

      {/* 导航项 */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? "bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-mono text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00f5ff]"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 底部状态 */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] pulse-glow" />
          <span className="font-mono">SYSTEM ONLINE</span>
        </div>
      </div>
    </nav>
  );
}
```

---

## 🎬 动画效果清单

| 效果 | 用途 | 实现方式 |
|------|------|----------|
| 页面切换 | 标签页切换 | Framer Motion AnimatePresence |
| 卡片悬停 | 任务/记忆卡片 | whileHover scale + y |
| 脉冲发光 | 状态指示灯 | CSS animation pulse |
| 扫描线 | 全局背景 | CSS pseudo-element |
| 数据流动 | 边框动画 | CSS gradient animation |
| 渐入效果 | 内容加载 | initial/animate opacity |
| 交错动画 | 列表加载 | staggerChildren |

---

## 📱 响应式设计

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .grid-cols-4 { grid-template-columns: 1fr; }
  .grid-cols-3 { grid-template-columns: 1fr; }
  .grid-cols-7 { grid-template-columns: repeat(7, 1fr); }
  
  nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    flex-direction: row;
    z-index: 100;
  }
}
```

---

*Mission Control UI v1.0 | Cyberpunk Design System | Ready for Development*
