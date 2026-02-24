'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Target,
  BarChart3,
  PieChart,
  Cpu,
  Globe,
  Database,
  Wifi,
  Shield,
  Flame,
  Layers,
  Gauge
} from 'lucide-react';
import { taskTrend, departmentLoad, tasks, agents } from '@/data/mockData';

// 增强的指标数据
const metrics = [
  { label: 'Online Agents', value: '6', sub: '2 offline', color: '#3B82F6', icon: Users, bg: 'rgba(59,130,246,0.08)', trend: { value: 12, direction: 'up' } },
  { label: 'Task Completion', value: '78%', sub: '+12% today', color: '#10B981', icon: CheckCircle2, bg: 'rgba(16,185,129,0.08)', trend: { value: 5, direction: 'up' } },
  { label: 'System Health', value: '99.2%', sub: 'All systems go', color: '#8B5CF6', icon: Activity, bg: 'rgba(139,92,246,0.08)', trend: { value: 0.3, direction: 'up' } },
  { label: 'Active Tasks', value: '12', sub: '3 pending', color: '#F59E0B', icon: Zap, bg: 'rgba(245,158,11,0.08)', trend: { value: 2, direction: 'down' } },
];

// 系统指标数据
const systemMetrics = [
  { label: 'CPU Usage', value: 42, suffix: '%', icon: Cpu, color: '#3B82F6' },
  { label: 'Memory', value: 68, suffix: '%', icon: Database, color: '#8B5CF6' },
  { label: 'Network', value: 95, suffix: 'ms', icon: Wifi, color: '#10B981' },
  { label: 'Security', value: 100, suffix: '%', icon: Shield, color: '#F59E0B' },
];

const recentActivity = [
  { text: 'Africa Intel report generated', time: '2m ago', icon: CheckCircle2, color: '#10B981' },
  { text: 'US-China policy monitoring started', time: '15m ago', icon: Activity, color: '#3B82F6' },
  { text: 'Polymarket briefing created', time: '32m ago', icon: TrendingUp, color: '#8B5CF6' },
  { text: 'System alert: API rate limit at 85%', time: '1h ago', icon: AlertCircle, color: '#F59E0B' },
  { text: 'QQ Mail cleanup completed', time: '2h ago', icon: CheckCircle2, color: '#10B981' },
];

// 计数动画组件
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

// 趋势指示器组件
function TrendIndicator({ trend }: { trend: { value: number; direction: string } }) {
  const isPositive = trend.direction === 'up';
  const isNeutral = trend.direction === 'stable';
  
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
      isPositive ? 'bg-[#10B981]/10 text-[#10B981]' : 
      isNeutral ? 'bg-[#71717A]/10 text-[#71717A]' : 
      'bg-[#EF4444]/10 text-[#EF4444]'
    }`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : 
       isNeutral ? <Minus className="w-3 h-3" /> : 
       <ArrowDownRight className="w-3 h-3" />}
      {trend.value}%
    </div>
  );
}

// 迷你图表组件 - 增强版
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end gap-[2px] h-10">
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm relative overflow-hidden group/bar"
          style={{ backgroundColor: color }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${((value - min) / range) * 100}%`, opacity: 1 }}
          transition={{ delay: i * 0.03, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          whileHover={{ scale: 1.3 }}
        >
          {/* 顶部高光 */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40" />
        </motion.div>
      ))}
    </div>
  );
}

// 迷你面积图组件
function MiniAreaChart({ data, color = "#3B82F6" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = `0,100 ${points} 100,100`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`areaGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={areaPoints}
        fill={`url(#areaGradient-${color.replace('#', '')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// 环形进度组件
function CircularProgress({ value, size = 50, strokeWidth = 4, color = "#3B82F6" }: { 
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
        className="absolute inset-0 rounded-full opacity-20"
        style={{ 
          boxShadow: `0 0 ${size/3}px ${color}`,
          transform: 'scale(0.85)'
        }}
      />
      <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
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
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ 
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 ${strokeWidth/2}px ${color})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <span className="text-xs font-bold" style={{ color }}>
          <CountUp value={value} suffix="%" />
        </span>
      </div>
    </div>
  );
}

// 实时流量指示器
function TrafficIndicator() {
  return (
    <div className="flex items-end gap-[2px] h-6">
      {[0.3, 0.6, 0.4, 0.8, 0.5].map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-[#10B981] to-[#06B6D4] rounded-full"
          animate={{
            height: [`${height * 100}%`, `${(height + 0.3) * 100}%`, `${height * 100}%`],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// 欢迎横幅组件
function WelcomeBanner() {
  const [greeting, setGreeting] = useState('早安');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早安');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="console-card p-6 relative overflow-hidden group"
    >
      {/* 动态背景 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/8 via-[#8B5CF6]/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
      
      {/* 装饰线条 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          </motion.div>
          <span className="text-sm text-[#F59E0B] font-medium">{greeting}</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">欢迎回来，Hourglass</h2>
        <p className="text-[#71717A]">系统运行正常，今日有 5 个定时任务待执行。</p>
      </div>
    </motion.div>
  );
}

// 统计卡片组件 - 增强版
function StatCard({ metric, index }: { metric: typeof metrics[0]; index: number }) {
  const Icon = metric.icon;
  const chartData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85].map(v => v + Math.random() * 20);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="console-card p-5 relative overflow-hidden group cursor-pointer stat-card-premium"
    >
      {/* 背景发光效果 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${metric.color}15, transparent)` }}
      />
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `${metric.color}15` }}
      />
      
      {/* 顶部渐变条 */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(to right, ${metric.color}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className="p-3 rounded-xl transition-all duration-300"
            style={{ background: metric.bg, border: `1px solid ${metric.color}30` }}
            whileHover={{ scale: 1.15, rotate: 5 }}
          >
            <Icon className="w-5 h-5" style={{ color: metric.color }} />
          </motion.div>
          <TrendIndicator trend={metric.trend} />
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <motion.div 
              className="text-3xl font-bold mb-1 metric-value"
              style={{ color: metric.color }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
            >
              {metric.value}
            </motion.div>
            <div className="text-sm font-medium text-white mb-0.5">{metric.label}</div>
            <div className="text-xs text-[#71717A]">{metric.sub}</div>
          </div>
          <motion.div 
            className="opacity-60 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
          >
            <MiniChart data={chartData} color={metric.color} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// 系统指标卡片
function SystemMetricCard({ metric, index }: { metric: typeof systemMetrics[0]; index: number }) {
  const Icon = metric.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card-enhanced p-4 relative overflow-hidden group"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="p-2.5 rounded-xl transition-all duration-300"
          style={{ background: `${metric.color}15`, border: `1px solid ${metric.color}40` }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="w-4 h-4" style={{ color: metric.color }} />
        </motion.div>
        <div className="flex-1">
          <div className="text-xs text-[#71717A] mb-0.5">{metric.label}</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              <CountUp value={metric.value} suffix={metric.suffix} />
            </span>
          </div>
        </div>
        <CircularProgress value={metric.value} size={45} strokeWidth={3} color={metric.color} />
      </div>
    </motion.div>
  );
}

// 任务趋势图表
function TaskTrendChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card-enhanced p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Task Trend (7 days)</h3>
            <p className="text-xs text-[#71717A]">任务完成情况统计</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-[#71717A]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />Created
          </span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-32">
        {taskTrend.map((day, i) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end justify-center h-24">
              <motion.div
                className="w-3 bg-gradient-to-t from-[#3B82F6] to-[#60A5FA] rounded-t chart-interactive"
                initial={{ height: 0 }}
                animate={{ height: `${(day.completed / 25) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
              />
              <motion.div
                className="w-3 bg-gradient-to-t from-[#10B981] to-[#34D399] rounded-t chart-interactive"
                initial={{ height: 0 }}
                animate={{ height: `${(day.created / 25) * 100}%` }}
                transition={{ delay: i * 0.05 + 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
              />
            </div>
            <span className="text-xs text-[#71717A]">{day.day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// 部门负载图表
function DepartmentLoadChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card-enhanced p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Department Load</h3>
            <p className="text-xs text-[#71717A]">各部门工作负载</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {departmentLoad.map((dept, i) => (
          <div key={dept.name} className="flex items-center gap-3 group cursor-pointer">
            <motion.div 
              className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" 
              style={{ backgroundColor: dept.color }}
              whileHover={{ scale: 1.3 }}
            />
            <span className="text-sm text-[#A1A1AA] flex-1 group-hover:text-white transition-colors">{dept.name}</span>
            <div className="flex-1 h-2 bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full transition-all duration-300"
                style={{ backgroundColor: dept.color }}
                initial={{ width: 0 }}
                animate={{ width: `${dept.value}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
            </div>
            <span className="text-sm text-white w-10 text-right tabular-nums">
              <CountUp value={dept.value} suffix="%" />
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// 实时流量监控
function TrafficMonitor() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card-enhanced p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 flex items-center justify-center">
          <Globe className="w-5 h-5 text-[#10B981]" />
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
        <MiniAreaChart data={[45, 52, 48, 60, 55, 68, 72, 65, 58, 62, 70, 75]} color="#10B981" />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <div className="text-lg font-semibold text-white tabular-nums">1.2K</div>
          <div className="text-xs text-[#71717A]">请求/分</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-[#10B981] tabular-nums">98ms</div>
          <div className="text-xs text-[#71717A]">平均延迟</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-[#3B82F6] tabular-nums">99.9%</div>
          <div className="text-xs text-[#71717A]">可用性</div>
        </div>
      </div>
    </motion.div>
  );
}

// 最近活动
function RecentActivity() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card-enhanced p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#06B6D4]/5 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <p className="text-xs text-[#71717A]">系统操作记录</p>
          </div>
        </div>
        <button className="text-sm text-[#3B82F6] hover:text-[#60A5FA] transition-colors">View all →</button>
      </div>
      <div className="space-y-1">
        {recentActivity.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
            >
              <motion.div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform"
                style={{ background: `${a.color}20` }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon className="w-4 h-4" style={{ color: a.color }} />
              </motion.div>
              <span className="text-sm text-white flex-1">{a.text}</span>
              <span className="text-xs text-[#71717A] tabular-nums">{a.time}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 系统资源监控
function SystemResources() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card-enhanced p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC4899]/20 to-[#EC4899]/5 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-[#EC4899]" />
        </div>
        <div>
          <h3 className="font-semibold text-white">System Resources</h3>
          <p className="text-xs text-[#71717A]">实时性能监控</p>
        </div>
      </div>
      <div className="space-y-5">
        {[
          { label: 'CPU Usage', value: 42, color: '#3B82F6', icon: Cpu },
          { label: 'Memory', value: 68, color: '#10B981', icon: Database },
          { label: 'Disk I/O', value: 35, color: '#F59E0B', icon: Target },
        ].map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#A1A1AA] flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
              <span className="text-sm font-medium tabular-nums">
                <CountUp value={item.value} suffix="%" />
              </span>
            </div>
            <div className="h-2 bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full progress-bar-animated"
                style={{ 
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                  boxShadow: `0 0 10px ${item.color}40`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.8 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// 热力图组件
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
      transition={{ delay: 0.7 }}
      className="glass-card-enhanced p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Activity Heatmap</h3>
            <p className="text-xs text-[#71717A]">系统活跃度分布</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="flex">
            <div className="w-12" />
            {hours.map(h => (
              <div key={h} className="flex-1 text-[10px] text-[#71717A] text-center">
                {h}:00
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1 mt-1">
              <div className="w-10 text-[10px] text-[#71717A]">{day}</div>
              <div className="flex-1 flex gap-1">
                {hours.map((hour, hourIndex) => {
                  const intensity = getIntensity(dayIndex, hourIndex);
                  return (
                    <motion.div
                      key={hour}
                      className="flex-1 h-6 rounded heatmap-cell-enhanced"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${0.1 + intensity * 0.9})`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (dayIndex * 12 + hourIndex) * 0.005 }}
                      whileHover={{ scale: 1.3, zIndex: 100 }}
                      title={`${day} ${hour}:00 - Activity: ${Math.round(intensity * 100)}%`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-[#71717A]">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
            <div 
              key={i} 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: `rgba(59, 130, 246, ${op})` }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* 欢迎横幅 */}
      <WelcomeBanner />

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <StatCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* 系统指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemMetrics.map((m, i) => (
          <SystemMetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskTrendChart />
        </div>
        <DepartmentLoadChart />
      </div>

      {/* 流量监控 + 活动日志 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficMonitor />
        <RecentActivity />
      </div>

      {/* 系统资源 + 热力图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemResources />
        <HeatmapChart />
      </div>
    </div>
  );
}
