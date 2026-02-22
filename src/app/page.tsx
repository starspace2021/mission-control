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
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock4,
  MoreHorizontal,
  ChevronRight,
  Zap
} from "lucide-react";

// 导航配置
const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard },
  { id: "tasks", label: "任务", icon: ClipboardList },
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "memory", label: "记忆", icon: Brain },
];

// 模拟数据 - 现代控制台风格
const mockData = {
  stats: {
    activeTasks: 4,
    cronJobs: 11,
    memories: 15,
    successRate: 98.5,
    cpuUsage: 42,
    memoryUsage: 68,
    networkStatus: "online",
    uptime: "72h 34m",
  },
  tasks: [
    { id: "1", title: "非洲涉华情报收集", status: "running", priority: "high", progress: 75, nextRun: "20:00" },
    { id: "2", title: "Polymarket 监控", status: "running", priority: "high", progress: 60, nextRun: "20:00" },
    { id: "3", title: "QQ邮箱自动清理", status: "scheduled", priority: "medium", progress: 0, nextRun: "06:16" },
    { id: "4", title: "Mission Control 开发", status: "in_progress", priority: "medium", progress: 45, nextRun: null },
  ],
  events: [
    { id: "1", title: "非洲情报简报", time: "20:00", type: "cron", status: "pending" },
    { id: "2", title: "Polymarket 盘中简报", time: "20:00", type: "cron", status: "pending" },
    { id: "3", title: "Polymarket 夜盘简报", time: "22:00", type: "cron", status: "pending" },
  ],
  activities: [
    { id: "1", action: "非洲情报简报生成", time: "16:00", status: "success" },
    { id: "2", action: "Polymarket 简报生成", time: "17:00", status: "success" },
    { id: "3", action: "UI 自动迭代任务", time: "03:00", status: "scheduled" },
  ]
};

// 实时时钟
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-2xl font-semibold tracking-tight">
      {time.toLocaleTimeString('zh-CN', { hour12: false })}
    </div>
  );
}

// 状态图表组件
function StatusChart({ value, max = 100, color = "blue" }: { value: number; max?: number; color?: string }) {
  const percentage = (value / max) * 100;
  const colorMap: Record<string, string> = {
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B",
    red: "#EF4444",
  };
  
  return (
    <div className="w-full bg-[#1A1A24] rounded-full h-2 overflow-hidden">
      <motion.div 
        className="h-full rounded-full"
        style={{ backgroundColor: colorMap[color] }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white grid-bg">
      <div className="flex h-screen">
        {/* 侧边栏 */}
        <aside className="w-64 bg-[#111118] border-r border-white/10 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Mission Control</div>
                <div className="text-xs text-[#71717A]">任务控制中心</div>
              </div>
            </div>
          </div>

          {/* 导航 */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* 系统状态 */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#71717A]">系统状态</span>
              <span className="status-badge online">
                <span className="live-dot" />
                在线
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#71717A]">
                <span>CPU</span>
                <span>{mockData.stats.cpuUsage}%</span>
              </div>
              <StatusChart value={mockData.stats.cpuUsage} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#71717A]">
                <span>内存</span>
                <span>{mockData.stats.memoryUsage}%</span>
              </div>
              <StatusChart value={mockData.stats.memoryUsage} color="green" />
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto">
          {/* 顶部栏 */}
          <header className="h-16 border-b border-white/10 flex items-center justify-between px-8">
            <div>
              <h1 className="text-xl font-semibold">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-[#71717A]">运行时间</div>
                <div className="text-sm font-medium">{mockData.stats.uptime}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#71717A]">当前时间</div>
                <LiveClock />
              </div>
            </div>
          </header>

          {/* 页面内容 */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && <DashboardView key="dashboard" />}
              {activeTab === "tasks" && <TasksView key="tasks" />}
              {activeTab === "calendar" && <CalendarView key="calendar" />}
              {activeTab === "memory" && <MemoryView key="memory" />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// 仪表盘视图
function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 指标卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="进行中任务" value={mockData.stats.activeTasks} trend="+1" icon={ClipboardList} color="blue" />
        <MetricCard title="定时任务" value={mockData.stats.cronJobs} trend="stable" icon={Clock} color="purple" />
        <MetricCard title="记忆文档" value={mockData.stats.memories} trend="+3" icon={Brain} color="green" />
        <MetricCard title="成功率" value={`${mockData.stats.successRate}%`} trend="+0.5%" icon={Activity} color="cyan" />
      </div>

      {/* 主内容网格 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 任务面板 */}
        <div className="col-span-2 console-card">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
              活跃任务
            </h2>
            <button className="text-sm text-[#3B82F6] hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-white/5">
            {mockData.tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {task.status === "running" && <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />}
                    {task.status === "scheduled" && <Clock4 className="w-4 h-4 text-[#F59E0B]" />}
                    {task.status === "in_progress" && <div className="w-2 h-2 bg-[#3B82F6] rounded-full" />}
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <span className={`text-xs ${
                    task.priority === "high" ? "priority-high" :
                    task.priority === "medium" ? "priority-medium" : "priority-low"
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#71717A]">
                  <div className="flex-1">
                    <StatusChart value={task.progress} color={task.status === "running" ? "green" : "blue"} />
                  </div>
                  <span>{task.progress}%</span>
                  {task.nextRun && <span>下次: {task.nextRun}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日日程 */}
        <div className="console-card">
          <div className="p-5 border-b border-white/10">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8B5CF6]" />
              今日日程
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {mockData.events.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-12 text-center">
                  <div className="text-lg font-semibold">{event.time}</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-[#71717A]">定时任务</div>
                </div>
                <div className="w-2 h-2 bg-[#F59E0B] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 活动日志 */}
      <div className="console-card">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#06B6D4]" />
            最近活动
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {mockData.activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 py-2">
                {activity.status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <Clock4 className="w-5 h-5 text-[#F59E0B]" />
                )}
                <div className="flex-1">
                  <span className="text-sm">{activity.action}</span>
                </div>
                <span className="text-xs text-[#71717A]">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 指标卡片组件
function MetricCard({ title, value, trend, icon: Icon, color }: {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-[#3B82F6] bg-[#3B82F6]/10",
    purple: "text-[#8B5CF6] bg-[#8B5CF6]/10",
    green: "text-[#10B981] bg-[#10B981]/10",
    cyan: "text-[#06B6D4] bg-[#06B6D4]/10",
  };

  return (
    <motion.div 
      className="console-card p-5"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-medium ${
          trend.startsWith('+') ? 'text-[#10B981]' : 
          trend === 'stable' ? 'text-[#71717A]' : 'text-[#EF4444]'
        }`}>
          {trend}
        </span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label mt-1">{title}</div>
    </motion.div>
  );
}

// 任务视图
function TasksView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="console-card"
    >
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-semibold">任务管理</h2>
      </div>
      <div className="p-5">
        <p className="text-[#71717A]">任务管理功能开发中...</p>
      </div>
    </motion.div>
  );
}

// 日历视图
function CalendarView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="console-card"
    >
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-semibold">日程日历</h2>
      </div>
      <div className="p-5">
        <p className="text-[#71717A]">日历功能开发中...</p>
      </div>
    </motion.div>
  );
}

// 记忆视图
function MemoryView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="console-card"
    >
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-semibold">记忆库</h2>
      </div>
      <div className="p-5">
        <p className="text-[#71717A]">记忆库功能开发中...</p>
      </div>
    </motion.div>
  );
}
