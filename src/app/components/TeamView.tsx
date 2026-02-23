"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  Briefcase,
  Activity,
  Circle,
  Monitor,
  Clock,
  Cpu,
  TrendingUp,
  Zap,
  Shield,
  Globe
} from "lucide-react";

// 团队数据
const teamData = {
  director: {
    name: "Hourglass",
    role: "Human Director",
    type: "human",
    status: "online",
    avatar: "⚔️",
    description: "团队指挥官",
    currentTask: "监督团队运行"
  },
  caio: {
    name: "侧影",
    role: "Chief AI Officer",
    type: "ai",
    status: "working",
    avatar: "🔬",
    description: "AI协调中枢",
    currentTask: "协调12个子代理"
  },
  departments: [
    {
      id: "intel",
      name: "Africa Intel Department",
      nameZh: "非洲情报部门",
      icon: Globe,
      color: "#E74C3C",
      agents: [
        {
          name: "罗布·路奇",
          role: "Africa Intel Collector",
          anime: "海贼王 · CP9",
          avatar: "🐆",
          status: "working",
          currentTask: "抓取非洲新闻源...",
          gradient: "from-gray-700 to-gray-800"
        },
        {
          name: "奈良鹿丸",
          role: "Intel Analyst",
          anime: "火影忍者 · 木叶",
          avatar: "🦌",
          status: "online",
          currentTask: "等待情报数据...",
          gradient: "from-green-600 to-green-700"
        },
        {
          name: "比克",
          role: "Risk Scoring Agent",
          anime: "七龙珠 · 那美克星",
          avatar: "👽",
          status: "online",
          currentTask: "等待分析任务...",
          gradient: "from-teal-600 to-teal-700"
        }
      ]
    },
    {
      id: "policy",
      name: "US-China Policy Department",
      nameZh: "中美政策部门",
      icon: Shield,
      color: "#9B59B6",
      agents: [
        {
          name: "波风水门",
          role: "Policy Collector",
          anime: "火影忍者 · 四代火影",
          avatar: "⚡",
          status: "working",
          currentTask: "抓取白宫最新声明...",
          gradient: "from-yellow-500 to-yellow-600"
        },
        {
          name: "宇智波鼬",
          role: "Policy Analyst",
          anime: "火影忍者 · 晓",
          avatar: "👁️",
          status: "online",
          currentTask: "等待政策数据...",
          gradient: "from-purple-600 to-purple-700"
        }
      ]
    },
    {
      id: "market",
      name: "Financial Intelligence Department",
      nameZh: "金融情报部门",
      icon: TrendingUp,
      color: "#3498DB",
      agents: [
        {
          name: "山治",
          role: "Prediction Market Collector",
          anime: "海贼王 · 黑足",
          avatar: "👞",
          status: "working",
          currentTask: "抓取Polymarket数据...",
          gradient: "from-gray-800 to-gray-900"
        },
        {
          name: "布尔玛",
          role: "Market Signal Analyst",
          anime: "七龙珠 · 科学家",
          avatar: "🔧",
          status: "online",
          currentTask: "等待市场数据...",
          gradient: "from-blue-500 to-blue-600"
        }
      ]
    },
    {
      id: "engineering",
      name: "Engineering Department",
      nameZh: "工程部门",
      icon: Cpu,
      color: "#2ECC71",
      agents: [
        {
          name: "弗兰奇",
          role: "UI Developer Agent",
          anime: "海贼王 · 改造人",
          avatar: "🤖",
          status: "working",
          currentTask: "优化Mission Control UI...",
          gradient: "from-red-500 to-red-600"
        },
        {
          name: "卡卡西",
          role: "Backend Developer Agent",
          anime: "火影忍者 · 拷贝忍者",
          avatar: "📖",
          status: "online",
          currentTask: "等待开发任务...",
          gradient: "from-gray-500 to-gray-600"
        },
        {
          name: "天津饭",
          role: "QA Agent",
          anime: "七龙珠 · 三眼",
          avatar: "👁️‍🗨️",
          status: "online",
          currentTask: "等待质量评估任务...",
          gradient: "from-orange-600 to-orange-700"
        }
      ]
    },
    {
      id: "admin",
      name: "Memory & Admin",
      nameZh: "记忆与管理",
      icon: Zap,
      color: "#F1C40F",
      agents: [
        {
          name: "乔巴",
          role: "Memory Manager Agent",
          anime: "海贼王 · 船医",
          avatar: "🦌",
          status: "online",
          currentTask: "等待每日备份时间...",
          gradient: "from-pink-500 to-pink-600"
        },
        {
          name: "克林",
          role: "System Maintenance Agent",
          anime: "七龙珠 · 地球战士",
          avatar: "💪",
          status: "working",
          currentTask: "清理QQ邮箱垃圾邮件...",
          gradient: "from-orange-500 to-orange-600"
        }
      ]
    }
  ]
};

// 状态指示器 - v3.0 优化版
function StatusIndicator({ status }: { status: string }) {
  const config = {
    online: {
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.15)",
      animate: false
    },
    working: {
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.15)",
      animate: true
    },
    offline: {
      color: "#71717A",
      bg: "rgba(113, 113, 122, 0.15)",
      animate: false
    }
  };

  const { color, bg, animate } = config[status as keyof typeof config] || config.offline;

  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <motion.div
        className="w-2.5 h-2.5 rounded-full"
        style={{ 
          backgroundColor: color, 
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40` 
        }}
        animate={animate ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {animate && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: bg }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-4 h-4 rounded-full border-2"
            style={{ borderColor: color }}
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </>
      )}
    </div>
  );
}

// 领导卡片 - v3.0 优化版
function LeaderCard({
  name,
  role,
  type,
  status,
  avatar,
  description,
  currentTask,
  isDirector = false
}: {
  name: string;
  role: string;
  type: string;
  status: string;
  avatar: string;
  description: string;
  currentTask: string;
  isDirector?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`console-card p-6 relative overflow-hidden group ${isDirector ? 'neon-glow' : ''}`}
    >
      {/* 背景渐变 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isDirector
        ? 'from-amber-500/10 via-red-500/5 to-transparent'
        : 'from-purple-500/10 via-blue-500/5 to-transparent'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* 顶部装饰条 */}
      <motion.div 
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isDirector
          ? 'from-amber-500 to-red-500'
          : 'from-purple-500 to-blue-500'
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${isDirector
              ? 'bg-gradient-to-br from-amber-500 to-red-500 shadow-amber-500/30'
              : 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-purple-500/30'
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {avatar}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <StatusIndicator status={status} />
            </div>
            <p className={`text-sm font-medium ${isDirector ? 'text-amber-400' : 'text-purple-400'}`}>{role}</p>
            <p className="text-xs text-[#71717A] mt-1">{description}</p>
          </div>
        </div>

        {/* 当前任务 */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 text-sm">
            <Monitor className="w-4 h-4 text-[#71717A]" />
            <span className="text-[#A1A1AA]">{currentTask}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 代理卡片 - v3.0 优化版
function AgentCard({ agent, deptColor }: { agent: any; deptColor: string }) {
  const isWorking = agent.status === "working";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`console-card p-4 relative overflow-hidden group ${isWorking ? 'neon-glow' : ''}`}
    >
      {/* 工作中动画效果 */}
      {isWorking && (
        <motion.div 
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${deptColor}, transparent)` }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* 左侧部门色条 */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: deptColor }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      />

      <div className="flex items-start gap-3 pl-3">
        <motion.div 
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-2xl shadow-lg`}
          whileHover={{ scale: 1.1, rotate: 3 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {agent.avatar}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white truncate group-hover:text-[#3B82F6] transition-colors">{agent.name}</h4>
            <StatusIndicator status={agent.status} />
          </div>
          <p className="text-xs text-[#71717A]">{agent.anime}</p>
          <p className="text-xs text-[#52525B] mt-1 truncate">{agent.role}</p>
        </div>
      </div>

      {/* 当前任务 */}
      <div className={`mt-3 p-2.5 rounded-lg text-xs truncate transition-all ${isWorking ? 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20' : 'bg-white/5 text-[#A1A1AA]'}`}>
        {isWorking && (
          <motion.span 
            className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B] mr-2"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        {agent.currentTask}
      </div>

      {/* 工作中图标 */}
      {isWorking && (
        <motion.div 
          className="absolute bottom-3 right-3"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Monitor className="w-4 h-4 text-[#F59E0B]" />
        </motion.div>
      )}
    </motion.div>
  );
}

// 部门区块 - v3.0 优化版
function DepartmentSection({ dept }: { dept: any }) {
  const Icon = dept.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="console-card overflow-hidden"
    >
      {/* 部门头部 */}
      <div
        className="p-4 border-b border-white/5 relative overflow-hidden"
        style={{ backgroundColor: `${dept.color}10` }}
      >
        {/* 背景装饰 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `linear-gradient(135deg, ${dept.color}30, transparent)` }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ 
              backgroundColor: `${dept.color}30`, 
              boxShadow: `0 4px 20px ${dept.color}40` 
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="w-5 h-5" style={{ color: dept.color }} />
          </motion.div>
          <div>
            <h3 className="font-semibold text-white">{dept.name}</h3>
            <p className="text-xs text-[#71717A]">{dept.nameZh} · {dept.agents.length} 成员</p>
          </div>
        </div>
      </div>

      {/* 代理列表 */}
      <div className="p-4 space-y-3">
        {dept.agents.map((agent: any, index: number) => (
          <AgentCard key={index} agent={agent} deptColor={dept.color} />
        ))}
      </div>
    </motion.div>
  );
}

// 统计面板 - v3.0 优化版
function StatsPanel() {
  const stats = [
    { label: "在线", value: 14, color: "#10B981", icon: Circle, bgColor: "rgba(16, 185, 129, 0.15)" },
    { label: "工作中", value: 5, color: "#F59E0B", icon: Activity, bgColor: "rgba(245, 158, 11, 0.15)" },
    { label: "待命", value: 9, color: "#3B82F6", icon: Clock, bgColor: "rgba(59, 130, 246, 0.15)" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
          whileHover={{ y: -6, scale: 1.03 }}
          className="console-card p-4 text-center group cursor-pointer"
        >
          <motion.div
            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: stat.bgColor }}
            whileHover={{ scale: 1.15, rotate: 5 }}
          >
            <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
          </motion.div>
          
          <motion.div
            className="text-2xl font-bold"
            style={{ color: stat.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            {stat.value}
          </motion.div>
          
          <div className="text-xs text-[#71717A] mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// 主组件
export default function TeamView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Users className="w-6 h-6 text-[#3B82F6]" />
            团队组织架构
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            Human Director + CAIO + 5 Departments + 12 Subagents
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#71717A]">
          <span>🏴‍☠️ 海贼王</span>
          <span>·</span>
          <span>⚡ 火影忍者</span>
          <span>·</span>
          <span>🍥 七龙珠</span>
        </div>
      </div>

      {/* 统计 */}
      <StatsPanel />

      {/* 领导层 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeaderCard {...teamData.director} isDirector={true} />
        <LeaderCard {...teamData.caio} />
      </div>

      {/* 部门 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamData.departments.map((dept) => (
          <DepartmentSection key={dept.id} dept={dept} />
        ))}
      </div>

      {/* 底部说明 */}
      <div className="glass-card-enhanced p-4 text-sm text-[#71717A]">
        <p className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>团队总计: 14个角色 (1 Human + 1 CAIO + 12 Subagents) · 21个定时任务 · 3个进行中项目</span>
        </p>
      </div>
    </motion.div>
  );
}
