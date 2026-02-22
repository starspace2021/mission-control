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
  X
} from "lucide-react";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import MemoryScreen from "./components/MemoryScreen";

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
      <div className="text-2xl font-semibold tracking-tight tabular-nums">
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

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(2);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white grid-bg">
      <div className="flex h-screen">
        {/* 侧边栏 */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#111118] border-r border-white/10 flex flex-col transition-all duration-300`}>
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Terminal className="w-5 h-5 text-white" />
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#3B82F6]/20 to-transparent text-[#3B82F6] border border-[#3B82F6]/20"
                      : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#3B82F6]' : ''}`} />
                  {!sidebarCollapsed && item.label}
                </button>
              );
            })}
          </nav>

          {/* 系统状态 */}
          <div className="p-3 border-t border-white/10 space-y-3">
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
          <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              {/* 面包屑 */}
              <div className="flex items-center gap-2 text-sm text-[#71717A]">
                <span>Mission Control</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{navItems.find(n => n.id === activeTab)?.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="pl-9 pr-4 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-sm text-white placeholder:text-[#52525B] focus:border-[#3B82F6]/50 focus:outline-none w-64 transition-all"
                />
              </div>
              
              {/* 通知 */}
              <button className="relative p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] flex items-center justify-center text-white font-medium">
                    {notifications}
                  </span>
                )}
              </button>
              
              {/* 设置 */}
              <button className="p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
              
              {/* 运行时间 */}
              <div className="text-right hidden lg:block">
                <div className="text-xs text-[#71717A]">运行时间</div>
                <div className="text-sm font-medium tabular-nums">{mockData.stats.uptime}</div>
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
  const chartData1 = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85];
  const chartData2 = [20, 30, 25, 35, 30, 40, 35, 45, 40, 50, 45, 55];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
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
        />
        <MetricCard 
          title="定时任务" 
          value={mockData.stats.cronJobs} 
          trend="stable" 
          trendUp={null}
          icon={Clock} 
          color="purple"
          chart={chartData2}
        />
        <MetricCard 
          title="记忆文档" 
          value={mockData.stats.memories} 
          trend="+3" 
          trendUp={true}
          icon={Brain} 
          color="green"
          chart={chartData1}
        />
        <MetricCard 
          title="成功率" 
          value={`${mockData.stats.successRate}%`} 
          trend="+0.5%" 
          trendUp={true}
          icon={Activity} 
          color="cyan"
          chart={chartData2}
        />
      </div>

      {/* 主内容网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务面板 */}
        <div className="lg:col-span-2 console-card overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">活跃任务</h2>
                <p className="text-xs text-[#71717A]">{mockData.tasks.filter(t => t.status === 'running').length} 个正在运行</p>
              </div>
            </div>
            <button className="text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">
              查看全部
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
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
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
                className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-all group cursor-pointer"
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
          <div className="p-4 border-t border-white/10">
            <button className="w-full py-2 text-sm text-[#71717A] hover:text-white transition-colors">
              查看完整日历 →
            </button>
          </div>
        </div>
      </div>

      {/* 活动日志 + 系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活动日志 */}
        <div className="console-card overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center">
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
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
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
  chart
}: {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean | null;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  chart: number[];
}) {
  const colorMap: Record<string, { bg: string; text: string; chart: string }> = {
    blue: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", chart: "#3B82F6" },
    purple: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]", chart: "#8B5CF6" },
    green: { bg: "bg-[#10B981]/10", text: "text-[#10B981]", chart: "#10B981" },
    cyan: { bg: "bg-[#06B6D4]/10", text: "text-[#06B6D4]", chart: "#06B6D4" },
  };

  const colors = colorMap[color];

  return (
    <motion.div 
      className="console-card p-5"
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex items-center gap-1">
          {trendUp !== null && (
            <TrendingUp className={`w-3 h-3 ${trendUp ? 'text-[#10B981]' : 'text-[#EF4444] rotate-180'}`} />
          )}
          <span className={`text-xs font-medium ${
            trendUp === true ? 'text-[#10B981]' : 
            trendUp === false ? 'text-[#EF4444]' :
            trend === 'stable' ? 'text-[#71717A]' : 'text-[#10B981]'
          }`}>
            {trend}
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="metric-value">{value}</div>
          <div className="metric-label mt-1">{title}</div>
        </div>
        <MiniChart data={chart} color={colors.chart} />
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
