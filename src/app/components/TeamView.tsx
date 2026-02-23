"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  UserCog, 
  Briefcase,
  Activity,
  Circle,
  Monitor,
  Clock
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
      name: "Intel Department",
      nameZh: "情报部门",
      icon: "🕵️",
      color: "#E74C3C",
      agents: [
        { 
          name: "罗布·路奇", 
          role: "Africa Intel Collector", 
          anime: "海贼王 · CP9",
          avatar: "🐆",
          status: "working",
          currentTask: "抓取非洲新闻源...",
          color: "from-gray-700 to-gray-800"
        },
        { 
          name: "奈良鹿丸", 
          role: "Intel Analyst", 
          anime: "火影忍者 · 木叶",
          avatar: "🦌",
          status: "online",
          currentTask: "等待情报数据...",
          color: "from-green-600 to-green-700"
        },
        { 
          name: "比克", 
          role: "Risk Scoring Agent", 
          anime: "七龙珠 · 那美克星",
          avatar: "👽",
          status: "online",
          currentTask: "等待分析任务...",
          color: "from-teal-600 to-teal-700"
        }
      ]
    },
    {
      id: "policy",
      name: "Policy Department",
      nameZh: "政策监控部门",
      icon: "📜",
      color: "#9B59B6",
      agents: [
        { 
          name: "波风水门", 
          role: "Policy Collector", 
          anime: "火影忍者 · 四代火影",
          avatar: "⚡",
          status: "working",
          currentTask: "抓取白宫最新声明...",
          color: "from-yellow-500 to-yellow-600"
        },
        { 
          name: "宇智波鼬", 
          role: "Policy Analyst", 
          anime: "火影忍者 · 晓",
          avatar: "👁️",
          status: "online",
          currentTask: "等待政策数据...",
          color: "from-purple-600 to-purple-700"
        }
      ]
    },
    {
      id: "market",
      name: "Market Department",
      nameZh: "市场情报部门",
      icon: "📊",
      color: "#3498DB",
      agents: [
        { 
          name: "山治", 
          role: "Prediction Market Collector", 
          anime: "海贼王 · 黑足",
          avatar: "👞",
          status: "working",
          currentTask: "抓取Polymarket数据...",
          color: "from-gray-800 to-gray-900"
        },
        { 
          name: "布尔玛", 
          role: "Market Signal Analyst", 
          anime: "七龙珠 · 科学家",
          avatar: "🔧",
          status: "online",
          currentTask: "等待市场数据...",
          color: "from-blue-500 to-blue-600"
        }
      ]
    },
    {
      id: "engineering",
      name: "Engineering Department",
      nameZh: "工程部门",
      icon: "⚙️",
      color: "#2ECC71",
      agents: [
        { 
          name: "弗兰奇", 
          role: "UI Developer Agent", 
          anime: "海贼王 · 改造人",
          avatar: "🤖",
          status: "working",
          currentTask: "优化Mission Control UI...",
          color: "from-red-500 to-red-600"
        },
        { 
          name: "卡卡西", 
          role: "Backend Developer Agent", 
          anime: "火影忍者 · 拷贝忍者",
          avatar: "📖",
          status: "online",
          currentTask: "等待开发任务...",
          color: "from-gray-500 to-gray-600"
        },
        { 
          name: "天津饭", 
          role: "QA Agent", 
          anime: "七龙珠 · 三眼",
          avatar: "👁️‍🗨️",
          status: "online",
          currentTask: "等待质量评估任务...",
          color: "from-orange-600 to-orange-700"
        }
      ]
    },
    {
      id: "admin",
      name: "Memory & Admin",
      nameZh: "记忆与管理",
      icon: "🗄️",
      color: "#F1C40F",
      agents: [
        { 
          name: "乔巴", 
          role: "Memory Manager Agent", 
          anime: "海贼王 · 船医",
          avatar: "🦌",
          status: "online",
          currentTask: "等待每日备份时间...",
          color: "from-pink-500 to-pink-600"
        },
        { 
          name: "克林", 
          role: "System Maintenance Agent", 
          anime: "七龙珠 · 地球战士",
          avatar: "💪",
          status: "working",
          currentTask: "清理QQ邮箱垃圾邮件...",
          color: "from-orange-500 to-orange-600"
        }
      ]
    }
  ]
};

// 状态指示器
function StatusIndicator({ status }: { status: string }) {
  const colors = {
    online: "bg-green-500",
    working: "bg-yellow-500",
    offline: "bg-gray-500"
  };
  
  return (
    <div className="relative">
      <div className={`w-2.5 h-2.5 rounded-full ${colors[status as keyof typeof colors]}`} />
      {status === "working" && (
        <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${colors[status as keyof typeof colors]} animate-ping`} />
      )}
    </div>
  );
}

// 领导卡片
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
      className={`p-6 rounded-2xl border ${isDirector 
        ? 'bg-gradient-to-br from-amber-500/10 to-red-500/10 border-amber-500/30' 
        : 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isDirector 
          ? 'bg-gradient-to-br from-amber-500 to-red-500' 
          : 'bg-gradient-to-br from-purple-500 to-blue-500'
        }`}>
          {avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{name}</h3>
            <StatusIndicator status={status} />
          </div>
          <p className={`text-sm ${isDirector ? 'text-amber-400' : 'text-purple-400'}`}>{role}</p>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-4 p-3 bg-black/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Monitor className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{currentTask}</span>
        </div>
      </div>
    </motion.div>
  );
}

// 代理卡片
function AgentCard({ agent, deptColor }: { agent: any; deptColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${agent.color} bg-opacity-10 border border-white/10 relative overflow-hidden group`}
    >
      {/* 工作中动画效果 */}
      {agent.status === "working" && (
        <div className="absolute top-0 left-0 right-0 h-0.5">
          <div 
            className="h-full animate-pulse"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${deptColor}, transparent)`,
              animation: "shimmer 2s infinite"
            }}
          />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{agent.name}</h4>
            <StatusIndicator status={agent.status} />
          </div>
          <p className="text-xs text-gray-400">{agent.anime}</p>
          <p className="text-xs text-gray-500 mt-1 truncate">{agent.role}</p>
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-black/30 rounded text-xs text-gray-300 truncate">
        {agent.currentTask}
      </div>
      
      {/* 电脑图标 - 工作中显示 */}
      {agent.status === "working" && (
        <div className="absolute bottom-2 right-2">
          <Monitor className="w-4 h-4 text-gray-500" />
        </div>
      )}
    </motion.div>
  );
}

// 部门区块
function DepartmentSection({ dept }: { dept: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
    >
      {/* 部门头部 */}
      <div className="p-4 border-b border-white/10" style={{ backgroundColor: `${dept.color}15` }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${dept.color}30` }}
          >
            {dept.icon}
          </div>
          <div>
            <h3 className="font-semibold">{dept.name}</h3>
            <p className="text-xs text-gray-400">{dept.nameZh} · {dept.agents.length} 成员</p>
          </div>
        </div>
      </div>
      
      {/* 代理列表 */}
      <div className="p-4 grid gap-3">
        {dept.agents.map((agent: any, index: number) => (
          <AgentCard key={index} agent={agent} deptColor={dept.color} />
        ))}
      </div>
    </motion.div>
  );
}

// 统计面板
function StatsPanel() {
  const stats = [
    { label: "在线", value: 14, color: "#10B981", icon: Circle },
    { label: "工作中", value: 5, color: "#F59E0B", icon: Activity },
    { label: "待命", value: 9, color: "#3B82F6", icon: Clock },
  ];
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
        >
          <div 
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: `${stat.color}20` }}
          >
            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          <div className="text-xs text-gray-400">{stat.label}</div>
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            团队组织架构
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Human Director + CAIO + 5 Departments + 12 Subagents
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
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
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
        <p className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>团队总计: 14个角色 (1 Human + 1 CAIO + 12 Subagents) · 21个定时任务 · 3个进行中项目</span>
        </p>
      </div>
    </motion.div>
  );
}
