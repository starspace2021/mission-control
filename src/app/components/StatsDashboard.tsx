"use client";

import { motion } from "framer-motion";

interface StatsDashboardProps {
  stats: {
    activeTasks: number;
    cronJobs: number;
    memories: number;
    successRate: number;
  };
}

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard 
        title="ACTIVE TASKS" 
        value={stats?.activeTasks || 0} 
        color="cyan" 
        icon="⚡"
        trend="+2"
      />
      <StatCard 
        title="CRON JOBS" 
        value={stats?.cronJobs || 0} 
        color="purple" 
        icon="🔁"
        trend="stable"
      />
      <StatCard 
        title="MEMORIES" 
        value={stats?.memories || 0} 
        color="pink" 
        icon="🧠"
        trend="+5"
      />
      <StatCard 
        title="SUCCESS RATE" 
        value={`${stats?.successRate || 0}%`} 
        color="green" 
        icon="✓"
        trend="100%"
      />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  color, 
  icon,
  trend 
}: { 
  title: string; 
  value: number | string; 
  color: string;
  icon: string;
  trend: string;
}) {
  const colorMap: Record<string, { gradient: string; glow: string }> = {
    cyan: { 
      gradient: "from-[#00f5ff] to-[#0080ff]", 
      glow: "shadow-[#00f5ff]/20" 
    },
    purple: { 
      gradient: "from-[#b829dd] to-[#ff0080]", 
      glow: "shadow-[#b829dd]/20" 
    },
    pink: { 
      gradient: "from-[#ff0080] to-[#ff4444]", 
      glow: "shadow-[#ff0080]/20" 
    },
    green: { 
      gradient: "from-[#00ff88] to-[#00cc66]", 
      glow: "shadow-[#00ff88]/20" 
    },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass-card p-6 relative overflow-hidden group cursor-pointer
                  hover:shadow-lg hover:${colors.glow} transition-all duration-300`}
    >
      {/* 背景渐变 */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 
                    group-hover:opacity-10 transition-opacity duration-300`} 
      />
      
      {/* 发光边框 */}
      <div 
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300`}
        style={{
          background: `linear-gradient(135deg, ${color === 'cyan' ? '#00f5ff' : color === 'purple' ? '#b829dd' : color === 'pink' ? '#ff0080' : '#00ff88'}20, transparent)`,
        }}
      />

      <div className="relative z-10">
        {/* 图标和趋势 */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-3xl">{icon}</span>
          <span className={`text-xs font-mono px-2 py-1 rounded bg-white/5 
                           ${trend.startsWith('+') ? 'text-[#00ff88]' : 'text-white/50'}`}>
            {trend}
          </span>
        </div>
        
        {/* 数值 */}
        <div className={`text-4xl font-bold bg-gradient-to-r ${colors.gradient} 
                         bg-clip-text text-transparent`}
        >
          {value}
        </div>
        
        {/* 标题 */}
        <div className="text-sm text-white/50 mt-1 font-mono tracking-wider">
          {title}
        </div>
      </div>
    </motion.div>
  );
}
