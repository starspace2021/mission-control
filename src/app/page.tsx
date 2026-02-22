"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Brain,
} from "lucide-react";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import MemoryScreen from "./components/MemoryScreen";
import StatsDashboard from "./components/StatsDashboard";

const navItems = [
  { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { id: "tasks", label: "TASKS", icon: ClipboardList },
  { id: "calendar", label: "CALENDAR", icon: Calendar },
  { id: "memory", label: "MEMORY", icon: Brain },
];

// 模拟数据
const mockStats = {
  activeTasks: 3,
  cronJobs: 6,
  memories: 15,
  successRate: 100,
};

const mockTasks = [
  { 
    _id: "1", 
    title: "非洲涉华情报收集系统", 
    description: "自动化收集非洲涉华新闻，每日5次简报",
    status: "in_progress", 
    priority: "high",
    assignee: "ceying",
    tags: ["情报", "自动化"],
    dueDate: null,
  },
  { 
    _id: "2", 
    title: "QQ邮箱自动清理", 
    description: "每日清理垃圾邮件和Apple广告",
    status: "in_progress", 
    priority: "medium",
    assignee: "ceying",
    tags: ["邮箱", "自动化"],
    dueDate: null,
  },
  { 
    _id: "3", 
    title: "Mission Control 系统开发", 
    description: "Next.js + Convex 任务管理系统",
    status: "in_progress", 
    priority: "medium",
    assignee: "ceying",
    tags: ["开发", "UI"],
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
  { 
    _id: "4", 
    title: "卫星遥感研究报告", 
    description: "世界银行NO₂经济评估研究综述",
    status: "done", 
    priority: "high",
    assignee: "ceying",
    tags: ["研究报告", "卫星遥感"],
    dueDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

const mockEvents = [
  { _id: "1", title: "非洲情报-24小时简报", startTime: Date.now(), type: "cron" },
  { _id: "2", title: "QQ邮箱清理", startTime: Date.now() + 3600000, type: "cron" },
];

const mockMemories = [
  { 
    _id: "1", 
    title: "卫星遥感研究报告", 
    content: "世界银行NO₂经济评估研究综述...",
    type: "project",
    tags: ["卫星遥感", "世界银行"],
    importance: 9,
    updatedAt: Date.now(),
  },
  { 
    _id: "2", 
    title: "非洲情报系统配置", 
    content: "定时任务配置和QQ邮箱设置...",
    type: "system",
    tags: ["情报", "配置"],
    importance: 8,
    updatedAt: Date.now(),
  },
];

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
      <div className="fixed inset-0 pointer-events-none scan-line" />

      {/* 主内容 */}
      <div className="relative z-10 flex">
        {/* 侧边导航 */}
        <nav className="w-64 glass-card min-h-screen m-4 mr-0 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#b829dd] flex items-center justify-center pulse-glow">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <div>
                <div className="font-bold text-white tracking-wider">MISSION</div>
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
                  onClick={() => setActiveTab(item.id)}
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
              <DashboardView 
                key="dashboard" 
                stats={mockStats}
                tasks={mockTasks}
                events={mockEvents}
              />
            )}
            {activeTab === "tasks" && (
              <TaskBoard key="tasks" tasks={mockTasks} />
            )}
            {activeTab === "calendar" && (
              <CalendarView key="calendar" events={mockEvents} />
            )}
            {activeTab === "memory" && (
              <MemoryScreen key="memory" memories={mockMemories} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// 仪表盘视图
function DashboardView({ stats, tasks, events }: { 
  stats: any; 
  tasks: any[];
  events: any[];
}) {
  const activeTasks = tasks.filter(t => t.status === "in_progress");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="ACTIVE TASKS" value={stats.activeTasks} color="cyan" icon="⚡" />
        <StatCard title="CRON JOBS" value={stats.cronJobs} color="purple" icon="🔁" />
        <StatCard title="MEMORIES" value={stats.memories} color="pink" icon="🧠" />
        <StatCard title="SUCCESS RATE" value={`${stats.successRate}%`} color="green" icon="✓" />
      </div>

      {/* 主面板网格 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 任务看板预览 */}
        <div className="col-span-2 glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00f5ff] rounded-full pulse-glow" />
            ACTIVE TASKS
          </h2>
          <div className="space-y-3">
            {activeTasks.slice(0, 3).map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border-l-2 border-[#00f5ff]"
              >
                <h3 className="font-medium text-white">{task.title}</h3>
                <p className="text-sm text-white/50 mt-1">{task.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 今日日程 */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#b829dd] rounded-full pulse-glow" />
            TODAY
          </h2>
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-[#00f5ff]/10 rounded border border-[#00f5ff]/30"
              >
                <div className="text-sm font-medium text-[#00f5ff]">{event.title}</div>
                <div className="text-xs text-white/40 mt-1">
                  {new Date(event.startTime).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
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
  const colorMap: Record<string, string> = {
    cyan: "from-[#00f5ff] to-[#0080ff]",
    purple: "from-[#b829dd] to-[#ff0080]",
    pink: "from-[#ff0080] to-[#ff4444]",
    green: "from-[#00ff88] to-[#00cc66]",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 relative overflow-hidden group cursor-pointer"
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
