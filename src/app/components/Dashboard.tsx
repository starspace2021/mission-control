'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
}

// ========== 数据 ==========
const METRICS: Metric[] = [
  { label: 'Online Agents', value: '6', sub: '2 offline', color: '#4A7BFF', icon: Users, trend: { value: 12, direction: 'up' } },
  { label: 'Task Completion', value: '78%', sub: '+12% today', color: '#22C55E', icon: CheckCircle2, trend: { value: 5, direction: 'up' } },
  { label: 'System Health', value: '99.2%', sub: 'All systems go', color: '#8B5CF6', icon: Activity, trend: { value: 0.3, direction: 'up' } },
  { label: 'Active Tasks', value: '12', sub: '3 pending', color: '#F59E0B', icon: Zap, trend: { value: 2, direction: 'down' } },
];

const SYSTEM_METRICS: SystemMetric[] = [
  { label: 'CPU Usage', value: 42, suffix: '%', icon: Cpu, color: '#4A7BFF' },
  { label: 'Memory', value: 68, suffix: '%', icon: Database, color: '#8B5CF6' },
  { label: 'Network', value: 95, suffix: 'ms', icon: Wifi, color: '#22C55E' },
  { label: 'Security', value: 100, suffix: '%', icon: Shield, color: '#F59E0B' },
];

const RECENT_ACTIVITIES: Activity[] = [
  { text: 'Africa Intel report generated', time: '2m ago', icon: CheckCircle2, color: '#22C55E' },
  { text: 'US-China policy monitoring started', time: '15m ago', icon: Activity, color: '#4A7BFF' },
  { text: 'Polymarket briefing created', time: '32m ago', icon: BarChart3, color: '#8B5CF6' },
  { text: 'System alert: API rate limit at 85%', time: '1h ago', icon: Target, color: '#F59E0B' },
  { text: 'QQ Mail cleanup completed', time: '2h ago', icon: CheckCircle2, color: '#22C55E' },
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
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
      isPositive ? 'bg-[#22C55E]/10 text-[#22C55E]' :
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

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((value, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${((value - min) / range) * 100}%` }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
        />
      ))}
    </div>
  );
}

function CircularProgress({ value, size = 40, strokeWidth = 3, color = "#4A7BFF" }: {
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
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A7BFF]/5 via-[#8B5CF6]/3 to-transparent" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-sm text-[#F59E0B] font-medium">{greeting}</span>
            <span className="text-xs text-[#52525B]">•</span>
            <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
              <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
              系统运行正常
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">欢迎回来，Hourglass</h2>
          <p className="text-[#71717A]">系统运行正常，今日有 5 个定时任务待执行。</p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#22C55E]">98.5%</div>
            <div className="text-xs text-[#71717A] mt-1">系统健康度</div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-bold text-[#4A7BFF] tabular-nums">
              {currentTime.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-[#71717A] mt-1">当前时间</div>
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
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="card card-interactive p-5 relative overflow-hidden group"
    >
      <div 
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(to right, ${metric.color}, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `${metric.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: metric.color }} />
          </div>
          <TrendIndicator trend={metric.trend} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold mb-1" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="text-sm font-medium text-white mb-0.5">{metric.label}</div>
            <div className="text-xs text-[#71717A]">{metric.sub}</div>
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
      transition={{ delay: 0.25 + index * 0.06 }}
      className="card p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-xl"
          style={{ background: `${metric.color}12` }}
        >
          <Icon className="w-4 h-4" style={{ color: metric.color }} />
        </div>
        <div className="flex-1">
          <div className="text-xs text-[#71717A] mb-0.5">{metric.label}</div>
          <span className="text-base font-bold text-white">
            <CountUp value={metric.value} suffix={metric.suffix} />
          </span>
        </div>
        <CircularProgress value={metric.value} size={36} strokeWidth={3} color={metric.color} />
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
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A7BFF]/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#4A7BFF]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Task Trend (7 days)</h3>
            <p className="text-xs text-[#71717A]">任务完成情况统计</p>
          </div>
        </div>
        <div className="flex gap-3 text-xs text-[#71717A]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4A7BFF]" />Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />Created
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {taskTrend.map((day, i) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end justify-center h-16">
              <motion.div
                className="w-2 bg-[#4A7BFF] rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${(day.completed / 25) * 100}%` }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              />
              <motion.div
                className="w-2 bg-[#22C55E] rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${(day.created / 25) * 100}%` }}
                transition={{ delay: i * 0.04 + 0.08, duration: 0.4 }}
              />
            </div>
            <span className="text-[10px] text-[#71717A]">{day.day}</span>
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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
          <PieChart className="w-4 h-4 text-[#8B5CF6]" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Department Load</h3>
          <p className="text-xs text-[#71717A]">各部门工作负载</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {departmentLoad.map((dept, i) => (
          <div key={dept.name} className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: dept.color }}
            />
            <span className="text-xs text-[#A1A1AA] flex-1">{dept.name}</span>
            <div className="flex-1 h-1.5 bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: dept.color }}
                initial={{ width: 0 }}
                animate={{ width: `${dept.value}%` }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              />
            </div>
            <span className="text-xs text-white w-8 text-right tabular-nums">
              <CountUp value={dept.value} suffix="%" />
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TrafficMonitor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-[#22C55E]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">实时流量</h3>
          <p className="text-xs text-[#71717A]">数据请求/秒</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
          <span className="text-xs text-[#22C55E]">Live</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <div className="text-base font-semibold text-white tabular-nums">1.2K</div>
          <div className="text-xs text-[#71717A]">请求/分</div>
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-[#22C55E] tabular-nums">98ms</div>
          <div className="text-xs text-[#71717A]">平均延迟</div>
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-[#4A7BFF] tabular-nums">99.9%</div>
          <div className="text-xs text-[#71717A]">可用性</div>
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
            <p className="text-xs text-[#71717A]">系统操作记录</p>
          </div>
        </div>
        <button className="text-xs text-[#4A7BFF] hover:text-[#5a8bff] transition-colors">View all →</button>
      </div>
      <div className="space-y-1">
        {RECENT_ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.04 }}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${a.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
              </div>
              <span className="text-sm text-white flex-1 truncate">{a.text}</span>
              <span className="text-xs text-[#71717A] tabular-nums">{a.time}</span>
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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#EC4899]/10 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-[#EC4899]" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">System Resources</h3>
          <p className="text-xs text-[#71717A]">实时性能监控</p>
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: 'CPU Usage', value: 42, color: '#4A7BFF', icon: Cpu },
          { label: 'Memory', value: 68, color: '#22C55E', icon: Database },
          { label: 'Disk I/O', value: 35, color: '#F59E0B', icon: Target },
        ].map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-[#A1A1AA] flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </span>
              <span className="text-sm font-medium tabular-nums">
                <CountUp value={item.value} suffix="%" />
              </span>
            </div>
            <div className="h-1.5 bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
          <Flame className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Activity Heatmap</h3>
          <p className="text-xs text-[#71717A]">系统活跃度分布</p>
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
                      className="flex-1 h-5 rounded heatmap-cell"
                      style={{
                        backgroundColor: `rgba(74, 123, 255, ${0.1 + intensity * 0.9})`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (dayIndex * 12 + hourIndex) * 0.002 }}
                      title={`${day} ${hour}:00 - ${Math.round(intensity * 100)}%`}
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
              style={{ backgroundColor: `rgba(74, 123, 255, ${op})` }}
            />
          ))}
        </div>
        <span>More</span>
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
    </div>
  );
}
