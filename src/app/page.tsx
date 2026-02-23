"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Brain,
  Users,
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
  Minimize2,
  BarChart3,
  PieChart,
  Target,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Gauge,
  Database,
  Globe,
  Shield,
  Flame,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import MemoryScreen from "./components/MemoryScreen";
import TeamView from "./components/TeamView";

// 导航配置
const navItems = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, shortcut: "1" },
  { id: "tasks", label: "任务", icon: ClipboardList, shortcut: "2" },
  { id: "calendar", label: "日历", icon: Calendar, shortcut: "3" },
  { id: "memory", label: "记忆", icon: Brain, shortcut: "4" },
  { id: "team", label: "团队", icon: Users, shortcut: "5" },
];

// 模拟数据 - 现代控制台风格 v2.0
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
  ],
  // 增强图表数据
  chartData: {
    donut: [
      { label: "情报", value: 35, color: "#3B82F6" },
      { label: "政策", value: 25, color: "#8B5CF6" },
      { label: "市场", value: 20, color: "#10B981" },
      { label: "工程", value: 15, color: "#F59E0B" },
      { label: "其他", value: 5, color: "#EC4899" },
    ],
    radar: [
      { label: "性能", value: 85 },
      { label: "稳定性", value: 92 },
      { label: "安全性", value: 78 },
      { label: "可用性", value: 96 },
      { label: "扩展性", value: 70 },
    ],
    area: [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85],
    // 新增热力图数据
    heatmap: [
      { day: "周一", hour: 0, value: 12 }, { day: "周一", hour: 4, value: 8 }, { day: "周一", hour: 8, value: 45 },
      { day: "周一", hour: 12, value: 38 }, { day: "周一", hour: 16, value: 52 }, { day: "周一", hour: 20, value: 78 },
      { day: "周二", hour: 0, value: 15 }, { day: "周二", hour: 4, value: 10 }, { day: "周二", hour: 8, value: 48 },
      { day: "周二", hour: 12, value: 42 }, { day: "周二", hour: 16, value: 58 }, { day: "周二", hour: 20, value: 82 },
      { day: "周三", hour: 0, value: 18 }, { day: "周三", hour: 4, value: 12 }, { day: "周三", hour: 8, value: 52 },
      { day: "周三", hour: 12, value: 45 }, { day: "周三", hour: 16, value: 62 }, { day: "周三", hour: 20, value: 85 },
      { day: "周四", hour: 0, value: 14 }, { day: "周四", hour: 4, value: 9 }, { day: "周四", hour: 8, value: 50 },
      { day: "周四", hour: 12, value: 40 }, { day: "周四", hour: 16, value: 55 }, { day: "周四", hour: 20, value: 80 },
      { day: "周五", hour: 0, value: 20 }, { day: "周五", hour: 4, value: 15 }, { day: "周五", hour: 8, value: 55 },
      { day: "周五", hour: 12, value: 48 }, { day: "周五", hour: 16, value: 65 }, { day: "周五", hour: 20, value: 88 },
      { day: "周六", hour: 0, value: 25 }, { day: "周六", hour: 4, value: 18 }, { day: "周六", hour: 8, value: 35 },
      { day: "周六", hour: 12, value: 30 }, { day: "周六", hour: 16, value: 40 }, { day: "周六", hour: 20, value: 55 },
      { day: "周日", hour: 0, value: 22 }, { day: "周日", hour: 4, value: 16 }, { day: "周日", hour: 8, value: 32 },
      { day: "周日", hour: 12, value: 28 }, { day: "周日", hour: 16, value: 35 }, { day: "周日", hour: 20, value: 50 },
    ],
    // 新增柱状图数据
    bar: [
      { label: "情报", value: 35, color: "#3B82F6" },
      { label: "政策", value: 25, color: "#8B5CF6" },
      { label: "市场", value: 20, color: "#10B981" },
      { label: "工程", value: 15, color: "#F59E0B" },
      { label: "其他", value: 5, color: "#EC4899" },
    ],
  },
  // 增强系统指标
  systemMetrics: {
    requestsPerMin: 1247,
    avgLatency: 98,
    availability: 99.9,
    errorRate: 0.1,
    activeConnections: 42,
    diskUsage: 68,
    networkIn: 12.5,
    networkOut: 8.3,
    // 新增指标
    cpuHistory: [35, 42, 38, 45, 40, 48, 42, 50, 45, 52, 48, 55],
    memoryHistory: [60, 65, 62, 68, 65, 70, 68, 72, 70, 75, 72, 78],
    requestHistory: [800, 950, 1100, 1050, 1200, 1150, 1300, 1250, 1400, 1350, 1500, 1450],
  },
  // 趋势数据
  trends: {
    tasks: { value: 12, direction: "up" as const },
    success: { value: 2.3, direction: "up" as const },
    latency: { value: 5, direction: "down" as const },
    errors: { value: 0.5, direction: "down" as const },
  },
  // 新增部门活跃度
  departmentActivity: [
    { name: "情报部", activity: 85, tasks: 12, online: 3 },
    { name: "政策部", activity: 72, tasks: 8, online: 2 },
    { name: "市场部", activity: 65, tasks: 6, online: 2 },
    { name: "工程部", activity: 90, tasks: 15, online: 3 },
    { name: "记忆部", activity: 45, tasks: 4, online: 2 },
  ],
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

// 状态图表组件 - 增强版
function StatusChart({ value, max = 100, color = "blue", animated = true, showLabel = false }: { 
  value: number; 
  max?: number; 
  color?: string;
  animated?: boolean;
  showLabel?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorMap: Record<string, { main: string; glow: string }> = {
    blue: { main: "#3B82F6", glow: "rgba(59, 130, 246, 0.5)" },
    green: { main: "#10B981", glow: "rgba(16, 185, 129, 0.5)" },
    yellow: { main: "#F59E0B", glow: "rgba(245, 158, 11, 0.5)" },
    red: { main: "#EF4444", glow: "rgba(239, 68, 68, 0.5)" },
    purple: { main: "#8B5CF6", glow: "rgba(139, 92, 246, 0.5)" },
    cyan: { main: "#06B6D4", glow: "rgba(6, 182, 212, 0.5)" },
  };
  
  const colors = colorMap[color];
  
  return (
    <div className="w-full">
      <div className="w-full bg-[#1A1A24] rounded-full h-2 overflow-hidden relative">
        {/* 背景网格 */}
        <div className="absolute inset-0 opacity-30" 
          style={{ 
            backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.03) 50%)',
            backgroundSize: '4px 100%'
          }} 
        />
        <motion.div 
          className="h-full rounded-full relative"
          style={{ 
            backgroundColor: colors.main,
            boxShadow: `0 0 10px ${colors.glow}`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
        >
          {/* 流动光效 */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5 text-xs">
          <span className="text-[#52525B]">{value}{max === 100 ? '%' : ''}</span>
          <span className="text-[#71717A]">{max}{max === 100 ? '%' : ''}</span>
        </div>
      )}
    </div>
  );
}

// 迷你图表组件 - 增强版
function MiniChart({ data, color = "#3B82F6", animated = true }: { data: number[]; color?: string; animated?: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end gap-[2px] h-10">
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${((value - min) / range) * 100}%` }}
          transition={{ 
            delay: animated ? i * 0.05 : 0, 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {/* 顶部高光 */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40" />
        </motion.div>
      ))}
    </div>
  );
}

// 迷你面积图组件 - 增强版
function MiniAreaChart({ data, color = "#3B82F6", height = 64 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = `0,100 ${points} 100,100`;
  const gradientId = `areaGradient-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="50%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 数据点 */}
      {data.map((value, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 80 - 10;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0}
          />
        );
      })}
    </svg>
  );
}

// 环形进度组件 - 增强版
function CircularProgress({ value, size = 48, strokeWidth = 4, color = "#3B82F6" }: { 
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
      {/* 外发光 */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{ 
          boxShadow: `0 0 ${size / 4}px ${color}`,
          transform: 'scale(0.9)'
        }}
      />
      <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆环 */}
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
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 ${strokeWidth}px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
        <span className="text-[8px] text-[#71717A]">%</span>
      </div>
    </div>
  );
}

// 环形图组件 (纯SVG实现)
function DonutChart({ data, size = 120 }: { 
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - 20) / 2;
  const innerRadius = radius * 0.6;
  
  let currentAngle = -90; // 从顶部开始
  
  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    return { ...item, path, angle };
  });
  
  return (
    <div className="relative">
      <svg width={size} height={size} className="transform rotate-[-90deg]">
        {segments.map((segment, i) => (
          <motion.path
            key={segment.label}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-[#71717A]">任务</span>
      </div>
    </div>
  );
}

// 雷达图组件 (纯SVG实现)
function RadarChart({ data, size = 140 }: { 
  data: { label: string; value: number }[];
  size?: number;
}) {
  const center = size / 2;
  const radius = (size - 40) / 2;
  const levels = 4;
  const angleStep = (2 * Math.PI) / data.length;
  
  // 计算网格点
  const gridPolygons = [];
  for (let i = 1; i <= levels; i++) {
    const r = (radius / levels) * i;
    const points = data.map((_, j) => {
      const angle = j * angleStep - Math.PI / 2;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
    gridPolygons.push(points);
  }
  
  // 计算数据点
  const dataPoints = data.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (item.value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: item.label,
      value: item.value,
    };
  });
  
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  
  // 计算标签位置
  const labels = data.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = radius + 15;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      label: item.label,
    };
  });
  
  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* 网格 */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}
      
      {/* 轴线 */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      
      {/* 数据区域 */}
      <motion.polygon
        points={dataPolygon}
        fill="rgba(59, 130, 246, 0.2)"
        stroke="#3B82F6"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: 'center' }}
      />
      
      {/* 数据点 */}
      {dataPoints.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#3B82F6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="hover:r-6 hover:fill-[#06B6D4] transition-all cursor-pointer"
        />
      ))}
      
      {/* 标签 */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#71717A"
          fontSize="10"
          fontWeight="500"
        >
          {label.label}
        </text>
      ))}
    </svg>
  );
}

// 流量指示器组件 - 增强版
function TrafficIndicator() {
  const bars = [
    { height: 0.3, delay: 0 },
    { height: 0.6, delay: 0.1 },
    { height: 0.4, delay: 0.2 },
    { height: 0.8, delay: 0.3 },
    { height: 0.5, delay: 0.4 },
  ];
  
  return (
    <div className="flex items-end gap-[2px] h-6">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-[#10B981] to-[#06B6D4] rounded-full"
          animate={{
            height: [`${bar.height * 100}%`, `${(bar.height + 0.3) * 100}%`, `${bar.height * 100}%`],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: bar.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// 实时数据计数器组件 - 新增
function LiveCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1500, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);
  
  return <span className="tabular-nums">{displayValue}{suffix}</span>;
}

// 趋势指示器组件 - 增强版
function TrendIndicator({ trend }: { trend: { value: number; direction: "up" | "down" | "stable" } }) {
  const isPositive = trend.direction === "up";
  const isNeutral = trend.direction === "stable";
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isPositive ? 'bg-[#10B981]/10 text-[#10B981]' : 
        isNeutral ? 'bg-[#71717A]/10 text-[#71717A]' : 
        'bg-[#EF4444]/10 text-[#EF4444]'
      }`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : 
         isNeutral ? <Minus className="w-3 h-3" /> : 
         <ArrowDownRight className="w-3 h-3" />}
        {trend.value}%
      </div>
    </div>
  );
}

// 数值计数动画组件
function CountUp({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // 使用 easeOutQuart 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return <span className="tabular-nums">{displayValue}</span>;
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
      if (e.key >= "1" && e.key <= "5") {
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
              {activeTab === "team" && <TeamViewWrapper key="team" />}
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

// 仪表盘视图 - 增强版 v2.0
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
      {/* 欢迎横幅 - 增强版 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="console-card p-6 relative overflow-hidden group"
      >
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/10 via-[#8B5CF6]/5 to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#8B5CF6]/10 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
        
        {/* 装饰线条 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              </motion.div>
              <span className="text-sm text-[#F59E0B] font-medium">早安</span>
              <span className="text-xs text-[#52525B]">•</span>
              <span className="text-xs text-[#71717A]">系统运行正常</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">欢迎回来，Hourglass</h2>
            <p className="text-[#71717A]">今日有 <span className="text-white font-medium">5</span> 个定时任务待执行，<span className="text-white font-medium">3</span> 个高优先级任务进行中。</p>
          </div>
          
          {/* 右侧状态指示 */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#10B981]">98.5%</div>
              <div className="text-xs text-[#71717A] mt-1">系统健康度</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-[#3B82F6]">72h</div>
              <div className="text-xs text-[#71717A] mt-1">运行时长</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 核心指标卡片 - 增强版 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="进行中任务" 
          value={mockData.stats.activeTasks} 
          trend={mockData.trends.tasks}
          icon={ClipboardList} 
          color="blue"
          chart={chartData1}
          subtitle="较昨日 +12%"
          showCountUp
        />
        <MetricCard 
          title="定时任务" 
          value={mockData.stats.cronJobs} 
          trend={{ value: 0, direction: "stable" }}
          icon={Clock} 
          color="purple"
          chart={chartData2}
          subtitle="全部运行正常"
          showCountUp
        />
        <MetricCard 
          title="记忆文档" 
          value={mockData.stats.memories} 
          trend={{ value: 3, direction: "up" }}
          icon={Brain} 
          color="green"
          chart={chartData1}
          subtitle="本周新增 3 条"
          showCountUp
        />
        <MetricCard 
          title="成功率" 
          value={mockData.stats.successRate} 
          trend={{ value: 0.5, direction: "up" }}
          icon={Activity} 
          color="cyan"
          chart={chartData2}
          subtitle="系统健康"
          showCountUp={false}
          suffix="%"
        />
      </div>

      {/* 系统指标卡片 - 新增 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SystemMetricCard 
          title="请求/分钟" 
          value={mockData.systemMetrics.requestsPerMin}
          trend={{ value: 12, direction: "up" }}
          icon={Globe}
          color="blue"
        />
        <SystemMetricCard 
          title="平均延迟" 
          value={mockData.systemMetrics.avgLatency}
          suffix="ms"
          trend={{ value: 5, direction: "down" }}
          icon={Gauge}
          color="green"
        />
        <SystemMetricCard 
          title="可用性" 
          value={mockData.systemMetrics.availability}
          suffix="%"
          trend={{ value: 0.1, direction: "up" }}
          icon={Shield}
          color="purple"
        />
        <SystemMetricCard 
          title="磁盘使用" 
          value={mockData.systemMetrics.diskUsage}
          suffix="%"
          trend={{ value: 2, direction: "up" }}
          icon={Database}
          color="yellow"
        />
      </div>

      {/* 数据可视化区域 - 增强版 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 环形图 - 任务分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-enhanced p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">任务分布</h3>
              <p className="text-xs text-[#71717A]">按部门分类</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <DonutChart data={mockData.chartData.donut} size={140} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {mockData.chartData.donut.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#71717A]">{item.label}</span>
                <span className="text-white ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 雷达图 - 系统健康度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-enhanced p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">系统健康度</h3>
              <p className="text-xs text-[#71717A]">综合评分</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-2">
            <RadarChart data={mockData.chartData.radar} size={160} />
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-[#3B82F6]">84.2</div>
              <div className="text-xs text-[#71717A]">综合得分</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-[#10B981]">+2.4</div>
              <div className="text-xs text-[#71717A]">较上周</div>
            </div>
          </div>
        </motion.div>

        {/* 实时流量监控 - 增强版 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-enhanced p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">实时流量</h3>
              <p className="text-xs text-[#71717A]">数据请求/秒</p>
            </div>
            <div className="ml-auto">
              <TrafficIndicator />
            </div>
          </div>
          <div className="py-2">
            <MiniAreaChart data={[45, 52, 48, 60, 55, 68, 72, 65, 58, 62, 70, 75]} color="#10B981" height={80} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">1.2K</div>
              <div className="text-xs text-[#71717A]">请求/分</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-[#10B981]">98ms</div>
              <div className="text-xs text-[#71717A]">平均延迟</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-[#3B82F6]">99.9%</div>
              <div className="text-xs text-[#71717A]">可用性</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 主内容网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务面板 - 增强版 */}
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
            <button className="text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors flex items-center gap-1 group">
              查看全部
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {mockData.tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors group cursor-pointer">
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
                    <StatusChart value={task.progress} color={task.status === "running" ? "green" : "blue"} showLabel />
                  </div>
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

        {/* 今日日程 - 增强版 */}
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
            <button className="w-full py-2 text-sm text-[#71717A] hover:text-white transition-colors flex items-center justify-center gap-1 group">
              查看完整日历
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 活动日志 + 部门活跃度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活动日志 - 增强版 */}
        <div className="console-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#06B6D4]/5 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">最近活动</h2>
                <p className="text-xs text-[#71717A]">系统操作记录</p>
              </div>
            </div>
            <span className="text-xs text-[#52525B]">过去24小时</span>
          </div>
          <div className="p-4">
            <div className="space-y-1">
              {mockData.activities.map((activity, index) => (
                <motion.div 
                  key={activity.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 py-3 px-3 hover:bg-white/[0.02] rounded-lg transition-colors group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.status === "success" ? "bg-[#10B981]/10" : "bg-[#F59E0B]/10"
                  }`}>
                    {activity.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <Clock4 className="w-5 h-5 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white group-hover:text-[#3B82F6] transition-colors">{activity.action}</span>
                    <div className="text-xs text-[#52525B] mt-0.5">
                      {activity.status === "success" ? "已完成" : "计划中"}
                    </div>
                  </div>
                  <span className="text-xs text-[#71717A] tabular-nums">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 部门活跃度 - 增强版 */}
        <div className="console-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC4899]/20 to-[#EC4899]/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#EC4899]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">部门活跃度</h2>
                <p className="text-xs text-[#71717A]">实时团队状态</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#52525B]">
              <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
              12 人在线
            </div>
          </div>
          <div className="p-4 space-y-3">
            {mockData.departmentActivity.map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white group-hover:text-[#3B82F6] transition-colors">{dept.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#71717A]">{dept.tasks} 任务</span>
                      <span className="flex items-center gap-1 text-xs text-[#10B981]">
                        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                        {dept.online} 在线
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-[#1A1A24] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.activity}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      {/* 流动光效 */}
                      <div className="absolute inset-0 overflow-hidden rounded-full">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="text-lg font-bold text-white w-12 text-right">{dept.activity}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 系统负载热力图 - 增强版 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="console-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">系统负载热力图</h3>
              <p className="text-xs text-[#71717A]">过去7天 × 24小时请求分布</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <span>低</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded bg-[#1A1A24]" />
                <div className="w-3 h-3 rounded bg-[#3B82F6]/30" />
                <div className="w-3 h-3 rounded bg-[#3B82F6]/50" />
                <div className="w-3 h-3 rounded bg-[#3B82F6]/70" />
                <div className="w-3 h-3 rounded bg-[#3B82F6]" />
              </div>
              <span>高</span>
            </div>
            <button className="text-xs text-[#71717A] hover:text-white transition-colors flex items-center gap-1">
              导出数据
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <HeatmapChart data={mockData.chartData.heatmap} />
      </motion.div>
    </motion.div>
  );
}

// 指标卡片组件 - v4.0 增强版
function MetricCard({ 
  title, 
  value, 
  trend,
  icon: Icon, 
  color,
  chart,
  subtitle,
  showCountUp = false,
  suffix = ""
}: {
  title: string;
  value: number;
  trend: { value: number; direction: "up" | "down" | "stable" };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  chart: number[];
  subtitle?: string;
  showCountUp?: boolean;
  suffix?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; chart: string; gradient: string; glow: string; border: string }> = {
    blue: { 
      bg: "bg-[#3B82F6]/10", 
      text: "text-[#60A5FA]",
      chart: "#3B82F6", 
      gradient: "from-[#3B82F6] to-[#60A5FA]",
      glow: "rgba(59, 130, 246, 0.4)",
      border: "rgba(59, 130, 246, 0.3)"
    },
    purple: { 
      bg: "bg-[#8B5CF6]/10", 
      text: "text-[#A78BFA]",
      chart: "#8B5CF6", 
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      glow: "rgba(139, 92, 246, 0.4)",
      border: "rgba(139, 92, 246, 0.3)"
    },
    green: { 
      bg: "bg-[#10B981]/10", 
      text: "text-[#34D399]",
      chart: "#10B981", 
      gradient: "from-[#10B981] to-[#34D399]",
      glow: "rgba(16, 185, 129, 0.4)",
      border: "rgba(16, 185, 129, 0.3)"
    },
    cyan: { 
      bg: "bg-[#06B6D4]/10", 
      text: "text-[#22D3EE]",
      chart: "#06B6D4", 
      gradient: "from-[#06B6D4] to-[#22D3EE]",
      glow: "rgba(6, 182, 212, 0.4)",
      border: "rgba(6, 182, 212, 0.3)"
    },
    yellow: { 
      bg: "bg-[#F59E0B]/10", 
      text: "text-[#FBBF24]",
      chart: "#F59E0B", 
      gradient: "from-[#F59E0B] to-[#FBBF24]",
      glow: "rgba(245, 158, 11, 0.4)",
      border: "rgba(245, 158, 11, 0.3)"
    },
  };

  const colors = colorMap[color];

  return (
    <motion.div 
      className="console-card p-5 relative overflow-hidden group cursor-pointer"
      whileHover={{ 
        y: -8, 
        scale: 1.03,
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px ${colors.glow}` 
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* 背景发光效果 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500`} />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-white/8 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* 顶部渐变条 - 增强 */}
      <motion.div 
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      />
      
      {/* 左侧边框发光 */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to bottom, transparent, ${colors.chart}, transparent)` }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className={`p-3 rounded-xl ${colors.bg} border`}
            style={{ borderColor: colors.border }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </motion.div>
          <TrendIndicator trend={trend} />
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <motion.div 
              className="metric-value"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {showCountUp ? (
                <CountUp value={value} />
              ) : (
                value
              )}
              {suffix}
            </motion.div>
            <div className="metric-label mt-1.5">{title}</div>
            {subtitle && <div className="text-xs text-[#52525B] mt-1">{subtitle}</div>}
          </div>
          <motion.div 
            className="opacity-60 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
          >
            <MiniChart data={chart} color={colors.chart} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// 系统指标卡片 - 新增
function SystemMetricCard({ 
  title, 
  value,
  suffix = "",
  trend,
  icon: Icon, 
  color
}: {
  title: string;
  value: number;
  suffix?: string;
  trend: { value: number; direction: "up" | "down" | "stable" };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { 
      bg: "bg-[#3B82F6]/10", 
      text: "text-[#60A5FA]",
      border: "border-[#3B82F6]/30"
    },
    green: { 
      bg: "bg-[#10B981]/10", 
      text: "text-[#34D399]",
      border: "border-[#10B981]/30"
    },
    purple: { 
      bg: "bg-[#8B5CF6]/10", 
      text: "text-[#A78BFA]",
      border: "border-[#8B5CF6]/30"
    },
    yellow: { 
      bg: "bg-[#F59E0B]/10", 
      text: "text-[#FBBF24]",
      border: "border-[#F59E0B]/30"
    },
  };

  const colors = colorMap[color];

  return (
    <motion.div 
      className="console-card p-4 relative overflow-hidden group cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="flex-1">
          <div className="text-xs text-[#71717A] mb-0.5">{title}</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{value}{suffix}</span>
            <TrendIndicator trend={trend} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 热力图组件
function HeatmapChart({ data }: { data: { day: string; hour: number; value: number }[] }) {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const hours = [0, 4, 8, 12, 16, 20];
  
  const getValue = (day: string, hour: number) => {
    const item = data.find(d => d.day === day && d.hour === hour);
    return item?.value || 0;
  };
  
  const getColor = (value: number) => {
    if (value === 0) return "rgba(26, 26, 36, 0.8)";
    if (value < 20) return "rgba(59, 130, 246, 0.3)";
    if (value < 40) return "rgba(59, 130, 246, 0.5)";
    if (value < 60) return "rgba(59, 130, 246, 0.7)";
    return "rgba(59, 130, 246, 1)";
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* 时间标签 */}
        <div className="flex items-center mb-2">
          <div className="w-12" />
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-[#71717A]">
              {hour.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        
        {/* 热力图网格 */}
        <div className="space-y-1">
          {days.map((day, dayIndex) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
              className="flex items-center gap-1"
            >
              <div className="w-12 text-xs text-[#71717A] text-right pr-2">{day}</div>
              {hours.map((hour, hourIndex) => {
                const value = getValue(day, hour);
                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: dayIndex * 0.05 + hourIndex * 0.02 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="flex-1 h-8 rounded cursor-pointer relative group"
                    style={{ backgroundColor: getColor(value) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1A1A24] border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      {day} {hour}:00 - {value} 请求
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 任务视图
function TasksView() {
  const [tasks] = useState([
    { _id: "1", title: "非洲涉华情报收集", description: "自动收集并分析非洲涉华情报数据", status: "in_progress", priority: "high", assignee: "系统", tags: ["情报", "非洲"], dueDate: null, progress: 75 },
    { _id: "2", title: "Polymarket 监控", description: "Polymarket 市场数据实时监控", status: "in_progress", priority: "high", assignee: "系统", tags: ["市场", "预测"], dueDate: null, progress: 60 },
    { _id: "3", title: "美国对华政策监控", description: "追踪美国对华政策动态", status: "in_progress", priority: "high", assignee: "系统", tags: ["政策", "美国"], dueDate: null, progress: 80 },
    { _id: "4", title: "QQ邮箱自动清理", description: "自动清理过期邮件", status: "todo", priority: "medium", assignee: "系统", tags: ["自动化", "邮件"], dueDate: Date.now() + 86400000, progress: 0 },
    { _id: "5", title: "Mission Control UI 优化", description: "改进用户界面和交互体验", status: "todo", priority: "medium", assignee: "开发者", tags: ["UI", "开发"], dueDate: Date.now() + 172800000, progress: 45 },
    { _id: "6", title: "卫星遥感报告", description: "生成卫星遥感经济分析报告", status: "done", priority: "high", assignee: "系统", tags: ["报告", "卫星"], dueDate: null, progress: 100 },
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

// 团队视图
function TeamViewWrapper() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <TeamView />
    </motion.div>
  );
}
