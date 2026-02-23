'use client';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { taskTrend, departmentLoad, tasks, agents } from '@/data/mockData';

const metrics = [
  { label: 'Online Agents', value: '6', sub: '2 offline', color: '#3B82F6', icon: Users, bg: 'rgba(59,130,246,0.08)' },
  { label: 'Task Completion', value: '78%', sub: '+12% today', color: '#10B981', icon: CheckCircle2, bg: 'rgba(16,185,129,0.08)' },
  { label: 'System Health', value: '99.2%', sub: 'All systems go', color: '#8B5CF6', icon: Activity, bg: 'rgba(139,92,246,0.08)' },
  { label: 'Active Tasks', value: '12', sub: '3 pending', color: '#F59E0B', icon: Zap, bg: 'rgba(245,158,11,0.08)' },
];

const recentActivity = [
  { text: 'Africa Intel report generated', time: '2m ago', icon: CheckCircle2, color: '#10B981' },
  { text: 'US-China policy monitoring started', time: '15m ago', icon: Activity, color: '#3B82F6' },
  { text: 'Polymarket briefing created', time: '32m ago', icon: TrendingUp, color: '#8B5CF6' },
  { text: 'System alert: API rate limit at 85%', time: '1h ago', icon: AlertCircle, color: '#F59E0B' },
  { text: 'QQ Mail cleanup completed', time: '2h ago', icon: CheckCircle2, color: '#10B981' },
];

// 迷你图表组件
function MiniChart({ data, color }: { data: number[]; color: string }) {
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

export default function Dashboard() {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div 
              key={m.label} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="console-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div style={{ background: m.bg, borderRadius: '10px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon className="w-5 h-5" style={{ color: m.color }} />
                </div>
                <span className="text-xs text-[#71717A] font-medium">LIVE</span>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: m.color }}>{m.value}</div>
              <div className="text-sm font-semibold text-white mb-1">{m.label}</div>
              <div className="text-xs text-[#71717A]">{m.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="console-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Task Trend (7 days)</h3>
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
                    className="w-2 bg-[#3B82F6] rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.completed / 25) * 100}%` }}
                    transition={{ delay: i * 0.05 }}
                  />
                  <motion.div
                    className="w-2 bg-[#10B981] rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.created / 25) * 100}%` }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  />
                </div>
                <span className="text-xs text-[#71717A]">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Department Load */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="console-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Department Load</h3>
          </div>
          <div className="space-y-3">
            {departmentLoad.map((dept, i) => (
              <div key={dept.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <span className="text-sm text-[#A1A1AA] flex-1">{dept.name}</span>
                <div className="flex-1 h-2 bg-[#1A1A24] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: dept.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.value}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-white w-10 text-right">{dept.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="console-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Recent Activity</h3>
          <button className="text-sm text-[#3B82F6] hover:text-[#60A5FA]">View all →</button>
        </div>
        <div className="space-y-2">
          {recentActivity.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${a.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: a.color }} />
                </div>
                <span className="text-sm text-white flex-1">{a.text}</span>
                <span className="text-xs text-[#71717A]">{a.time}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
