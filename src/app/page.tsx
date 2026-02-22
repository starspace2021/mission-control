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
  Clock,
  TrendingUp,
  AlertTriangle,
  Globe
} from "lucide-react";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import MemoryScreen from "./components/MemoryScreen";

const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard },
  { id: "tasks", label: "任务", icon: ClipboardList },
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "memory", label: "记忆", icon: Brain },
];

// 模拟数据
const mockStats = {
  activeTasks: 3,
  cronJobs: 6,
  memories: 15,
  successRate: 100,
  cpuUsage: 42,
  memoryUsage: 68,
  networkStatus: "在线",
  uptime: "72小时34分",
};

const mockTasks = [
  { 
    _id: "1", 
    title: "非洲涉华情报收集系统", 
    description: "自动化收集非洲涉华新闻，每日5次简报",
    status: "in_progress", 
    priority: "high",
    assignee: "侧影",
    tags: ["情报", "自动化"],
    dueDate: null,
  },
  { 
    _id: "2", 
    title: "QQ邮箱自动清理", 
    description: "每日清理垃圾邮件和Apple广告",
    status: "in_progress", 
    priority: "medium",
    assignee: "侧影",
    tags: ["邮箱", "自动化"],
    dueDate: null,
  },
  { 
    _id: "3", 
    title: "Mission Control 系统开发", 
    description: "Next.js + Convex 任务管理系统",
    status: "in_progress", 
    priority: "medium",
    assignee: "侧影",
    tags: ["开发", "UI"],
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
  { 
    _id: "4", 
    title: "卫星遥感研究报告", 
    description: "世界银行NO₂经济评估研究综述",
    status: "done", 
    priority: "high",
    assignee: "侧影",
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
    <div className="font-mono text-[#FFD700] text-lg font-bold tracking-wider">
      {time.toLocaleTimeString('zh-CN', { hour12: false })}
    </div>
  );
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white grid-bg relative overflow-hidden">
      {/* 背景光效 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFD700] rounded-full filter blur-[180px] opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#B8860B] rounded-full filter blur-[180px] opacity-10" />
      </div>

      {/* 扫描线 */}
      <div className="fixed inset-0 pointer-events-none scan-line" />

      {/* 主内容 */}
      <div className="relative z-10 flex">
        {/* 侧边导航 */}
        <nav className="w-80 glass-card min-h-screen m-4 mr-0 flex flex-col hologram">
          {/* Logo区域 */}
          <div className="p-8 border-b-2 border-[#FFD700]/30 relative">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center pulse-gold">
                  <Terminal className="w-8 h-8 text-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00C851] rounded-full animate-pulse border-2 border-black" />
              </div>
              <div>
                <div className="hero-text text-2xl">任务控制</div>
                <div className="text-sm text-[#FFD700] font-mono tracking-widest font-bold">MISSION CONTROL</div>
              </div>
            </div>
            
            <div className="corner-decoration top-left" />
            <div className="corner-decoration top-right" />
          </div>

          {/* 系统状态 */}
          <div className="px-6 py-4 border-b-2 border-[#FFD700]/20 bg-gradient-to-r from-[#FFD700]/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-[#00C851]" />
                <span className="text-[#00C851] font-bold text-lg">{mockStats.networkStatus}</span>
              </div>
              <LiveClock />
            </div>            
            <div className="flex items-center justify-between text-sm font-mono">
              <div className="flex items-center gap-2 text-[#FFD700]/80">
                <Cpu className="w-4 h-4" />
                <span>CPU {mockStats.cpuUsage}%</span>
              </div>
              <div className="flex items-center gap-2 text-[#FFD700]/80">
                <Battery className="w-4 h-4" />
                <span>内存 {mockStats.memoryUsage}%</span>
              </div>
            </div>
          </div>

          {/* 导航项 */}
          <div className="flex-1 p-4 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ x: 6 }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all relative overflow-hidden ${
                    isActive 
                      ? "bg-gradient-to-r from-[#FFD700]/20 to-transparent border-l-4 border-[#FFD700]" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: isActive ? '#FFD700' : 'inherit' }}
                  />
                  <span 
                    className="font-bold text-lg tracking-wider"
                    style={{ color: isActive ? '#FFD700' : 'inherit' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-4 w-2 h-2 rounded-full bg-[#FFD700]"
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 底部状态 */}
          <div className="p-6 border-t-2 border-[#FFD700]/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#00C851] pulse-gold" />
                <span className="text-[#00C851] font-bold text-lg">系统正常运行</span>
              </div>
            </div>
            <div className="text-white/50 font-mono text-sm">
              运行时间: {mockStats.uptime}
            </div>
            
            <div className="mt-4 h-2 bg-black/50 rounded-full overflow-hidden border border-[#FFD700]/20">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFE55C]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </div>
          
          <div className="corner-decoration bottom-left" />
          <div className="corner-decoration bottom-right" />
        </nav>

        {/* 主面板 */}
        <main className="flex-1 p-6">
          {/* 头部 */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-text"
              >
                任务控制中心
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mt-3"
              >
                <span className="text-[#FFD700] font-mono text-base font-bold tracking-wider">
                  系统状态: 在线
                </span>
                <span className="text-[#FFD700]/40">|</span>
                <span className="text-[#FFD700]/70 font-mono text-base">
                  任务看板 + 日历 + 记忆库
                </span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-card px-6 py-3 flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#FFD700]" />
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
        <StatCard title="进行中任务" value={stats.activeTasks} icon="⚡" trend="+2" />
        <StatCard title="定时任务" value={stats.cronJobs} icon="🔁" trend="stable" />
        <StatCard title="记忆文档" value={stats.memories} icon="🧠" trend="+5" />
        <StatCard title="成功率" value={`${stats.successRate}%`} icon="✓" trend="100%" />
      </div>

      {/* 主面板网格 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 任务看板预览 */}
        <div className="col-span-2 glass-card p-6 hologram relative">
          <div className="corner-decoration top-left" />
          <div className="corner-decoration top-right" />
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-bright">
              <span className="w-3 h-3 bg-[#FFD700] rounded-full pulse-gold" />
              <span className="gold-text">进行中任务</span>
            </h2>
            <span className="text-base font-mono text-[#FFD700]/60 font-bold">{activeTasks.length} 个任务</span>
          </div>
          
          <div className="space-y-4">
            {activeTasks.slice(0, 3).map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 bg-black/40 rounded-xl border-l-4 border-[#FFD700] hover:bg-black/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-white group-hover:text-[#FFD700] transition-colors">{task.title}</h3>
                  <span className="text-sm font-mono text-[#FFD700]/60">{task.assignee}</span>
                </div>
                <p className="text-base text-white/60 mt-2">{task.description}</p>
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
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-bright">
              <span className="w-3 h-3 bg-[#FFD700] rounded-full pulse-gold" />
              <span className="gold-text">今日日程</span>
            </h2>
            <span className="text-base font-mono text-[#FFD700]/60 font-bold">{events.length} 个事件</span>
          </div>
          
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-[#FFD700]/10 rounded-xl border-2 border-[#FFD700]/40 hover:border-[#FFD700] transition-colors cursor-pointer"
              >
                <div className="text-lg font-bold text-[#FFD700]">{event.title}</div>
                <div className="text-sm text-white/50 mt-2 font-mono">
                  {new Date(event.startTime).toLocaleTimeString('zh-CN', { hour12: false })}
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
function StatCard({ title, value, icon, trend }: { 
  title: string; 
  value: number | string; 
  icon: string;
  trend: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="glass-card p-6 relative overflow-hidden group cursor-pointer hologram"
    >
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />
      
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-4xl">{icon}</span>
          <span className={`text-sm font-mono px-3 py-1 rounded-lg bg-black/50 font-bold ${
            trend.startsWith('+') ? 'text-[#00C851]' : 
            trend === 'stable' ? 'text-[#FFD700]/60' : 'text-white/60'
          }`}>
            {trend}
          </span>
        </div>
        
        <div className="text-5xl font-bold digital-number gold-text">
          {value}
        </div>
        
        <div className="text-lg text-white/70 mt-3 font-bold tracking-wider">
          {title}
        </div>
      </div>
      
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />
    </motion.div>
  );
}
