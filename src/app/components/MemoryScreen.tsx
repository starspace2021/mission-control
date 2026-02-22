"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Brain, 
  FileText, 
  Calendar, 
  Settings,
  Clock,
  Tag,
  BarChart3,
  X,
  Plus,
  Filter,
  Grid3X3,
  List,
  Star,
  ExternalLink,
  Trash2,
  Edit3,
  Sparkles,
  Zap,
  TrendingUp,
  Bookmark
} from "lucide-react";

interface Memory {
  _id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  importance: number;
  updatedAt: number;
}

interface MemoryScreenProps {
  memories?: Memory[];
}

const typeIcons: Record<string, React.ElementType> = {
  long_term: Brain,
  daily: Calendar,
  project: FileText,
  system: Settings,
};

const typeColors: Record<string, { primary: string; bg: string; light: string; gradient: string }> = {
  long_term: { 
    primary: "#8B5CF6", 
    bg: "rgba(139, 92, 246, 0.15)", 
    light: "rgba(139, 92, 246, 0.1)",
    gradient: "from-[#8B5CF6] to-[#A78BFA]"
  },
  daily: { 
    primary: "#06B6D4", 
    bg: "rgba(6, 182, 212, 0.15)", 
    light: "rgba(6, 182, 212, 0.1)",
    gradient: "from-[#06B6D4] to-[#22D3EE]"
  },
  project: { 
    primary: "#10B981", 
    bg: "rgba(16, 185, 129, 0.15)", 
    light: "rgba(16, 185, 129, 0.1)",
    gradient: "from-[#10B981] to-[#34D399]"
  },
  system: { 
    primary: "#F59E0B", 
    bg: "rgba(245, 158, 11, 0.15)", 
    light: "rgba(245, 158, 11, 0.1)",
    gradient: "from-[#F59E0B] to-[#FBBF24]"
  },
};

const typeLabels: Record<string, string> = {
  long_term: "长期记忆",
  daily: "每日记录",
  project: "项目文档",
  system: "系统文档",
};

// 模拟数据
const mockMemories: Memory[] = [
  {
    _id: "1",
    title: "非洲涉华情报系统",
    content: "建立了完整的非洲涉华情报收集和分析系统，包括定时任务、数据源配置和报告生成流程。系统每日自动生成简报，涵盖政治、经济、安全等多个维度。",
    type: "project",
    tags: ["情报", "非洲", "自动化"],
    importance: 9,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "2",
    title: "卫星遥感经济评估",
    content: "基于NO2排放数据的经济活动评估方法研究，参考世界银行报告。通过分析夜间灯光和大气污染物排放数据，评估区域经济活动水平。",
    type: "project",
    tags: ["卫星遥感", "经济", "研究报告"],
    importance: 8,
    updatedAt: Date.now() - 172800000,
  },
  {
    _id: "3",
    title: "用户画像 - Hourglass",
    content: "OSINT从业者，40岁男性，需要实时情报监控和数据分析。关注非洲涉华情报、美国对华政策等特定领域。工作习惯：多任务并行，重视信息准确性和时效性。",
    type: "long_term",
    tags: ["用户", "OSINT"],
    importance: 10,
    updatedAt: Date.now() - 259200000,
  },
  {
    _id: "4",
    title: "2026-02-22 工作记录",
    content: "完成了卫星遥感报告、非洲情报系统、QQ邮箱配置、Task Board创建。同时建立了美国对华政策监控系统，包括Twitter/X账号监控和新闻源追踪。",
    type: "daily",
    tags: ["日志", "任务"],
    importance: 6,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "5",
    title: "Mission Control 架构",
    content: "Next.js + Convex + Tailwind CSS 技术栈，包含任务看板、日历、记忆系统。采用现代深色控制台设计风格，支持响应式布局和动画效果。",
    type: "system",
    tags: ["架构", "技术栈"],
    importance: 8,
    updatedAt: Date.now() - 432000000,
  },
  {
    _id: "6",
    title: "美国对华政策监控",
    content: "建立了美国对华政策监控系统，包括Twitter/X账号监控、新闻源追踪。每日生成多份简报，覆盖不同时间段的政策动态。",
    type: "project",
    tags: ["对华政策", "监控", "美国"],
    importance: 9,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "7",
    title: "UI自动迭代日志",
    content: "Mission Control UI 自动迭代任务执行记录，包括界面优化、组件升级、样式改进等。",
    type: "system",
    tags: ["UI", "迭代", "自动化"],
    importance: 7,
    updatedAt: Date.now(),
  },
];

export default function MemoryScreen({ memories = mockMemories }: MemoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"updated" | "importance" | "title">("updated");

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch = 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || memory.type === selectedType;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => memory.tags.includes(tag));
    return matchesSearch && matchesType && matchesTags;
  }).sort((a, b) => {
    if (sortBy === "updated") return b.updatedAt - a.updatedAt;
    if (sortBy === "importance") return b.importance - a.importance;
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  const allTags = Array.from(new Set(memories.flatMap(m => m.tags)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedTags([]);
  };

  const avgImportance = filteredMemories.length > 0 
    ? (filteredMemories.reduce((acc, m) => acc + m.importance, 0) / filteredMemories.length).toFixed(1)
    : "0";

  // 统计
  const stats = {
    total: memories.length,
    byType: {
      long_term: memories.filter(m => m.type === 'long_term').length,
      daily: memories.filter(m => m.type === 'daily').length,
      project: memories.filter(m => m.type === 'project').length,
      system: memories.filter(m => m.type === 'system').length,
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "长期记忆", value: stats.byType.long_term, icon: Brain, color: "#8B5CF6" },
          { label: "每日记录", value: stats.byType.daily, icon: Calendar, color: "#06B6D4" },
          { label: "项目文档", value: stats.byType.project, icon: FileText, color: "#10B981" },
          { label: "系统文档", value: stats.byType.system, icon: Settings, color: "#F59E0B" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="console-card p-4 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all"
            onClick={() => setSelectedType(stat.label === "长期记忆" ? "long_term" : 
              stat.label === "每日记录" ? "daily" : 
              stat.label === "项目文档" ? "project" : "system")}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-[#71717A]">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 搜索和筛选栏 */}
      <div className="console-card p-5"
      >
        <div className="flex flex-col lg:flex-row gap-4"
        >
          {/* 搜索 */}
          <div className="flex-1 relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
            <input
              type="text"
              placeholder="搜索记忆..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1A1A24] border border-white/10 rounded-xl 
                         text-white placeholder:text-[#52525B] focus:border-[#3B82F6]/50 
                         focus:outline-none transition-all"
            />
          </div>
          
          {/* 类型筛选 */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-[#1A1A24] border border-white/10 rounded-xl 
                       text-white focus:border-[#3B82F6]/50 focus:outline-none"
          >
            <option value="all">全部类型</option>
            <option value="long_term">长期记忆</option>
            <option value="daily">每日记录</option>
            <option value="project">项目文档</option>
            <option value="system">系统文档</option>
          </select>
          
          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-[#1A1A24] border border-white/10 rounded-xl 
                       text-white focus:border-[#3B82F6]/50 focus:outline-none"
          >
            <option value="updated">最近更新</option>
            <option value="importance">重要度</option>
            <option value="title">名称</option>
          </select>
          
          {/* 视图切换 */}
          <div className="flex bg-[#1A1A24] rounded-xl p-1"
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid" 
                  ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white" 
                  : "text-[#71717A] hover:text-white"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list" 
                  ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white" 
                  : "text-[#71717A] hover:text-white"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          {/* 新建按钮 */}
          <button className="btn-primary flex items-center gap-2 px-5"
          >
            <Plus className="w-4 h-4" />
            新建
          </button>
        </div>

        {/* 标签筛选 */}
        <div className="flex flex-wrap items-center gap-2 mt-4"
        >
          <Filter className="w-4 h-4 text-[#71717A] mr-1" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedTags.includes(tag)
                  ? "bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 text-[#3B82F6] border border-[#3B82F6]/30"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 border border-transparent"
              }`}
            >
              #{tag}
            </button>
          ))}
          {(searchQuery || selectedType !== "all" || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg text-sm text-[#71717A] hover:text-white transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* 统计栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm"
      >
        <div className="flex items-center gap-6"
        >
          <span className="text-[#71717A]"
          >
            共 <span className="text-white font-medium">{filteredMemories.length}</span> 条记忆
          </span>
          <div className="flex items-center gap-2 text-[#71717A]"
          >
            <BarChart3 className="w-4 h-4" />
            <span>平均重要度: <span className="text-white font-medium">{avgImportance}</span>/10</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#71717A]"
        >
          <Clock className="w-4 h-4" />
          <span>最近更新: {new Date(Math.max(...memories.map(m => m.updatedAt))).toLocaleDateString()}</span>
        </div>
      </div>

      {/* 记忆列表 */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredMemories.map((memory, index) => (
              <MemoryCard 
                key={memory._id} 
                memory={memory} 
                index={index}
                onClick={() => setSelectedMemory(memory)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="console-card overflow-hidden"
        >
          <div className="divide-y divide-white/5"
          >
            <AnimatePresence>
              {filteredMemories.map((memory, index) => (
                <MemoryListItem 
                  key={memory._id} 
                  memory={memory} 
                  index={index}
                  onClick={() => setSelectedMemory(memory)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedMemory && (
          <MemoryDetailModal 
            memory={selectedMemory} 
            onClose={() => setSelectedMemory(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 记忆卡片（网格视图）
function MemoryCard({ memory, index, onClick }: { 
  memory: Memory; 
  index: number;
  onClick: () => void;
}) {
  const Icon = typeIcons[memory.type];
  const colors = typeColors[memory.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="console-card p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* 类型指示条 */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
        style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, transparent)` }}
      />

      {/* 背景渐变 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

      {/* 头部 */}
      <div className="flex items-start justify-between mb-3 relative z-10"
      >
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: colors.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: colors.primary }} />
        </div>
        <div className="flex items-center gap-2"
        >
          <span 
            className="text-xs px-2.5 py-1 rounded-lg font-medium"
            style={{ backgroundColor: colors.light, color: colors.primary }}
          >
            {typeLabels[memory.type]}
          </span>
        </div>
      </div>

      {/* 内容 */}
      <h3 className="font-semibold text-white group-hover:text-[#3B82F6] transition-colors mb-2 line-clamp-1 relative z-10"
      >
        {memory.title}
      </h3>
      <p className="text-sm text-[#A1A1AA] line-clamp-2 leading-relaxed relative z-10"
      >
        {memory.content}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 relative z-10"
      >
        {/* 标签 */}
        <div className="flex flex-wrap gap-1"
        >
          {memory.tags.slice(0, 2).map((tag: string) => (
            <span 
              key={tag}
              className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-[#71717A]"
            >
              #{tag}
            </span>
          ))}
          {memory.tags.length > 2 && (
            <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-[#71717A]"
            >
              +{memory.tags.length - 2}
            </span>
          )}
        </div>

        {/* 重要性 */}
        <div className="flex items-center gap-1"
        >
          <Star className="w-3 h-3 text-[#F59E0B]" />
          <span className="text-xs text-[#71717A]">{memory.importance}</span>
        </div>
      </div>

      {/* 更新时间 */}
      <div className="absolute top-4 right-4 text-[10px] text-[#52525B]"
      >
        {new Date(memory.updatedAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}

// 记忆列表项（列表视图）
function MemoryListItem({ memory, index, onClick }: { 
  memory: Memory; 
  index: number;
  onClick: () => void;
}) {
  const Icon = typeIcons[memory.type];
  const colors = typeColors[memory.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className="p-4 hover:bg-white/[0.02] cursor-pointer transition-all group flex items-center gap-4"
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: colors.bg }}
      >
        <Icon className="w-5 h-5" style={{ color: colors.primary }} />
      </div>
      
      <div className="flex-1 min-w-0"
      >
        <h4 className="font-medium text-white group-hover:text-[#3B82F6] transition-colors truncate"
        >
          {memory.title}
        </h4>
        <p className="text-sm text-[#71717A] truncate"
        >
          {memory.content}
        </p>
      </div>
      
      <div className="flex items-center gap-4"
      >
        <div className="flex gap-1"
        >
          {memory.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 text-[#71717A]"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <span 
          className="text-xs px-2 py-1 rounded font-medium"
          style={{ backgroundColor: colors.light, color: colors.primary }}
        >
          {typeLabels[memory.type]}
        </span>
        
        <div className="flex items-center gap-1 text-[#71717A]"
        >
          <Star className="w-3 h-3 text-[#F59E0B]" />
          <span className="text-xs">{memory.importance}</span>
        </div>
        
        <span className="text-xs text-[#52525B] w-20 text-right"
        >
          {new Date(memory.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}

// 记忆详情弹窗
function MemoryDetailModal({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const Icon = typeIcons[memory.type];
  const colors = typeColors[memory.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="console-card w-full max-w-2xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="p-6 border-b border-white/5 sticky top-0 bg-[#111118]/95 backdrop-blur-sm"
          style={{ borderColor: `${colors.primary}30` }}
        >
          <div className="flex items-start justify-between"
          >
            <div className="flex items-center gap-4"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: colors.bg }}
              >
                <Icon className="w-7 h-7" style={{ color: colors.primary }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{memory.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: colors.light, color: colors.primary }}
                  >
                    {typeLabels[memory.type]}
                  </span>
                  <span className="text-xs text-[#71717A]"
                  >
                    更新于 {new Date(memory.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2"
            >
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#71717A] hover:text-white"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#71717A] hover:text-[#EF4444]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#71717A]" />
              </button>
            </div>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6"
        >
          <div>
            <h3 className="text-sm font-medium text-[#71717A] mb-3">内容</h3>
            <p className="text-white leading-relaxed whitespace-pre-wrap">{memory.content}</p>
          </div>

          {/* 标签 */}
          <div>
            <h3 className="text-sm font-medium text-[#71717A] mb-3 flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              标签
            </h3>
            <div className="flex flex-wrap gap-2"
            >
              {memory.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[#A1A1AA] text-sm hover:bg-white/10 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 重要性 */}
          <div>
            <h3 className="text-sm font-medium text-[#71717A] mb-3 flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              重要度
            </h3>
            <div className="flex items-center gap-4"
            >
              <div className="flex gap-1"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i}
                    className="w-3 h-8 rounded-sm transition-all"
                    style={{ 
                      backgroundColor: i < memory.importance 
                        ? colors.primary 
                        : "rgba(255,255,255,0.1)"
                    }}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                {memory.importance}
              </span>
              <span className="text-[#71717A]">/10</span>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
          <button className="px-4 py-2 text-sm text-[#71717A] hover:text-white transition-colors">
            取消
          </button>
          <button 
            className="px-4 py-2 text-sm bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            保存修改
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
