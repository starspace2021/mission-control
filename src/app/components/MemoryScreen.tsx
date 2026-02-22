"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, FileText, Calendar, Settings } from "lucide-react";

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
  memories: Memory[];
}

const typeIcons: Record<string, React.ElementType> = {
  long_term: Brain,
  daily: Calendar,
  project: FileText,
  system: Settings,
};

const typeColors: Record<string, string> = {
  long_term: "#b829dd",
  daily: "#00f5ff",
  project: "#00ff88",
  system: "#ff0080",
};

export default function MemoryScreen({ memories }: MemoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || memory.type === selectedType;
    return matchesSearch && matchesType;
  });

  const allTags = Array.from(new Set(memories.flatMap(m => m.tags)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* 搜索栏 */}
      <div className="glass-card p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="SEARCH MEMORY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder:text-white/30 focus:border-[#00f5ff]/50 
                         focus:outline-none transition-colors font-mono"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                       text-white focus:border-[#00f5ff]/50 focus:outline-none"
          >
            <option value="all">ALL TYPES</option>
            <option value="long_term">LONG TERM</option>
            <option value="daily">DAILY</option>
            <option value="project">PROJECT</option>
            <option value="system">SYSTEM</option>
          </select>
        </div>

        {/* 标签筛选 */}
        <div className="flex flex-wrap gap-2 mt-4">
          {allTags.map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-white/5 text-white/50 hover:bg-white/10 transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 记忆网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredMemories.map((memory, index) => {
            const Icon = typeIcons[memory.type];
            const color = typeColors[memory.type];
            
            return (
              <motion.div
                key={memory._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card p-5 cursor-pointer group relative overflow-hidden"
              >
                {/* 类型指示 */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: color }}
                />

                {/* 头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-xs text-white/30 font-mono">
                    {new Date(memory.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* 内容 */}
                <h3 className="font-bold text-white group-hover:text-[#00f5ff] transition-colors mb-2">
                  {memory.title}
                </h3>
                <p className="text-sm text-white/50 line-clamp-3">
                  {memory.content.substring(0, 150)}...
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {memory.tags.map((tag: string) => (
                    <span 
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 重要性指示 */}
                <div className="absolute bottom-4 right-4 flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i}
                      className="w-1 h-3 rounded-sm"
                      style={{ 
                        backgroundColor: i < memory.importance 
                          ? color 
                          : "rgba(255,255,255,0.1)"
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
