"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Brain,
  Terminal,
  Cpu,
  Wifi,
  Battery,
  Clock
} from "lucide-react";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import MemoryScreen from "./components/MemoryScreen";

const navItems = [
  { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard, color: "#00f5ff" },
  { id: "tasks", label: "TASKS", icon: ClipboardList, color: "#b829dd" },
  { id: "calendar", label: "CALENDAR", icon: Calendar, color: "#ff0080" },
  { id: "memory", label: "MEMORY", icon: Brain, color: "#00ff88" },
];

// 模拟数据
const mockStats = {
  activeTasks: 3,
  cronJobs: 6,
  memories: 15,
  successRate: 100,
  cpuUsage: 42,
  memoryUsage: 68,
  networkStatus: "ONLINE",
  uptime: "72h 34m",
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

// 实时时钟组件
function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="font-mono text-[#00f5ff] text-sm">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </div>
  );
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [glitchEffect, setGlitchEffect] = useState(false);

  // 随机故障效果
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 100);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white grid-bg relative overflow-hidden">
      {/* 背景光效 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00f5ff] rounded-full filter blur-[200px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#b829dd] rounded-full filter blur-[200px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff0080] rounded-full filter blur-[250px] opacity-5" />
      </div>

      {/* 扫描线 */}
      <div className="fixed inset-0 pointer-events-none scan-line opacity-40" />

      {/* 故障效果 */}
      {glitchEffect && (
        <div className="fixed inset-0 bg-[#00f5ff]/5 pointer-events-none z-50" />
      )}

      {/* 主内容 */}
      <div className="relative z-10 flex">
        {/* 侧边导航 */}
        <nav className="w-72 glass-card min-h-screen m-4 mr-0 flex flex-col hologram">
          {/* Logo区域 */}
          <div className="p-6 border-b border-white/10 relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#b829dd] flex items-center justify-center pulse-glow">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-white tracking-[0.2em] text-lg">MISSION</div>
                <div className="text-xs text-[#00f5ff] font-mono tracking-wider">CONTROL v2.0</div>
              </div>
            </div>
            
            {/* 装饰角标 */}
            <div className="corner-decoration top-left" />
            <div className="corner-decoration top-right" />
          </div>

          {/* 系统状态 */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-[#00ff88]" />
                <span className="text-[#00ff88]">{mockStats.networkStatus}</span>
              </div>
              <LiveClock />
            </div>            
            <div className="flex items-center justify-between mt-2 text-xs font-mono text-white/40">
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>CPU {mockStats.cpuUsage}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Battery className="w-3 h-3" />
                <span>MEM {mockStats.memoryUsage}%</span>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden ${
                    isActive 
                      ? "bg-gradient-to-r from-[#00f5ff]/20 to-transparent border-l-2 border-[#00f5ff]" 
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: isActive ? item.color : 'inherit' }}
                  />
                  <span 
                    className="font-mono text-sm tracking-wider"
                    style={{ color: isActive ? item.color : 'inherit' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 底部状态 */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] pulse-glow" />
                <span className="text-[#00ff88] font-mono">SYSTEM ONLINE</span>
              </div>
              <div className="text-white/30 font-mono">
                UP {mockStats.uptime}
              </div>
            </div>
            
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00f5ff] to-[#b829dd]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
          
          {/* 装饰角标 */}
          <div className="corner-decoration bottom-left" />
          <div className="corner-decoration bottom-right" />
        </nav>

        {/* 主面板 */}
        <main className="flex-1 p-6">
          {/* 头部 */}
          <header className="mb-6 flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold neon-text tracking-[0.15em]"
              >
                MISSION CONTROL
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mt-2"
              >
                <span className="text-[#00f5ff]/70 font-mono text-xs tracking-wider">
                  SYSTEM STATUS: ONLINE
                </span>
                <span className="text-white/20">|</span>
                <span className="text-[#b829dd]/70 font-mono text-xs tracking-wider">
                  TASK BOARD + CALENDAR + MEMORY
                </span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00f5ff]" />
                <LiveClock />
              </div>
            </div>
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
        <StatCard title="ACTIVE TASKS" value={stats.activeTasks} color="cyan" icon="⚡" trend="+2" />
        <StatCard title="CRON JOBS" value={stats.cronJobs} color="purple" icon="🔁" trend="stable" />
        <StatCard title="MEMORIES" value={stats.memories} color="pink" icon="🧠" trend="+5" />
        <StatCard title="SUCCESS RATE" value={`${stats.successRate}%`} color="green" icon="✓" trend="100%" />
      </div>

      {/* 主面板网格 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 任务看板预览 */}
        <div className="col-span-2 glass-card p-6 hologram relative">
          <div className="corner-decoration top-left" />
          <div className="corner-decoration top-right" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00f5ff] rounded-full pulse-glow" />
              <span className="tracking-wider">ACTIVE TASKS</span>
            </h2>
            <span className="text-xs font-mono text-white/40">{activeTasks.length} RUNNING</span>
          </div>
          
          <div className="space-y-3">
            {activeTasks.slice(0, 3).map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border-l-2 border-[#00f5ff] hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white group-hover:text-[#00f5ff] transition-colors">{task.title}</h3>
                  <span className="text-xs font-mono text-white/30">{task.assignee}</span>
                </div>
                <p className="text-sm text-white/50 mt-1">{task.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="corner-decoration bottom-left" />
          <div className="corner-decoration bottom-right" />
        </div>

        {/* 今日日程 */}
        <div className="glass-card p-6 hologram relative">
          <div className="corner-decoration top-left" />
          <div className="corner-decoration top-right" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#b829dd] rounded-full pulse-glow" />
              <span className="tracking-wider">TODAY</span>
            </h2>
            <span className="text-xs font-mono text-white/40">{events.length} EVENTS</span>
          </div>
          
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-[#00f5ff]/10 rounded border border-[#00f5ff]/30 hover:border-[#00f5ff]/60 transition-colors cursor-pointer"
              >
                <div className="text-sm font-medium text-[#00f5ff]">{event.title}</div>
                <div className="text-xs text-white/40 mt-1 font-mono">
                  {new Date(event.startTime).toLocaleTimeString('en-US', { hour12: false })}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="corner-decoration bottom-left" />
          <div className="corner-decoration bottom-right" />
        </div>
      </div>
    </motion.div>
  );
}

// 统计卡片组件
function StatCard({ title, value, color, icon, trend }: { 
  title: string; 
  value: number | string; 
  color: string;
  icon: string;
  trend: string;
}) {
  const colorMap: Record<string, { from: string; to: string; glow: string }> = {
    cyan: { from: "#00f5ff", to: "#0080ff", glow: "rgba(0, 245, 255, 0.3)" },
    purple: { from: "#b829dd", to: "#ff0080", glow: "rgba(184, 41, 221, 0.3)" },
    pink: { from: "#ff0080", to: "#ff4444", glow: "rgba(255, 0, 128, 0.3)" },
    green: { from: "#00ff88", to: "#00cc66", glow: "rgba(0, 255, 136, 0.3)" },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card p-6 relative overflow-hidden group cursor-pointer hologram"
    >
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />
      
      {/* 背景渐变 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${colors.glow} 0%, transparent 60%)`
        }}
      />

      <div className="relative z-10">
        {/* 图标和趋势 */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-3xl">{icon}</span>
          <span 
            className={`text-xs font-mono px-2 py-1 rounded bg-white/5 ${
              trend.startsWith('+') ? 'text-[#00ff88]' : 
              trend === 'stable' ? 'text-white/50' : 'text-white/50'
            }`}
          >
            {trend}
          </span>
        </div>
        
        {/* 数值 */}
        <div 
          className="text-4xl font-bold digital-number"
          style={{
            background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {value}
        </div>
        
        {/* 标题 */}
        <div className="text-sm text-white/50 mt-2 font-mono tracking-wider">
          {title}
        </div>
      </div>
      
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />
    </motion.div>
  );
}
