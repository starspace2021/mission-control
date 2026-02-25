'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Network,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  Bell,
  Settings,
  Radio,
  FileText,
  Calendar,
  Bot,
  BrainCircuit,
  Eye,
  TrendingDown,
  ActivitySquare,
  Gauge,
  ZapIcon,
  AlertOctagon,
  ArrowRight,
  Play,
  Pause,
  StopCircle,
  ScanLine,
  Radio as RadioIcon,
  CpuIcon,
  Workflow
} from 'lucide-react';

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
  meta?: string;
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
  { label: 'Online Agents', value: '6', sub: '2 offline', color: '#3b82f6', icon: Bot, trend: { value: 12, direction: 'up' } },
  { label: 'Task Completion', value: '78%', sub: '+12% today', color: '#10b981', icon: CheckCircle2, trend: { value: 5, direction: 'up' } },
  { label: 'System Health', value: '99.2%', sub: 'All systems go', color: '#8b5cf6', icon: Activity, trend: { value: 0.3, direction: 'up' } },
  { label: 'Active Tasks', value: '12', sub: '3 pending', color: '#f59e0b', icon: Zap, trend: { value: 2, direction: 'down' } },
];

const SYSTEM_METRICS: SystemMetric[] = [
  { label: 'CPU Usage', value: 42, suffix: '%', icon: Cpu, color: '#3b82f6' },
  { label: 'Memory', value: 68, suffix: '%', icon: Database, color: '#8b5cf6' },
  { label: 'Network', value: 95, suffix: 'ms', icon: Wifi, color: '#10b981' },
  { label: 'Security', value: 100, suffix: '%', icon: Shield, color: '#f59e0b' },
];

const RECENT_ACTIVITIES: Activity[] = [
  { text: 'Africa Intel report generated', time: '2m ago', icon: CheckCircle2, color: '#10b981', type: 'success', meta: 'Intel Dept' },
  { text: 'US-China policy monitoring started', time: '15m ago', icon: Activity, color: '#3b82f6', type: 'info', meta: 'Policy Dept' },
  { text: 'Polymarket briefing created', time: '32m ago', icon: BarChart3, color: '#8b5cf6', type: 'info', meta: 'Market Dept' },
  { text: 'System alert: API rate limit at 85%', time: '1h ago', icon: AlertTriangle, color: '#f59e0b', type: 'warning', meta: 'System' },
  { text: 'QQ Mail cleanup completed', time: '2h ago', icon: CheckCircle2, color: '#10b981', type: 'success', meta: 'Engineering' },
  { text: 'Memory system backup finished', time: '3h ago', icon: Database, color: '#06b6d4', type: 'success', meta: 'Admin' },
];

const ALERTS: Alert[] = [
  { id: '1', title: 'High CPU Usage', message: 'Intel Collector Agent using 85% CPU', severity: 'medium', timestamp: '5m ago' },
  { id: '2', title: 'API Rate Limit', message: 'Twitter API approaching rate limit', severity: 'high', timestamp: '12m ago' },
  { id: '3', title: 'Memory Warning', message: 'System memory at 78% capacity', severity: 'low', timestamp: '1h ago' },
];

const AGENT_STATUS = [
  { name: 'Africa Intel', status: 'working', progress: 65, color: '#3b82f6', dept: 'Intel' },
  { name: 'Policy Monitor', status: 'online', progress: 0, color: '#8b5cf6', dept: 'Policy' },
  { name: 'Market Analyst', status: 'online', progress: 0, color: '#10b981', dept: 'Market' },
  { name: 'Risk Scoring', status: 'offline', progress: 0, color: '#71717a', dept: 'Intel' },
  { name: 'Memory Manager', status: 'working', progress: 42, color: '#f59e0b', dept: 'Admin' },
  { name: 'System Maint', status: 'online', progress: 0, color: '#06b6d4', dept: 'Engineering' },
];

const PIPELINE_STEPS = [
  { id: '1', title: 'Data Collection', status: 'completed', progress: 100, icon: Radio },
  { id: '2', title: 'Processing', status: 'completed', progress: 100, icon: Cpu },
  { id: '3', title: 'Analysis', status: 'active', progress: 65, icon: BarChart3 },
  { id: '4', title: 'Report Gen', status: 'pending', progress: 0, icon: FileText },
  { id: '5', title: 'Distribution', status: 'pending', progress: 0, icon: Globe },
];

const TASK_TREND = [
  { day: 'Mon', completed: 18, created: 12 },
  { day: 'Tue', completed: 22, created: 15 },
  { day: 'Wed', completed: 19, created: 14 },
  { day: 'Thu', completed: 24, created: 18 },
  { day: 'Fri', completed: 28, created: 16 },
  { day: 'Sat', completed: 15, created: 8 },
  { day: 'Sun', completed: 20, created: 12 },
];

const DEPARTMENT_LOAD = [
  { name: 'Intel', value: 78, color: '#3b82f6' },
  { name: 'Policy', value: 65, color: '#8b5cf6' },
  { name: 'Market', value: 82, color: '#10b981' },
  { name: 'Engineering', value: 45, color: '#f59e0b' },
  { name: 'Admin', value: 32, color: '#06b6d4' },
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
      isPositive ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' :
      isNeutral ? 'bg-[#6b6b78]/10 text-[#6b6b78] border border-[#6b6b78]/20' :
      'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
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

function CircularProgress({ value, size = 44, strokeWidth = 4, color = "#3b82f6" }: {
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
          stroke="rgba(255,255,255,0.06)"
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
    <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden opacity-40">
      <motion.div
        className="h-full bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function WelcomeBanner() {
  const [greeting, setGreeting] = useState('早安');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早安');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { value: '98.5%', label: '系统健康度', color: '#10b981', icon: Activity },
    { value: currentTime.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }), label: '当前时间', color: '#3b82f6', icon: Clock, isTime: true },
    { value: '6', label: '在线代理', color: '#8b5cf6', icon: Bot },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-v2 p-6 relative overflow-hidden"
    >
      <DataStreamBar />

      {/* 增强背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 via-[#8b5cf6]/3 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#3b82f6]/15 via-[#8b5cf6]/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#10b981]/10 via-[#06b6d4]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#3b82f6]/5 to-transparent rounded-full blur-3xl" />

      {/* 顶部渐变线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/50 to-transparent" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#f59e0b]/15 to-[#f59e0b]/5 border border-[#f59e0b]/30 shadow-lg shadow-[#f59e0b]/10"
              whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)' }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-sm text-[#f59e0b] font-medium">{greeting}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#10b981]/15 to-[#10b981]/5 border border-[#10b981]/30 shadow-lg shadow-[#10b981]/10"
              whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              <span className="text-sm text-[#10b981] font-medium">系统运行正常</span>
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text">欢迎回来，Hourglass</h2>
          <p className="text-[#a1a1aa] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            今日有 5 个定时任务待执行，2 个高优先级警报需要关注
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center relative"
              onHoverStart={() => setHoveredStat(index)}
              onHoverEnd={() => setHoveredStat(null)}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 -m-4 rounded-2xl bg-white/5 opacity-0"
                animate={{ opacity: hoveredStat === index ? 1 : 0 }}
              />
              <div className="relative">
                <motion.div
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: stat.color }}
                  key={stat.isTime ? currentTime.getSeconds() : stat.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-[#a1a1aa] mt-1 flex items-center justify-center gap-1">
                  <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                  {stat.label}
                </div>
              </div>
              {index < stats.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ metric, index }: { metric: Metric; index: number }) {
  const Icon = metric.icon;
  const [isHovered, setIsHovered] = useState(false);
  const chartData = useMemo(() =>
    [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85].map(v => v + Math.random() * 20),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="data-card group cursor-pointer"
    >
      {/* 顶部渐变线 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: isHovered ? 1 : 0.7 }}
        style={{ background: `linear-gradient(to right, ${metric.color}, ${metric.color}60, transparent)` }}
      />

      {/* 悬停发光背景 */}
      <motion.div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${metric.color}25, transparent)` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.4 }}
      />

      {/* 底部渐变装饰 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to top, ${metric.color}08, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="p-3 rounded-xl relative overflow-hidden"
            style={{ background: `${metric.color}15` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${metric.color}30, transparent)` }}
              animate={{ opacity: isHovered ? 1 : 0 }}
            />
            <Icon className="w-5 h-5 relative z-10" style={{ color: metric.color }} />
          </motion.div>
          <TrendIndicator trend={metric.trend} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <motion.div 
              className="text-3xl font-bold mb-1"
              style={{ color: metric.color }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {metric.value}
            </motion.div>
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Task Trend (7 days)</h3>
            <p className="text-xs text-[#a1a1aa]">任务完成情况统计</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span className="text-[#a1a1aa]">已完成</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span className="text-[#a1a1aa]">新建</span>
          </span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-28">
        {TASK_TREND.map((day, i) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex gap-1 items-end justify-center h-20">
              <motion.div
                className="flex-1 rounded-t-lg min-w-[6px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to top, #3b82f6, #3b82f680)'
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.completed / 30) * 100}%` }}
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
                animate={{ height: `${(day.created / 30) * 100}%` }}
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
        <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
          <PieChart className="w-5 h-5 text-[#8b5cf6]" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Department Load</h3>
          <p className="text-xs text-[#a1a1aa]">各部门工作负载</p>
        </div>
      </div>

      <div className="space-y-3">
        {DEPARTMENT_LOAD.map((dept, i) => (
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
        <div className="live-indicator">
          <span className="text-xs font-medium">Live</span>
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
          <div className="text-xl font-bold text-[#3b82f6] tabular-nums">{metrics.uptime}%</div>
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
        <button className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1">
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
                <span className="text-xs text-[#52525B]">{a.meta}</span>
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
  const resources = [
    { label: 'CPU Usage', value: 42, color: '#3b82f6', icon: Cpu, max: 100 },
    { label: 'Memory', value: 68, color: '#10b981', icon: Database, max: 128 },
    { label: 'Disk I/O', value: 35, color: '#f59e0b', icon: HardDrive, max: 1000 },
    { label: 'Network', value: 78, color: '#8b5cf6', icon: Network, max: 1000 },
  ];

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
        {resources.map((item, i) => (
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
          <span className="status-dot online" />
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
            <div className={`status-dot ${agent.status === 'working' ? 'busy' : agent.status === 'online' ? 'online' : 'offline'}`} />

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
      case 'critical': return { bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', text: 'text-[#ef4444]', icon: AlertOctagon };
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
                className={`p-3 rounded-xl ${severity.bg} border ${severity.border} flex items-start gap-3 group hover:scale-[1.02] transition-transform cursor-pointer`}
              >
                <Icon className={`w-4 h-4 ${severity.text} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${severity.text}`}>{alert.title}</span>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
            </div>
            <p className="text-sm text-[#8a8a96]">暂无警报</p>
            <p className="text-xs text-[#52525B] mt-1">系统运行正常</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function PipelineVisualization() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Data Pipeline</h3>
            <p className="text-xs text-[#8a8a96]">数据处理流程</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot online" />
          <span className="text-xs text-[#10b981]">运行中</span>
        </div>
      </div>

      <div className="relative">
        {/* 连接线 */}
        <div className="absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#6b6b78]" />

        <div className="flex justify-between">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${
                    isCompleted ? 'bg-[#10b981]' :
                    isActive ? 'bg-[#f59e0b]' :
                    'bg-[#1e1e28]'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className={`w-5 h-5 ${isCompleted || isActive ? 'text-white' : 'text-[#6b6b78]'}`} />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-[#f59e0b]"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium ${
                  isCompleted ? 'text-[#10b981]' :
                  isActive ? 'text-[#f59e0b]' :
                  'text-[#6b6b78]'
                }`}>
                  {step.title}
                </span>
                {isActive && (
                  <span className="text-[10px] text-[#8a8a96] mt-0.5">{step.progress}%</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function QuickActions() {
  const actions = [
    { icon: Zap, label: '新建任务', color: '#3b82f6', bg: 'bg-[#3b82f6]/10' },
    { icon: Terminal, label: '系统命令', color: '#8b5cf6', bg: 'bg-[#8b5cf6]/10' },
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
    <div className="space-y-6 page-transition-v11">
      <WelcomeBanner />

      {/* 核心指标 - 更紧凑的网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <StatCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* 系统指标 - 合并到更紧凑的行 */}
      <div className="grid grid-cols-4 gap-3">
        {SYSTEM_METRICS.map((m, i) => (
          <SystemMetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* 主要图表区域 - 优化布局比例 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskTrendChart />
        </div>
        <DepartmentLoadChart />
      </div>

      {/* 实时监控与活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficMonitor />
        <RecentActivity />
      </div>

      {/* 系统资源与热力图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemResources />
        <HeatmapChart />
      </div>

      {/* 代理状态、警报、快捷操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentStatusPanel />
        <AlertsPanel />
        <QuickActions />
      </div>

      {/* 数据管道 */}
      <PipelineVisualization />
    </div>
  );
}
