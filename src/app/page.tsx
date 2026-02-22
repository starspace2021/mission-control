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
  Zap,
  Bell,
  Search,
  Settings,
  Menu,
  X,
  Sparkles,
  Command,
  Maximize2,
  Minimize2
} from "lucide-react";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import MemoryScreen from "./components/MemoryScreen";

// 导航配置
const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, shortcut: "1" },
  { id: "tasks", label: "任务", icon: ClipboardList, shortcut: "2" },
  { id: "calendar", label: "日历", icon: Calendar, shortcut: "3" },
  { id: "memory", label: "记忆", icon: Brain, shortcut: "4" },
];

// 模拟数据 - 现代控制台风格
const mockData = {
  stats: {
    activeTasks: 5,
    cronJobs: 14,
    memories: 16,
    successRate: 98.5,
    cpuUsage: 42,
    memoryUsage: 68,
    networkStatus: "online",
    uptime: "72h 34m",
  },
  tasks: [
    { id: "1", title: "非洲涉华情报收集", status: "running", priority: "high", progress: 75, nextRun: "20:00" },
    { id: "2", title: "Polymarket 监控", status: "running", priority: "high", progress: 60, nextRun: "20:00" },
    { id: "3", title: "美国对华政策监控", status: "running", priority: "high", progress: 80, nextRun: "20:00" },
    { id: "4", title: "QQ邮箱自动清理", status: "scheduled", priority: "medium", progress: 0, nextRun: "06:16" },
    { id: "5", title: "Mission Control 开发", status: "in_progress", priority: "medium", progress: 45, nextRun: null },
  ],
  events: [
    { id: "1", title: "非洲情报简报", time: "20:00", type: "cron", status: "pending" },
    { id: "2", title: "Polymarket 盘中简报", time: "20:00", type: "cron", status: "pending" },
    { id: "3", title: "美国对华政策晚间简报", time: "20:00", type: "cron", status: "pending" },
    { id: "4", title: "美国对华政策夜间简报", time: "00:00", type: "cron", status: "pending" },
    { id: "5", title: "美国对华政策日报", time: "07:00", type: "cron", status: "pending" },
  ],
  activities: [
    { id: "1", action: "非洲情报简报生成", time: "16:00", status: "success" },
    { id: "2", action: "Polymarket 简报生成", time: "17:00", status: "success" },
    { id: "3", action: "美国对华政策监控启动", time: "18:30", status: "success" },
    { id: "4", action: "UI 自动迭代任务", time: "03:00", status: "scheduled" },
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
    <div className="text-right">
      <div className="text-2xl font-semibold tracking-tight tabular-nums bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        {time.toLocaleTimeString('zh-CN', { hour12: false })}
      </div>
      <div className="text-xs text-[#71717A]">
        {time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
      </div>
    </div>
  );
}

// 状态图表组件
function StatusChart({ value, max = 100, color = "blue", animated = true }: { 
  value: number; 
  max?: number; 
  color?: string;
  animated?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorMap: Record<string, string> = {
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B",
    red: "#EF4444",
    purple: "#8B5CF6",
    cyan: "#06B6D4",
  };
  
  return (
    <div className="w-full bg-[#1A1A24] rounded-full h-1.5 overflow-hidden">
      <motion.div 
        className="h-full rounded-full"
        style={{ backgroundColor: colorMap[color] }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
      />
    </div>
  );
}

// 迷你图表组件
function MiniChart({ data, color = "#3B82F6" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${((value - min) / range) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// 环形进度组件
function CircularProgress({ value, size = 40, strokeWidth = 3, color = "#3B82F6" }: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
      </div>
    </div>
  );
}

// 趋势指示器组件
function TrendIndicator({ value, trend }: { value: string | number; trend: string }) {
  const isPositive = trend.startsWith('+');
  const isNeutral = trend === 'stable';
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isPositive ? 'bg-[#10B981]/10 text-[#10B981]' : 
        isNeutral ? 'bg-[#71717A]/10 text-[#71717A]' : 
        'bg-[#EF4444]/10 text-[#EF4444]'
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : 
         isNeutral ? <Activity className="w-3 h-3" /> : 
         <TrendingUp className="w-3 h-3 rotate-180" />}
        {trend}
      </div>
    </div>
  );
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key >= "1" && e.key <= "4") {
        const index = parseInt(e.key) - 1;
        if (index < navItems.length) {
          setActiveTab(navItems[index].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white grid-bg">
      <div className="flex h-screen">
        {/* 侧边栏 */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#111118]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300`}>
          {/* Logo */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <Terminal className="w-5 h-5 text-white relative z-10" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="font-semibold text-white">Mission Control</div>
                  <div className="text-xs text-[#71717A]">任务控制中心</div>
                </div>
              )}
            </div>
          </div>

          {/* 导航 */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-[#3B82F6]/20 to-transparent text-[#3B82F6] border border-[#3B82F6]/20 shadow-lg shadow-blue-500/10"
                      : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#3B82F6]' : ''}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <span className="text-xs text-[#52525B] opacity-0 group-hover:opacity-100 transition-opacity">
                        ⌘{item.shortcut}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 系统状态 */}
          <div className="p-3 border-t border-white/5 space-y-3">
            {!sidebarCollapsed && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#71717A]">系统状态</span>
                  <span className="status-badge online text-xs">
                    <span className="live-dot" />
                    在线
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      CPU
                    </span>
                    <span>{mockData.stats.cpuUsage}%</span>
                  </div>
                  <StatusChart value={mockData.stats.cpuUsage} color="blue" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      内存
                    </span>
                    <span>{mockData.stats.memoryUsage}%</span>
                  </div>
                  <StatusChart value={mockData.stats.memoryUsage} color="green" />
                </div>
              </>
            )}
            
            {/* 折叠按钮 */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto">
          {/* 顶部栏 */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              {/* 面包屑 */}
              <div className="flex items-center gap-2 text-sm text-[#71717A]">
                <span className="hover:text-white transition-colors cursor-pointer">Mission Control</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{navItems.find(n => n.id === activeTab)?.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 搜索 */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-sm text-[#71717A] hover:text-white hover:border-white/20 transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">搜索...</span>
                <span className="hidden md:inline text-xs px-1.5 py-0.5 bg-white/5 rounded text-[#52525B]">⌘K</span>
              </button>
              
              {/* 通知 */}
              <button className="relative p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-[#EF4444] to-[#EC4899] rounded-full text-[10px] flex items-center justify-center text-white font-medium">
                    {notifications}
                  </span>
                )}
              </button>
              
              {/* 设置 */}
              <button className="p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
              
              {/* 运行时间 */}
              <div className="text-right hidden lg:block pl-3 border-l border-white/10">
                <div className="text-xs text-[#71717A]">运行时间</div>
                <div className="text-sm font-medium tabular-nums text-[#10B981]">{mockData.stats.uptime}</div>
              </div>
              
              {/* 时钟 */}
              <LiveClock />
            </div>
          </header>

          {/* 页面内容 */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && <DashboardView key="dashboard" />}
              {activeTab === "tasks" && <TasksView key="tasks" />}
              {activeTab === "calendar" && <CalendarViewWrapper key="calendar" />}
              {activeTab === "memory" && <MemoryView key="memory" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 全局搜索弹窗 */}
      <AnimatePresence>
        {isSearchOpen && (
          <GlobalSearch onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// 全局搜索组件
function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl console-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <Search className="w-5 h-5 text-[#71717A]" />
          <input
            type="text"
            placeholder="搜索任务、记忆、事件..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-[#52525B] outline-none text-lg"
            autoFocus
          />
          <span className="text-xs text-[#52525B] px-2 py-1 bg-white/5 rounded">ESC</span>
        </div>
        <div className="p-4 max-h-[400px] overflow-auto">
          <div className="text-sm text-[#71717A] mb-3">最近访问</div>
          <div className="space-y-1">
            {["非洲涉华情报系统", "美国对华政策监控", "卫星遥感报告"].map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4 text-[#71717A]" />
                <span className="text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 仪表盘视图
function DashboardView() {
  const chartData1 = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85];
  const chartData2 = [20, 30, 25, 35, 30, 40, 35, 45, 40, 50, 45, 55];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 欢迎横幅 */}
      <div className="console-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/10 via-[#8B5CF6]/10 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-sm text-[#F59E0B] font-medium">早安</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">欢迎回来，Hourglass</h2>
          <p className="text-[#71717A]">系统运行正常，今日有 5 个定时任务待执行。</p>
        </div>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="进行中任务" 
          value={mockData.stats.activeTasks} 
          trend="+1" 
          trendUp={true}
          icon={ClipboardList} 
          color="blue"
          chart={chartData1}
          subtitle="较昨日增加"
        />
        <MetricCard 
          title="定时任务" 
          value={mockData.stats.cronJobs} 
          trend="stable" 
          trendUp={null}
          icon={Clock} 
          color="purple"
          chart={chartData2}
          subtitle="运行正常"
        />
        <MetricCard 
          title="记忆文档" 
          value={mockData.stats.memories} 
          trend="+3" 
          trendUp={true}
          icon={Brain} 
          color="green"
          chart={chartData1}
          subtitle="本周新增"
        />
        <MetricCard 
          title="成功率" 
          value={`${mockData.stats.successRate}%`} 
          trend="+0.5%" 
          trendUp={true}
          icon={Activity} 
          color="cyan"
          chart={chartData2}
          subtitle="系统健康"
        />
      </div>

      {/* 主内容网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务面板 */}
        <div className="lg:col-span-2 console-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">活跃任务</h2>
                <p className="text-xs text-[#71717A]">{mockData.tasks.filter(t => t.status === 'running').length} 个正在运行</p>
              </div>
            </div>
            <button className="text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {mockData.tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {task.status === "running" && (
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full" />
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-[#10B981] rounded-full animate-ping opacity-50" />
                      </div>
                    )}
                    {task.status === "scheduled" && <Clock4 className="w-4 h-4 text-[#F59E0B]" />}
                    {task.status === "in_progress" && <div className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full" />}
                    <span className="font-medium text-white group-hover:text-[#3B82F6] transition-colors">{task.title}</span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    task.priority === "high" ? "priority-high" :
                    task.priority === "medium" ? "priority-medium" : "priority-low"
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex-1">
                    <StatusChart value={task.progress} color={task.status === "running" ? "green" : "blue"} />
                  </div>
                  <span className="text-[#71717A] tabular-nums w-10">{task.progress}%</span>
                  {task.nextRun && (
                    <span className="text-xs text-[#71717A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.nextRun}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日日程 */}
        <div className="console-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">今日日程</h2>
                <p className="text-xs text-[#71717A]">{mockData.events.length} 个待执行</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {mockData.events.slice(0, 4).map((event, index) => (
              <motion.div 
                key={event.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-all group cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="w-12 text-center">
                  <div className="text-lg font-semibold text-white tabular-nums">{event.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white truncate group-hover:text-[#8B5CF6] transition-colors">{event.title}</div>
                  <div className="text-xs text-[#71717A]">定时任务</div>
                </div>
                <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" />
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <button className="w-full py-2 text-sm text-[#71717A] hover:text-white transition-colors flex items-center justify-center gap-1">
              查看完整日历
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 活动日志 + 系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活动日志 */}
        <div className="console-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#06B6D4]/5 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">最近活动</h2>
                <p className="text-xs text-[#71717A]">系统操作记录</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-1">
              {mockData.activities.map((activity, index) => (
                <motion.div 
                  key={activity.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 py-3 px-3 hover:bg-white/[0.02] rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.status === "success" ? "bg-[#10B981]/10" : "bg-[#F59E0B]/10"
                  }`}>
                    {activity.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Clock4 className="w-4 h-4 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white">{activity.action}</span>
                  </div>
                  <span className="text-xs text-[#71717A] tabular-nums">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 系统资源 */}
        <div className="console-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC4899]/20 to-[#EC4899]/5 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#EC4899]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">系统资源</h2>
                <p className="text-xs text-[#71717A]">实时性能监控</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-5">
            {/* CPU */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A1A1AA] flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  CPU 使用率
                </span>
                <span className="text-sm font-medium tabular-nums">{mockData.stats.cpuUsage}%</span>
              </div>
              <StatusChart value={mockData.stats.cpuUsage} color="blue" />
            </div>
            
            {/* 内存 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A1A1AA] flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  内存使用
                </span>
                <span className="text-sm font-medium tabular-nums">{mockData.stats.memoryUsage}%</span>
              </div>
              <StatusChart value={mockData.stats.memoryUsage} color="green" />
            </div>
            
            {/* 网络 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A1A1AA] flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  网络状态
                </span>
                <span className="text-sm font-medium text-[#10B981]">在线</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#1A1A24] rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full" />
                </div>
                <span className="text-xs text-[#71717A]">95ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 指标卡片组件
function MetricCard({ 
  title, 
  value, 
  trend, 
  trendUp,
  icon: Icon, 
  color,
  chart,
  subtitle
}: {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  chart: number[];
  subtitle?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; chart: string; gradient: string }> = {
    blue: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", chart: "#3B82F6", gradient: "from-[#3B82F6] to-[#60A5FA]" },
    purple: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]", chart: "#8B5CF6", gradient: "from-[#8B5CF6] to-[#A78BFA]" },
    green: { bg: "bg-[#10B981]/10", text: "text-[#10B981]", chart: "#10B981", gradient: "from-[#10B981] to-[#34D399]" },
    cyan: { bg: "bg-[#06B6D4]/10", text: "text-[#06B6D4]", chart: "#06B6D4", gradient: "from-[#06B6D4] to-[#22D3EE]" },
  };

  const colors = colorMap[color];

  return (
    <motion.div 
      className="console-card p-5 relative overflow-hidden group"
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <TrendIndicator value={value} trend={trend} />
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="metric-value">{value}</div>
            <div className="metric-label mt-1">{title}</div>
            {subtitle && <div className="text-xs text-[#52525B] mt-0.5">{subtitle}</div>}
          </div>
          <MiniChart data={chart} color={colors.chart} />
        </div>
      </div>
    </motion.div>
  );
}

// 任务视图
function TasksView() {
  const [tasks] = useState([
    { _id: "1", title: "非洲涉华情报收集", description: "自动收集并分析非洲涉华情报数据", status: "in_progress", priority: "high", assignee: "系统", tags: ["情报", "非洲"], dueDate: null },
    { _id: "2", title: "Polymarket 监控", description: "Polymarket 市场数据实时监控", status: "in_progress", priority: "high", assignee: "系统", tags: ["市场", "预测"], dueDate: null },
    { _id: "3", title: "美国对华政策监控", description: "追踪美国对华政策动态", status: "in_progress", priority: "high", assignee: "系统", tags: ["政策", "美国"], dueDate: null },
    { _id: "4", title: "QQ邮箱自动清理", description: "自动清理过期邮件", status: "todo", priority: "medium", assignee: "系统", tags: ["自动化", "邮件"], dueDate: Date.now() + 86400000 },
    { _id: "5", title: "Mission Control UI 优化", description: "改进用户界面和交互体验", status: "todo", priority: "medium", assignee: "开发者", tags: ["UI", "开发"], dueDate: Date.now() + 172800000 },
    { _id: "6", title: "卫星遥感报告", description: "生成卫星遥感经济分析报告", status: "done", priority: "high", assignee: "系统", tags: ["报告", "卫星"], dueDate: null },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <TaskBoard tasks={tasks} />
    </motion.div>
  );
}

// 日历视图
function CalendarViewWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <CalendarView />
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
    >
      <MemoryScreen />
    </motion.div>
  );
}
