'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { memories } from '@/data/memories';
import { Search, X, Brain, Calendar, Folder, Settings, Tag } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'long_term' | 'daily' | 'project' | 'system';
  tags: string[];
  importance: number;
  updatedAt: string;
  createdAt?: string;
}

// ========== 配置 ==========
const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  long_term: { icon: Brain, label: 'Long Term', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  daily: { icon: Calendar, label: 'Daily', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  project: { icon: Folder, label: 'Project', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  system: { icon: Settings, label: 'System', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
};

// ========== 子组件 ==========

function HighlightedText({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={i} className="search-highlight-enhanced">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

function MemoryCard({ 
  memory, 
  search, 
  onClick 
}: { 
  memory: Memory; 
  search: string;
  onClick: () => void;
}) {
  const cfg = TYPE_CONFIG[memory.type] || TYPE_CONFIG.daily;
  const Icon = cfg.icon;
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="memory-card-enhanced group"
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      {/* 顶部渐变线 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}60)` }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* 悬停时的背景光效 */}
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${cfg.color}20, transparent)` }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.4 }}
      />
      
      <div className="flex items-start gap-4 relative z-10">
        <motion.div 
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{ background: cfg.bg }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {/* 图标背景光效 */}
          <motion.div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${cfg.color}30, transparent)` }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />
          <Icon className="w-5 h-5 relative z-10" style={{ color: cfg.color }} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-white truncate group-hover:text-[#3b82f6] transition-colors">
              <HighlightedText text={memory.title} search={search} />
            </h4>
            <span className="text-[11px] text-[#52525B] flex-shrink-0">
              {formatDate(memory.updatedAt)}
            </span>
          </div>
          
          <p className="text-sm text-[#A1A1AA] line-clamp-2 mb-3">
            <HighlightedText text={memory.content} search={search} />
          </p>
          
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-[10px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: cfg.bg, color: cfg.color }}
              whileHover={{ scale: 1.05 }}
            >
              {cfg.label}
            </motion.span>
            
            {/* 重要性指示器 */}
            <div className="importance-indicator">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`importance-dot ${i < memory.importance ? 'active' : ''}`}
                />
              ))}
            </div>
            
            {memory.tags?.slice(0, 2).map((tag, index) => (
              <motion.span 
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#71717A] hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05, y: -1 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                #{tag}
              </motion.span>
            ))}
            {memory.tags && memory.tags.length > 2 && (
              <span className="text-[10px] text-[#52525B]">+{memory.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MemoryModal({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const cfg = TYPE_CONFIG[memory.type] || TYPE_CONFIG.daily;
  const Icon = cfg.icon;
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: cfg.bg }}
              >
                <Icon className="w-6 h-6" style={{ color: cfg.color }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{memory.title}</h2>
                <span className="text-xs text-[#71717A]">{formatDate(memory.updatedAt)}</span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#71717A]" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-[#A1A1AA] leading-relaxed mb-4 whitespace-pre-wrap">{memory.content}</p>
          
          <div className="flex flex-wrap gap-2">
            {memory.tags?.map(tag => (
              <span 
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 flex justify-end">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== 主组件 ==========
export default function MemoryArchive() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Memory | null>(null);

  // 使用构建时加载的记忆数据
  const allTags = useMemo(() => 
    Array.from(new Set(memories.flatMap(m => m.tags || []))),
    []
  );

  const filtered = useMemo(() => 
    memories.filter(m => {
      if (activeType && m.type !== activeType) return false;
      if (activeTags.length > 0 && !activeTags.some(t => (m.tags || []).includes(t))) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && 
          !m.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [activeType, activeTags, search]
  );

  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-5">
      {/* 搜索和筛选 */}
      <div className="glass-card-v4 p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="input pl-10 pr-16 bg-[#0a0a0f]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#52525B] bg-white/5 px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        {/* 类型筛选 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const Icon = cfg.icon;
            const isActive = activeType === type;
            
            return (
              <button 
                key={type} 
                onClick={() => setActiveType(activeType === type ? null : type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'text-white' 
                    : 'text-[#71717A] hover:text-white bg-white/5 hover:bg-white/8'
                }`}
                style={isActive ? { background: cfg.bg, color: cfg.color } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* 标签云 */}
        {allTags.length > 0 && (
          <div className="tag-cloud gap-y-2">
            {allTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => toggleTag(tag)}
                className={`tag-cloud-item ${activeTags.includes(tag) ? 'active' : ''}`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 记忆卡片列表 */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state-enhanced"
            >
              <div className="icon-wrapper">
                <span className="text-3xl">🔍</span>
              </div>
              <div className="empty-state-title">No memories found</div>
              <div className="empty-state-desc">Try adjusting your search or filters</div>
            </motion.div>
          )}
          
          {filtered.map(memory => (
            <MemoryCard 
              key={memory.id}
              memory={memory}
              search={search}
              onClick={() => setSelected(memory)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selected && (
          <MemoryModal 
            memory={selected} 
            onClose={() => setSelected(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
