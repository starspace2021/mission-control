"use client";

import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  Calendar, 
  Tag,
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  Clock,
  AlertCircle,
  CheckCircle2
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
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const columns = [
    { id: "todo", title: "待办", titleEn: "TO DO", color: "#71717A", bgColor: "rgba(113, 113, 122, 0.1)", icon: AlertCircle },
    { id: "in_progress", title: "进行中", titleEn: "IN PROGRESS", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)", icon: Clock },
    { id: "review", title: "审核中", titleEn: "REVIEW", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)", icon: Filter },
    { id: "done", title: "已完成", titleEn: "DONE", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)", icon: CheckCircle2 },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* 工具栏 - 增强版 */}
      <div className="console-card p-4"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 flex-1 w-full lg:w-auto"
          >
            {/* 搜索 */}
            <div className="relative max-w-xs w-full"
            >
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
            <div className="flex items-center gap-2"
            >
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

            {/* 视图切换 */}
            <div className="flex bg-[#1A1A24] rounded-lg p-1"
            >
              <button
                onClick={() => setViewMode("board")}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === "board" 
                    ? "bg-[#3B82F6] text-white" 
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                看板
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === "list" 
                    ? "bg-[#3B82F6] text-white" 
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                列表
              </button>
            </div>
          </div>
          
          {/* 新建按钮 */}
          <button className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-sm"
        >
          <span className="text-[#71717A]">
            共 <span className="text-white font-medium">{filteredTasks.length}</span> 个任务
          </span>
          <span className="text-[#71717A]">
            进行中: <span className="text-[#3B82F6] font-medium">{filteredTasks.filter(t => t.status === 'in_progress').length}</span>
          </span>
          <span className="text-[#71717A]">
            已完成: <span className="text-[#10B981] font-medium">{filteredTasks.filter(t => t.status === 'done').length}</span>
          </span>
        </div>
      </div>

      {/* 看板视图 */}
      {viewMode === "board" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            const Icon = column.icon;
            
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
                  <div className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2"
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: column.bgColor }}
                      >
                        <Icon className="w-4 h-4" style={{ color: column.color }} />
                      </div>
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
                  <div className="text-xs text-[#52525B] mt-1"
                  >
                    {column.titleEn}
                  </div>
                </div>

                {/* 任务列表 */}
                <div className="p-3 space-y-3 flex-1"
                >
                  {columnTasks.map((task, index) => (
                    <TaskCard 
                      key={task._id} 
                      task={task} 
                      index={index}
                    />
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-[#52525B]"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center mb-4 border border-white/5"
                      >
                        <Plus className="w-6 h-6 opacity-50" />
                      </div>
                      <span className="text-sm font-medium">暂无任务</span>
                      <span className="text-xs mt-1 opacity-60">点击添加新任务</span>
                    </motion.div>
                  )}
                </div>

                {/* 添加按钮 */}
                <div className="p-3 border-t border-white/5"
                >
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
      ) : (
        /* 列表视图 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="console-card overflow-hidden"
        >
          <div className="divide-y divide-white/5"
          >
            {filteredTasks.map((task, index) => (
              <TaskListItem key={task._id} task={task} index={index} />
            ))}
          </div>
        </motion.div>
      )}
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
      <div className="pl-3"
      >
        {/* 头部 */}
        <div className="flex items-start justify-between mb-2"
        >
          <h4 className="font-medium text-white group-hover:text-[#3B82F6] transition-colors line-clamp-2"
          >
            {task.title}
          </h4>
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
          </button>
        </div>
        
        <p className="text-sm text-[#71717A] mt-1 line-clamp-2"
        >
          {task.description}
        </p>
        
        {/* 优先级标签 */}
        <div className="mt-3"
        >
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
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs"
        >
          <span className="flex items-center gap-1 text-[#71717A]"
          >
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
            >
              {task.assignee.charAt(0)}
            </div>
            {task.assignee}
          </span>
          
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[#71717A] ml-auto"
            >
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* 标签 */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3"
          >
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

function TaskListItem({ task, index }: { 
  task: Task; 
  index: number;
}) {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    high: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]" },
    medium: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
    low: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]" },
  };

  const priorityConfig = priorityColors[task.priority];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-4 hover:bg-white/[0.02] transition-all group flex items-center gap-4"
    >
      <div className={`w-2 h-2 rounded-full ${priorityConfig.bg.replace('/10', '')}`} />
      
      <div className="flex-1 min-w-0"
      >
        <h4 className="font-medium text-white group-hover:text-[#3B82F6] transition-colors truncate"
        >
          {task.title}
        </h4>
        <p className="text-sm text-[#71717A] truncate"
        >
          {task.description}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 text-[#71717A]">
              #{tag}
            </span>
          ))}
        </div>
        
        <span className={`text-xs px-2 py-1 rounded font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
          {task.priority}
        </span>
        
        <span className="text-xs text-[#71717A] w-20 text-right">
          {task.assignee}
        </span>
        
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all">
          <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
        </button>
      </div>
    </motion.div>
  );
}
