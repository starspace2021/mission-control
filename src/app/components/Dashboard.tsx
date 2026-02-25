'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckCircle2,
  Activity,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  PieChart,
  Cpu,
  Globe,
  Database,
  Wifi,
  Shield,
  Flame,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Layers,
  Terminal,
  Server,
  HardDrive,
  MemoryStick,
  Network,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  Bell,
  Settings
} from 'lucide-react';
import { taskTrend, departmentLoad, tasks, agents } from '@/data/mockData';

// ========== 类型定义 ==========
interface Metric {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ElementType;
  trend: { value: number; direction: 'up' | 'down' | 'stable' };
}

interface SystemMetric {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
  color: string;
}

interface Activity {
  text: string;
  time: string;
  icon: React.ElementType;
  color: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

// ========== 数据 ==========
const METRICS: Metric[] = [
  { label: 'Online Agents', value: '6', sub: '2 offline', color: '#0ea5e9', icon: Users, trend: { value: 12, direction: 'up' } },
  { label: 'Task Completion', value: '78%', sub: '+12% today', color: '#10b981', icon: CheckCircle2, trend: { value: 5, direction: 'up' } },
  { label: 'System Health', value: '99.2%', sub: 'All systems go', color: '#8b5cf6', icon: Activity, trend: { value: 0.3, direction: 'up' } },
  { label: 'Active Tasks', value: '12', sub: '3 pending', color: '#f59e0b', icon: Zap, trend: { value: 2, direction: 'down' } },
];

const SYSTEM_METRICS: SystemMetric[] = [
  { label: 'CPU Usage', value: 42, suffix: '%', icon: Cpu, color: '#0ea5e9' },
  { label: 'Memory', value: 68, suffix: '%', icon: Database, color: '#8b5cf6' },
  { label: 'Network', value: 95, suffix: 'ms', icon: Wifi, color: '#10b981' },
  { label: 'Security', value: 100, suffix: '%', icon: Shield, color: '#f59e0b' },
];

const RECENT_ACTIVITIES: Activity[] = [
  { text: 'Africa Intel report generated', time: '2m ago', icon: CheckCircle2, color: '#10b981', type: 'success' },
  { text: 'US-China policy monitoring started', time: '15m ago', icon: Activity, color: '#3b82f6', type: 'info' },
  { text: 'Polymarket briefing created', time: '32m ago', icon: BarChart3, color: '#a855f7', type: 'info' },
  { text: 'System alert: API rate limit at 85%', time: '1h ago', icon: AlertTriangle, color: '#f59e0b', type: 'warning' },
  { text: 'QQ Mail cleanup completed', time: '2h ago', icon: CheckCircle2, color: '#10b981', type: 'success' },
  { text: 'Memory system backup finished', time: '3h ago', icon: Database, color: '#06b6d4', type: 'success' },
];

const ALERTS: Alert[] = [
  { id: '1', title: 'High CPU Usage', message: 'Intel Collector Agent using 85% CPU', severity: 'medium', timestamp: '5m ago' },
  { id: '2', title: 'API Rate Limit', message: 'Twitter API approaching rate limit', severity: 'high', timestamp: '12m ago' },
  { id: '3', title: 'Memory Warning', message: 'System memory at 78% capacity', severity: 'low', timestamp: '1h ago' },
];

const AGENT_STATUS = [
  { name: 'Africa Intel', status: 'working', progress: 65, color: '#0ea5e9' },
  { name: 'Policy Monitor', status: 'online', progress: 0, color: '#8b5cf6' },
  { name: 'Market Analyst', status: 'online', progress: 0, color: '#10b981' },
  { name: 'Risk Scoring', status: 'offline', progress: 0, color: '#71717a' },
  { name: 'Memory Manager', status: 'working', progress: 42, color: '#f59e0b' },
  { name: 'System Maint', status: 'online', progress: 0, color: '#06b6d4' },
];

// ========== 子组件 ==========

function CountUp({ value, duration = 1.5, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span className="tabular-nums">{displayValue}{suffix}</span>;
}

function TrendIndicator({ trend }: { trend: { value: number; direction: string } }) {
  const isPositive = trend.direction === 'up';
  const isNeutral = trend.direction === 'stable';

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${
      isPositive ? 'bg-[#10b981]/10 text-[#10b981]' :
      isNeutral ? 'bg-[#6b6b78]/10 text-[#6b6b78]' :
      'bg-[#ef4444]/10 text-[#ef4444]'
    }`}>
      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> :
       isNeutral ? <Minus className="w-3.5 h-3.5" /> :
       <ArrowDownRight className="w-3.5 h-3.5" />}
      {trend.value}%
    </div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-t-md"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${((value - min) / range) * 100}%` }}
          transition={{ delay: i * 0.04, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      ))}
    </div>
  );
}

function CircularProgress({ value, size = 44, strokeWidth = 4, color = "#4A7BFF" }: {
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
          stroke="rgba(255,255,255,0.08)"
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
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>
          <CountUp value={value} suffix="%" />
        </span>
      </div>
    </div>
  );
}

function DataStreamBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden opacity-30">
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function WelcomeBanner() {
  const [greeting, setGreeting] = useState('早安');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早安');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-v2 p-6 relative overflow-hidden"
    >
      <DataStreamBar />
      
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/5 via-[#8b5cf6]/3 to-transparent" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#0ea5e9]/10 via-[#8b5cf6]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#10b981]/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-sm text-[#f59e0b] font-medium">{greeting}</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20"
              whileHover={{ scale: 1.02 }}
            >
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              <span className="text-sm text-[#10b981] font-medium">系统运行正常</span>
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold mb-2">欢迎回来，Hourglass</h2>
          <p className="text-[#a1a1aa]">今日有 5 个定时任务待执行，2 个高优先级警报需要关注。</p>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="text-center">
            <motion.div 
              className="text-4xl font-bold text-[#10b981]"
              key={currentTime.getSeconds()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              98.5%
            </motion.div>
            <div className="text-sm text-[#a1a1aa] mt-1">系统健康度</div>
          </div>
          <div className="w-px h-16 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0ea5e9] tabular-nums">
              {currentTime.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-[#a1a1aa] mt-1">当前时间</div>
          </div>
          <div className="w-px h-16 bg-white/10" />
          <div className="text-center">
            <div className="text-4xl font-bold text-[#8b5cf6]">6</div>
            <div className="text-sm text-[#a1a1aa] mt-1">在线代理</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ metric, index }: { metric: Metric; index: number }) {
  const Icon = metric.icon;
  const chartData = useMemo(() => 
    [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85].map(v => v + Math.random() * 20),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card card-interactive p-5 relative overflow-hidden group"
    >
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(to right, ${metric.color}, ${metric.color}60, transparent)` }}
      />
      
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${metric.color}20, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="p-3 rounded-xl"
            style={{ background: `${metric.color}15` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="w-5 h-5" style={{ color: metric.color }} />
          </motion.div>
          <TrendIndicator trend={metric.trend} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="text-sm font-medium text-white mb-1">{metric.label}</div>
            <div className="text-xs text-[#a1a1aa]">{metric.sub}</div>
          </div>
          <MiniChart data={chartData} color={metric.color} />
        </div>
      </div>
    </motion.div>
  );
}

function SystemMetricCard({ metric, index }: { metric: SystemMetric; index: number }) {
  const Icon = metric.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25 + index * 0.06, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="card p-4"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="p-2.5 rounded-xl"
          style={{ background: `${metric.color}12` }}
          whileHover={{ scale: 1.1 }}
        >
          <Icon className="w-4 h-4" style={{ color: metric.color }} />
        </motion.div>
        <div className="flex-1">
          <div className="text-xs text-[#8a8a96] mb-0.5">{metric.label}</div>
          <span className="text-lg font-bold text-white">
            <CountUp value={metric.value} suffix={metric.suffix} />
          </span>
        </div>
        <CircularProgress value={metric.value} size={40} strokeWidth={3} color={metric.color} />
      </div>
    </motion.div>
  );
}

function TaskTrendChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card p-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/5 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#0ea5e9]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Task Trend (7 days)</h3>
            <p className="text-xs text-[#a1a1aa]">任务完成情况统计</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
            <span className="text-[#a1a1aa]">已完成</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span className="text-[#a1a1aa]">新建</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-end gap-2 h-28">
        {taskTrend.map((day, i) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex gap-1 items-end justify-center h-20">
              <motion.div
                className="flex-1 rounded-t-lg min-w-[6px] relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(to top, #0ea5e9, #0ea5e980)'
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.completed / 25) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
              </motion.div>
              <motion.div
                className="flex-1 rounded-t-lg min-w-[6px] relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(to top, #10b981, #10b98180)'
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.created / 25) * 100}%` }}
                transition={{ delay: i * 0.05 + 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
              </motion.div>
            </div>
            <span className="text-[11px] text-[#8a8a96] font-medium">{day.day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DepartmentLoadChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 flex items-center justify-center">
          <PieChart className="w-5 h-5 text-[#a855f7]" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Department Load</h3>
          <p className="text-xs text-[#a1a1aa]">各部门工作负载</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {departmentLoad.map((dept, i) => (
          <div key={dept.name} className="group">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dept.color, boxShadow: `0 0 10px ${dept.color}` }}
              />
              <span className="text-sm text-[#e4e4e7] flex-1">{dept.name}</span>
              <span className="text-sm font-bold text-white tabular-nums">
                <CountUp value={dept.value} suffix="%" />
              </span>
            </div>
            <div className="h-2 bg-[#1e1e28] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(to right, ${dept.color}, ${dept.color}80)`,
                  boxShadow: `0 0 12px ${dept.color}50`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${dept.value}%` }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TrafficMonitor() {
  const [metrics, setMetrics] = useState({
    requests: 1247,
    latency: 98,
    uptime: 99.9
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        requests: prev.requests + Math.floor(Math.random() * 20 - 10),
        latency: Math.max(50, Math.min(150, prev.latency + Math.floor(Math.random() * 10 - 5))),
        uptime: 99.9
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-[#10b981]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">实时流量监控</h3>
          <p className="text-xs text-[#a1a1aa]">数据请求/秒</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
          <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
          <span className="text-xs text-[#10b981] font-medium">Live</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <div className="text-xl font-bold text-white tabular-nums">{(metrics.requests / 1000).toFixed(1)}K</div>
          <div className="text-xs text-[#a1a1aa] mt-1">请求/分</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#10b981] tabular-nums">{metrics.latency}ms</div>
          <div className="text-xs text-[#a1a1aa] mt-1">平均延迟</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#0ea5e9] tabular-nums">{metrics.uptime}%</div>
          <div className="text-xs text-[#a1a1aa] mt-1">可用性</div>
        </div>
      </div>

      {/* 实时流量图表 */}
      <div className="mt-4 h-16 flex items-end gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-[#10b981] to-[#10b981]/50 rounded-t"
            initial={{ height: '20%' }}
            animate={{ 
              height: `${20 + Math.random() * 60}%`,
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.05
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
            <p className="text-xs text-[#a1a1aa]">系统操作记录</p>
          </div>
        </div>
        <button className="text-xs text-[#0ea5e9] hover:text-[#38bdf8] transition-colors flex items-center gap-1">
          查看全部 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-1">
        {RECENT_ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
            >
              <motion.div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${a.color}15` }}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className="w-4 h-4" style={{ color: a.color }} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white block truncate group-hover:text-[#3b82f6] transition-colors">{a.text}</span>
                <span className="text-xs text-[#52525B]">{a.type}</span>
              </div>
              <span className="text-xs text-[#a1a1aa] tabular-nums whitespace-nowrap">{a.time}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SystemResources() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ec4899]/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-[#ec4899]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">System Resources</h3>
            <p className="text-xs text-[#8a8a96]">实时性能监控</p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-[#8a8a96]" />
        </button>
      </div>
      
      <div className="space-y-4">
        {[
          { label: 'CPU Usage', value: 42, color: '#3b82f6', icon: Cpu, max: 100 },
          { label: 'Memory', value: 68, color: '#10b981', icon: Database, max: 128 },
          { label: 'Disk I/O', value: 35, color: '#f59e0b', icon: HardDrive, max: 1000 },
          { label: 'Network', value: 78, color: '#a855f7', icon: Network, max: 1000 },
        ].map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#b4b4be] flex items-center gap-2">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>
                  <CountUp value={item.value} />
                </span>
                <span className="text-xs text-[#52525B]">/ {item.max}{item.label === 'Memory' ? 'GB' : item.label === 'Disk I/O' || item.label === 'Network' ? 'MB/s' : '%'}</span>
              </div>
            </div>
            <div className="h-2 bg-[#1e1e28] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(to right, ${item.color}, ${item.color}80)`,
                  boxShadow: `0 0 12px ${item.color}50`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.max) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function HeatmapChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 12 }, (_, i) => i * 2);

  const getIntensity = (day: number, hour: number) => {
    const base = Math.sin(day * 0.5 + hour * 0.3) * 0.5 + 0.5;
    const random = Math.random() * 0.3;
    return Math.min(base + random, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Activity Heatmap</h3>
            <p className="text-xs text-[#8a8a96]">系统活跃度分布</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="flex">
            <div className="w-12" />
            {hours.map(h => (
              <div key={h} className="flex-1 text-[10px] text-[#8a8a96] text-center font-medium">
                {h}:00
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1 mt-1.5">
              <div className="w-10 text-[11px] text-[#8a8a96] font-medium">{day}</div>
              <div className="flex-1 flex gap-1">
                {hours.map((hour, hourIndex) => {
                  const intensity = getIntensity(dayIndex, hourIndex);
                  return (
                    <motion.div
                      key={hour}
                      className="flex-1 h-6 rounded heatmap-cell"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${0.1 + intensity * 0.9})`,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (dayIndex * 12 + hourIndex) * 0.003, duration: 0.3 }}
                      title={`${day} ${hour}:00 - ${Math.round(intensity * 100)}%`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 text-[11px] text-[#8a8a96]">
        <span>Less</span>
        <div className="flex gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(59, 130, 246, ${op})` }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}

function AgentStatusPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Agent Status</h3>
            <p className="text-xs text-[#8a8a96]">代理运行状态</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
          <span className="text-xs text-[#10b981]">4 online</span>
        </div>
      </div>

      <div className="space-y-3">
        {AGENT_STATUS.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              agent.status === 'working' ? 'bg-[#f59e0b] animate-pulse' :
              agent.status === 'online' ? 'bg-[#10b981]' :
              'bg-[#6b6b78]'
            }`} style={agent.status !== 'offline' ? { boxShadow: `0 0 10px ${agent.status === 'working' ? '#f59e0b' : '#10b981'}` } : {}} />
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-medium">{agent.name}</span>
                <span className={`text-xs ${
                  agent.status === 'working' ? 'text-[#f59e0b]' :
                  agent.status === 'online' ? 'text-[#10b981]' :
                  'text-[#6b6b78]'
                }`}>
                  {agent.status === 'working' ? '运行中' : agent.status === 'online' ? '在线' : '离线'}
                </span>
              </div>
              {agent.progress > 0 && (
                <div className="mt-2 h-1.5 bg-[#1e1e28] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: agent.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 1, delay: 0.6 + i * 0.05 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function AlertsPanel() {
  const [alerts, setAlerts] = useState(ALERTS);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', text: 'text-[#ef4444]', icon: AlertTriangle };
      case 'high': return { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30', text: 'text-[#f59e0b]', icon: AlertTriangle };
      case 'medium': return { bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', text: 'text-[#3b82f6]', icon: Bell };
      default: return { bg: 'bg-[#6b6b78]/10', border: 'border-[#6b6b78]/30', text: 'text-[#6b6b78]', icon: Bell };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Alerts</h3>
            <p className="text-xs text-[#8a8a96]">系统警报</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs font-medium">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {alerts.map((alert) => {
            const severity = getSeverityColor(alert.severity);
            const Icon = severity.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-xl ${severity.bg} border ${severity.border} flex items-start gap-3`}
              >
                <Icon className={`w-4 h-4 ${severity.text} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${severity.text}`}>{alert.title}</span>
                    <button 
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <span className="text-[#6b6b78] text-lg leading-none">&times;</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#b4b4be] mt-1">{alert.message}</p>
                  <span className="text-[10px] text-[#52525B] mt-2 block">{alert.timestamp}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-2 opacity-50" />
            <p className="text-sm text-[#8a8a96]">暂无警报</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickActions() {
  const actions = [
    { icon: Zap, label: '新建任务', color: '#3b82f6', bg: 'bg-[#3b82f6]/10' },
    { icon: Terminal, label: '系统命令', color: '#a855f7', bg: 'bg-[#a855f7]/10' },
    { icon: Settings, label: '设置', color: '#f59e0b', bg: 'bg-[#f59e0b]/10' },
    { icon: RefreshCw, label: '刷新数据', color: '#10b981', bg: 'bg-[#10b981]/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="card p-5"
    >
      <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${action.bg} hover:bg-opacity-20 transition-all group`}
          >
            <action.icon className="w-5 h-5" style={{ color: action.color }} />
            <span className="text-sm text-white group-hover:text-[#b4b4be] transition-colors">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ========== 主组件 ==========
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <StatCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SYSTEM_METRICS.map((m, i) => (
          <SystemMetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskTrendChart />
        </div>
        <DepartmentLoadChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficMonitor />
        <RecentActivity />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemResources />
        <HeatmapChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentStatusPanel />
        <AlertsPanel />
        <QuickActions />
      </div>
    </div>
  );
}
