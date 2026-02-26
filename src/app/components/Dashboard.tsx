'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckCircle2,
  Activity,
  Bot,
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
  Clock,
  AlertTriangle,
  Terminal,
  HardDrive,
  Network,
  ChevronRight,
  RefreshCw,
  Bell,
  Layers,
  FileText,
  Radio,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Play,
  Pause,
  StopCircle,
  ScanLine,
  CpuIcon,
  Workflow,
  TrendingUp,
  TrendingDown,
  ActivitySquare,
  Gauge,
  ZapIcon,
  Eye,
  BrainCircuit,
  Server,
  MoreHorizontal,
  Settings,
  Menu,
  X,
  Target,
  Calendar,
  FolderOpen,
  Users,
  Command,
  MousePointer,
  Maximize2,
  Award,
  Bookmark,
  Hash,
  Share2,
  Download,
  Copy,
  ExternalLink,
  Info,
  HelpCircle,
  Lightbulb,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Mail,
  Phone,
  Video,
  Mic,
  Camera,
  Image,
  File,
  Folder,
  Home,
  MapPin,
  Navigation,
  Compass,
  Map,
  Flag,
  BookmarkPlus,
  BookOpen,
  GraduationCap,
  School,
  Library,
  Newspaper,
  Rss,
  Podcast,
  Music,
  Film,
  Tv,
  Gamepad2,
  Puzzle,
  Gift,
  ShoppingCart,
  CreditCard,
  Wallet,
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYen,
  Bitcoin,
  Coins,
  Banknote,
  Receipt,
  Invoice,
  FileSpreadsheet,
  FileBarChart,
  FilePieChart,
  FileLineChart,
  FileCode,
  FileJson,
  FileType,
  FileText as FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCheck,
  FileClock,
  FileCog,
  FileEdit,
  FileHeart,
  FileLock,
  FileMinus,
  FilePlus,
  FileQuestion,
  FileSearch,
  FileSignature,
  FileWarning,
  FileX,
  Files,
  Folders,
  FolderOpen as FolderOpenIcon,
  FolderPlus,
  FolderMinus,
  FolderHeart,
  FolderCog,
  FolderLock,
  FolderSearch,
  FolderX,
  FolderCheck,
  FolderClock,
  FolderEdit,
  FolderGit,
  FolderGit2,
  FolderKanban,
  FolderKey,
  FolderOpenDot,
  FolderOutput,
  FolderPen,
  FolderRoot,
  FolderSymlink,
  FolderSync,
  FolderTree,
  FolderUp,
  FolderX as FolderXIcon,
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
  { label: '在线代理', value: '6', sub: '2 离线', color: '#3b82f6', icon: Bot, trend: { value: 12, direction: 'up' } },
  { label: '任务完成率', value: '78%', sub: '+12% 今日', color: '#10b981', icon: CheckCircle2, trend: { value: 5, direction: 'up' } },
  { label: '系统健康度', value: '99.2%', sub: '运行正常', color: '#8b5cf6', icon: Activity, trend: { value: 0.3, direction: 'up' } },
  { label: '活跃任务', value: '12', sub: '3 待处理', color: '#f59e0b', icon: Zap, trend: { value: 2, direction: 'down' } },
];

const SYSTEM_METRICS: SystemMetric[] = [
  { label: 'CPU', value: 42, suffix: '%', icon: Cpu, color: '#3b82f6' },
  { label: '内存', value: 68, suffix: '%', icon: Database, color: '#8b5cf6' },
  { label: '网络', value: 95, suffix: 'ms', icon: Wifi, color: '#10b981' },
  { label: '安全', value: 100, suffix: '%', icon: Shield, color: '#f59e0b' },
];

const RECENT_ACTIVITIES: Activity[] = [
  { text: '非洲情报报告已生成', time: '2分钟前', icon: CheckCircle2, color: '#10b981', type: 'success', meta: 'Intel 部门' },
  { text: '美国对华政策监控已启动', time: '15分钟前', icon: Activity, color: '#3b82f6', type: 'info', meta: 'Policy 部门' },
  { text: 'Polymarket 简报已创建', time: '32分钟前', icon: BarChart3, color: '#8b5cf6', type: 'info', meta: 'Market 部门' },
  { text: '系统警报: API 速率限制 85%', time: '1小时前', icon: AlertTriangle, color: '#f59e0b', type: 'warning', meta: '系统' },
  { text: 'QQ邮箱清理已完成', time: '2小时前', icon: CheckCircle2, color: '#10b981', type: 'success', meta: 'Engineering' },
  { text: '记忆系统备份已完成', time: '3小时前', icon: Database, color: '#06b6d4', type: 'success', meta: 'Admin' },
];

const ALERTS: Alert[] = [
  { id: '1', title: 'CPU 使用率过高', message: 'Intel Collector Agent 使用 85% CPU', severity: 'medium', timestamp: '5分钟前' },
  { id: '2', title: 'API 速率限制', message: 'Twitter API 接近速率限制', severity: 'high', timestamp: '12分钟前' },
  { id: '3', title: '内存警告', message: '系统内存使用率达 78%', severity: 'low', timestamp: '1小时前' },
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
  { id: '1', title: '数据收集', status: 'completed', progress: 100, icon: Radio },
  { id: '2', title: '数据处理', status: 'completed', progress: 100, icon: Cpu },
  { id: '3', title: '数据分析', status: 'active', progress: 65, icon: BarChart3 },
  { id: '4', title: '报告生成', status: 'pending', progress: 0, icon: FileText },
  { id: '5', title: '分发推送', status: 'pending', progress: 0, icon: Globe },
];

const TASK_TREND = [
  { day: '周一', completed: 18, created: 12 },
  { day: '周二', completed: 22, created: 15 },
  { day: '周三', completed: 19, created: 14 },
  { day: '周四', completed: 24, created: 18 },
  { day: '周五', completed: 28, created: 16 },
  { day: '周六', completed: 15, created: 8 },
  { day: '周日', completed: 20, created: 12 },
];

const DEPARTMENT_LOAD = [
  { name: 'Intel', value: 78, color: '#3b82f6' },
  { name: 'Policy', value: 65, color: '#8b5cf6' },
  { name: 'Market', value: 82, color: '#10b981' },
  { name: 'Engineering', value: 45, color: '#f59e0b' },
  { name: 'Admin', value: 32, color: '#06b6d4' },
];

// 实时数据生成器
const generateRealtimeData = (points: number) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: 30 + Math.random() * 40 + Math.sin(i * 0.5) * 10,
  }));
};

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

// 增强的欢迎横幅 - v2.0 优化版
function WelcomeBanner() {
  const [greeting, setGreeting] = useState('早安');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 12) setGreeting('早安');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 防止 hydration 不匹配
  if (!mounted) {
    return (
      <div className="welcome-banner relative overflow-hidden min-h-[140px]">
        <div className="welcome-banner-bg" />
        <div className="relative flex items-center justify-between p-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/40">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-sm text-[#f59e0b] font-semibold">{greeting}</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text">
              欢迎回来，Hourglass
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="welcome-banner relative overflow-hidden"
    >
      <div className="welcome-banner-bg" />
      <DataStreamBar />

      {/* 动态背景光效 */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 60%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px]"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.1), transparent 60%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* 粒子效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#3b82f6]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/40"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              </motion.div>
              <span className="text-sm text-[#f59e0b] font-semibold">{greeting}</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/5 border border-[#10b981]/40"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.span
                className="w-2.5 h-2.5 bg-[#10b981] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-[#10b981] font-semibold">系统运行正常</span>
            </motion.div>
          </div>
          <motion.h2
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            欢迎回来，Hourglass
          </motion.h2>
          <motion.p
            className="text-[#a1a1aa] flex items-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-[#3b82f6]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            今日有 5 个定时任务待执行，2 个高优先级警报需要关注
          </motion.p>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[
            { value: '98.5%', label: '系统健康度', color: '#10b981', icon: Activity, trend: '+0.5%' },
            { value: currentTime.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }), label: '当前时间', color: '#3b82f6', icon: Clock },
            { value: '6', label: '在线代理', color: '#8b5cf6', icon: Bot, trend: '+1' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <motion.div
                className="text-4xl font-bold tabular-nums"
                style={{
                  color: stat.color,
                  textShadow: `0 0 30px ${stat.color}40`
                }}
                whileHover={{ scale: 1.05 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-[#71717A] mt-2 flex items-center justify-center gap-1.5">
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                {stat.label}
              </div>
              {stat.trend && (
                <motion.div
                  className="absolute -top-1 -right-6 text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: `${stat.color}20`,
                    color: stat.color
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  {stat.trend}
                </motion.div>
              )}
              {index < 2 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
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
      className="stat-card-v2 group cursor-pointer"
    >
      {/* 顶部渐变线 */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(to right, ${metric.color}, ${metric.color}60, transparent)` }}
      />

      {/* 悬停发光背景 */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${metric.color}30, transparent)` }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="p-3 rounded-xl relative overflow-hidden"
            style={{ background: `${metric.color}15` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="w-5 h-5 relative z-10" style={{ color: metric.color }} />
          </motion.div>
          <TrendIndicator trend={metric.trend} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <motion.div
              className="text-3xl font-bold mb-1 stat-value-animated"
              style={{
                color: metric.color,
                textShadow: `0 0 30px ${metric.color}30`
              }}
              whileHover={{ scale: 1.05 }}
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
        <div
          className="p-2.5 rounded-xl"
          style={{ background: `${metric.color}12` }}
        >
          <Icon className="w-4 h-4" style={{ color: metric.color }} />
        </div>
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

// 增强的任务趋势图 - 带面积图效果
function TaskTrendChart() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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
            <h3 className="font-semibold text-white text-sm">任务趋势 (7天)</h3>
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

      {/* 面积图背景 */}
      <div className="relative h-32 mb-2">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="createdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* 面积路径 */}
          <motion.path
            d={`M 0,${128 - (TASK_TREND[0].completed / 30) * 128} ${TASK_TREND.map((d, i) => `L ${(i / (TASK_TREND.length - 1)) * 100}%,${128 - (d.completed / 30) * 128}`).join(' ')} L 100%,128 L 0,128 Z`}
            fill="url(#completedGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </svg>

        {/* 柱状图 */}
        <div className="flex items-end gap-2 h-28 relative z-10">
          {TASK_TREND.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end justify-center h-20">
                <motion.div
                  className="flex-1 rounded-t-lg min-w-[6px] relative overflow-hidden cursor-pointer"
                  style={{
                    background: hoveredBar === i ? '#3b82f6' : 'linear-gradient(to top, #3b82f6, #3b82f680)'
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.completed / 30) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                  {/* 悬停提示 */}
                  <AnimatePresence>
                    {hoveredBar === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a24] border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap"
                      >
                        {day.completed} 完成
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  className="flex-1 rounded-t-lg min-w-[6px] relative overflow-hidden cursor-pointer"
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
      </div>
    </motion.div>
  );
}

// 部门负载饼图/环形图
function DepartmentLoadChart() {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const total = DEPARTMENT_LOAD.reduce((acc, d) => acc + d.value, 0);

  // 计算环形图路径
  const createDonutSlice = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + outerRadius * Math.cos(startAngleRad);
    const y1 = 50 + outerRadius * Math.sin(startAngleRad);
    const x2 = 50 + outerRadius * Math.cos(endAngleRad);
    const y2 = 50 + outerRadius * Math.sin(endAngleRad);
    const x3 = 50 + innerRadius * Math.cos(endAngleRad);
    const y3 = 50 + innerRadius * Math.sin(endAngleRad);
    const x4 = 50 + innerRadius * Math.cos(startAngleRad);
    const y4 = 50 + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  let currentAngle = 0;

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
          <h3 className="font-semibold text-white text-sm">部门负载</h3>
          <p className="text-xs text-[#a1a1aa]">各部门工作负载分布</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* 环形图 */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {DEPARTMENT_LOAD.map((dept, i) => {
              const angle = (dept.value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              return (
                <motion.path
                  key={dept.name}
                  d={createDonutSlice(startAngle, endAngle, 30, 45)}
                  fill={dept.color}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: hoveredSlice === i ? 1 : 0.85,
                    scale: hoveredSlice === i ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{
                    transformOrigin: '50px 50px',
                    filter: hoveredSlice === i ? `drop-shadow(0 0 8px ${dept.color})` : 'none'
                  }}
                />
              );
            })}
            {/* 中心文字 */}
            <text x="50" y="48" textAnchor="middle" className="fill-white text-[8px] font-medium">
              总负载
            </text>
            <text x="50" y="58" textAnchor="middle" className="fill-[#a1a1aa] text-[6px]">
              {total}%
            </text>
          </svg>
        </div>

        {/* 图例 */}
        <div className="flex-1 space-y-2">
          {DEPARTMENT_LOAD.map((dept, i) => (
            <motion.div
              key={dept.name}
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHoveredSlice(i)}
              onMouseLeave={() => setHoveredSlice(null)}
              whileHover={{ x: 4 }}
            >
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dept.color }}
                animate={{ scale: hoveredSlice === i ? 1.2 : 1 }}
              />
              <span className="text-xs text-[#e4e4e7] flex-1">{dept.name}</span>
              <span className="text-xs font-bold text-white tabular-nums">
                <CountUp value={dept.value} suffix="%" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// 实时流量监控 - 带折线图
function TrafficMonitor() {
  const [metrics, setMetrics] = useState({
    requests: 1247,
    latency: 98,
    uptime: 99.9
  });
  const [chartData, setChartData] = useState(generateRealtimeData(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        requests: prev.requests + Math.floor(Math.random() * 20 - 10),
        latency: Math.max(50, Math.min(150, prev.latency + Math.floor(Math.random() * 10 - 5))),
        uptime: 99.9
      }));
      // 更新图表数据
      setChartData(prev => {
        const newData = [...prev.slice(1), { time: Date.now(), value: 30 + Math.random() * 40 }];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 生成折线路径
  const linePath = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - ((d.value - 20) / 50) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

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

      {/* 实时折线图 */}
      <div className="relative h-20 mb-4">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trafficGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill="url(#trafficGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        {/* 数据点 */}
        <div className="absolute inset-0 flex items-end justify-between px-0">
          {chartData.map((d, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#10b981]"
              style={{
                bottom: `${((d.value - 20) / 50) * 100}%`,
                opacity: i === chartData.length - 1 ? 1 : 0.3
              }}
              animate={i === chartData.length - 1 ? {
                scale: [1, 1.5, 1],
                boxShadow: ['0 0 0px #10b981', '0 0 10px #10b981', '0 0 0px #10b981']
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <motion.div
            className="text-xl font-bold text-white tabular-nums"
            key={metrics.requests}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#ffffff' }}
          >
            {(metrics.requests / 1000).toFixed(1)}K
          </motion.div>
          <div className="text-xs text-[#a1a1aa] mt-1">请求/分</div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-xl font-bold text-[#10b981] tabular-nums"
            key={metrics.latency}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {metrics.latency}ms
          </motion.div>
          <div className="text-xs text-[#a1a1aa] mt-1">平均延迟</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#3b82f6] tabular-nums">{metrics.uptime}%</div>
          <div className="text-xs text-[#a1a1aa] mt-1">可用性</div>
        </div>
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
            <h3 className="font-semibold text-white text-sm">最近活动</h3>
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
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${a.color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
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
    { label: 'CPU 使用', value: 42, color: '#3b82f6', icon: Cpu, max: 100 },
    { label: '内存使用', value: 68, color: '#10b981', icon: Database, max: 128 },
    { label: '磁盘 I/O', value: 35, color: '#f59e0b', icon: HardDrive, max: 1000 },
    { label: '网络吞吐', value: 78, color: '#8b5cf6', icon: Network, max: 1000 },
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
            <h3 className="font-semibold text-white text-sm">系统资源</h3>
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
                <span className="text-xs text-[#52525B]">/ {item.max}{item.label === '内存使用' ? 'GB' : item.label === '磁盘 I/O' || item.label === '网络吞吐' ? 'MB/s' : '%'}</span>
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
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
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
            <h3 className="font-semibold text-white text-sm">活跃度热力图</h3>
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
        <span>低</span>
        <div className="flex gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(59, 130, 246, ${op})` }}
            />
          ))}
        </div>
        <span>高</span>
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
      className="card p-5 min-h-[200px]"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">代理状态</h3>
            <p className="text-xs text-[#8a8a96]">代理运行状态</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot online" />
          <span className="text-xs text-[#10b981]">4 在线</span>
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
            <h3 className="font-semibold text-white text-sm">系统警报</h3>
            <p className="text-xs text-[#8a8a96]">需要关注的事件</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs font-medium">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2">
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
            <h3 className="font-semibold text-white text-sm">数据处理流程</h3>
            <p className="text-xs text-[#8a8a96]">数据流水线状态</p>
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
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${
                    isCompleted ? 'bg-[#10b981]' :
                    isActive ? 'bg-[#f59e0b]' :
                    'bg-[#1e1e28]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCompleted || isActive ? 'text-white' : 'text-[#6b6b78]'}`} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl border-2 border-[#f59e0b] animate-ping" />
                  )}
                </div>
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
              </div>
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
      <h3 className="font-semibold text-white text-sm mb-4">快捷操作</h3>
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 1500);
  }, []);

  return (
    <div className="space-y-6 page-transition-v11">
      {/* 刷新按钮和更新时间 */}
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-[#71717A]">
          最后更新: {lastUpdated.toLocaleTimeString('zh-CN')}
        </span>
        <motion.button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#71717A] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={refreshing}
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </motion.div>
          {refreshing ? '刷新中...' : '刷新'}
        </motion.button>
      </div>

      <WelcomeBanner />

      {/* 核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map((m, i) => (
          <StatCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* 系统指标 */}
      <div className="grid grid-cols-4 gap-2">
        {SYSTEM_METRICS.map((m, i) => (
          <SystemMetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* 主要图表区域 */}
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
