"use client";

import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  Calendar, 
  Tag,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { useState } from "react";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  tags: string[];
  dueDate: number | null;
}

interface TaskBoardProps {
  tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const columns = [
    { id: "todo", title: "待办", titleEn: "TO DO", color: "#71717A", bgColor: "rgba(113, 113, 122, 0.1)" },
    { id: "in_progress", title: "进行中", titleEn: "IN PROGRESS", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" },
    { id: "review", title: "审核中", titleEn: "REVIEW", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)" },
    { id: "done", title: "已完成", titleEn: "DONE", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="console-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* 搜索 */}
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-sm text-white placeholder:text-[#52525B] focus:border-[#3B82F6]/50 focus:outline-none w-full transition-all"
              />
            </div>
            
            {/* 优先级筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#71717A]" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 bg-[#1A1A24] border border-white/10 rounded-lg text-sm text-white focus:border-[#3B82F6]/50 focus:outline-none"
              >
                <option value="all">全部优先级</option>
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
            </div>
          </div>
          
          {/* 新建按钮 */}
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      {/* 看板 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id);
          
          return (
            <div 
              key={column.id} 
              className="console-card min-h-[500px] flex flex-col"
              style={{ backgroundColor: 'rgba(17, 17, 24, 0.6)' }}
            >
              {/* 列标题 */}
              <div 
                className="p-4 border-b border-white/5"
                style={{ borderColor: `${column.color}20` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 
                      className="font-semibold text-sm"
                      style={{ color: column.color }}
                    >
                      {column.title}
                    </h3>
                  </div>
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ 
                      backgroundColor: column.bgColor,
                      color: column.color
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>
                <div className="text-xs text-[#52525B] mt-1">
                  {column.titleEn}
                </div>
              </div>

              {/* 任务列表 */}
              <div className="p-3 space-y-3 flex-1">
                {columnTasks.map((task, index) => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    index={index}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-[#52525B]">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm">暂无任务</span>
                  </div>
                )}
              </div>

              {/* 添加按钮 */}
              <div className="p-3 border-t border-white/5">
                <button className="w-full py-2 flex items-center justify-center gap-2 text-sm text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  添加任务
                </button>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function TaskCard({ task, index }: { 
  task: Task; 
  index: number;
}) {
  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    high: { 
      bg: "rgba(239, 68, 68, 0.1)", 
      text: "#EF4444",
      border: "rgba(239, 68, 68, 0.2)"
    },
    medium: { 
      bg: "rgba(245, 158, 11, 0.1)", 
      text: "#F59E0B",
      border: "rgba(245, 158, 11, 0.2)"
    },
    low: { 
      bg: "rgba(59, 130, 246, 0.1)", 
      text: "#3B82F6",
      border: "rgba(59, 130, 246, 0.2)"
    },
  };

  const priorityConfig = priorityColors[task.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="console-card p-4 cursor-pointer group relative overflow-hidden"
      style={{ backgroundColor: 'rgba(26, 26, 36, 0.6)' }}
    >
      {/* 优先级指示条 */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: priorityConfig.text }}
      />

      {/* 内容 */}
      <div className="pl-3">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-white group-hover:text-[#3B82F6] transition-colors line-clamp-2">
            {task.title}
          </h4>
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all">
            <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
          </button>
        </div>
        
        <p className="text-sm text-[#71717A] mt-1 line-clamp-2">
          {task.description}
        </p>
        
        {/* 优先级标签 */}
        <div className="mt-3">
          <span 
            className="text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider"
            style={{ 
              backgroundColor: priorityConfig.bg,
              color: priorityConfig.text,
              border: `1px solid ${priorityConfig.border}`
            }}
          >
            {task.priority}
          </span>
        </div>
        
        {/* 元信息 */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs">
          <span className="flex items-center gap-1 text-[#71717A]">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
            >
              {task.assignee.charAt(0)}
            </div>
            {task.assignee}
          </span>
          
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[#71717A] ml-auto">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* 标签 */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag: string) => (
              <span 
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA] flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
