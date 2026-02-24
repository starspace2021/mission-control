"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
  Clock4,
  GripVertical,
  TrendingUp,
  Target,
  BarChart3,
  LayoutGrid,
  List,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Edit3,
  Eye,
  CheckSquare,
  Square,
  ArrowRight,
  MessageSquare,
  Paperclip,
  Users,
  Flag,
  Sparkles,
  Zap
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  tags: string[];
  dueDate: number | null;
  progress?: number;
  createdAt?: number;
  updatedAt?: number;
  comments?: number;
  attachments?: number;
  subtasks?: { total: number; completed: number };
}

interface TaskBoardProps {
  tasks: Task[];
}

// 排序选项
type SortOption = "updated" | "priority" | "dueDate" | "progress" | "title";
type SortDirection = "asc" | "desc";

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const columns = [
    { id: "todo", title: "待办", titleEn: "TO DO", color: "#71717A", bgColor: "rgba(113, 113, 122, 0.1)", icon: AlertCircle },
    { id: "in_progress", title: "进行中", titleEn: "IN PROGRESS", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)", icon: Clock },
    { id: "review", title: "审核中", titleEn: "REVIEW", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)", icon: Filter },
    { id: "done", title: "已完成", titleEn: "DONE", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)", icon: CheckCircle2 },
  ];

  // 提取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => task.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [tasks]);

  // 筛选和排序任务
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
      return matchesSearch && matchesPriority && matchesTags;
    });

    // 排序
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "dueDate":
          comparison = (a.dueDate || Infinity) - (b.dueDate || Infinity);
          break;
        case "progress":
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "updated":
        default:
          comparison = (b.createdAt || 0) - (a.createdAt || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, selectedPriority, selectedTags, sortBy, sortDirection]);

  // 拖拽处理
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (columnId: string) => {
    setDragOverColumn(columnId);
  };

  const handleDrop = (columnId: string) => {
    if (draggedTask && draggedTask.status !== columnId) {
      // 这里可以触发实际的拖拽更新逻辑
      console.log(`Task ${draggedTask._id} moved to ${columnId}`);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // 计算总体进度
  const totalProgress = tasks.length > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length)
    : 0;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPriority("all");
    setSelectedTags([]);
  };

  // 切换任务选择
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t._id)));
    }
  };

  return (
    <div className="space-y-4 page-transition-v11">
      {/* 统计卡片 - v11 优化版 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-v5 p-4 flex items-center gap-4 group cursor-pointer kanban-card-v11"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#71717A]">总体进度</span>
              <span className="text-lg font-semibold text-[#3B82F6]">{totalProgress}%</span>
            </div>
            <div className="h-2 bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-v5 p-4 flex items-center gap-4 group cursor-pointer kanban-card-v11"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{completedTasks}</div>
            <div className="text-xs text-[#71717A]">已完成任务</div>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-8">
              <MiniProgressChart data={[20, 40, 35, 60, 55, 80, 75]} color="#10B981" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-v5 p-4 flex items-center gap-4 group cursor-pointer kanban-card-v11"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock4 className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{inProgressTasks}</div>
            <div className="text-xs text-[#71717A]">进行中任务</div>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-8">
              <MiniProgressChart data={[30, 45, 40, 50, 45, 55, 60]} color="#F59E0B" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-v5 p-4 flex items-center gap-4 group cursor-pointer kanban-card-v11"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EF4444]/20 to-[#EF4444]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6 text-[#EF4444]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{highPriorityTasks}</div>
            <div className="text-xs text-[#71717A]">高优先级待办</div>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-8">
              <MiniProgressChart data={[50, 45, 55, 40, 60, 50, 55]} color="#EF4444" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 工具栏 - v11 优化版 */}
      <div className="filter-container-v11">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 w-full lg:w-auto flex-wrap">
            {/* 搜索 */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-sm text-white placeholder:text-[#52525B] focus:border-[#3B82F6]/50 focus:outline-none w-full transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded"
                >
                  <X className="w-3 h-3 text-[#71717A]" />
                </button>
              )}
            </div>
            
            {/* 筛选器展开按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-btn-v11 flex items-center gap-2 ${
                showFilters || selectedPriority !== "all" || selectedTags.length > 0 ? 'active' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              筛选
              {(selectedPriority !== "all" || selectedTags.length > 0) && (
                <span className="ml-1 px-1.5 py-0.5 bg-[#3B82F6] text-white text-xs rounded-full">
                  {(selectedPriority !== "all" ? 1 : 0) + selectedTags.length}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* 排序 */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-sm text-white focus:border-[#3B82F6]/50 focus:outline-none"
              >
                <option value="updated">最近更新</option>
                <option value="priority">优先级</option>
                <option value="dueDate">截止日期</option>
                <option value="progress">进度</option>
                <option value="title">名称</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
                className="p-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-[#71717A] hover:text-white transition-all"
              >
                {sortDirection === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            {/* 视图切换 */}
            <div className="flex bg-[#1A1A24] rounded-xl p-1">
              <button
                onClick={() => setViewMode("board")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                  viewMode === "board" 
                    ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white" 
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                看板
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                  viewMode === "list" 
                    ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white" 
                    : "text-[#71717A] hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                列表
              </button>
            </div>
          </div>
          
          {/* 新建按钮 */}
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>

        {/* 展开的筛选器 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                {/* 优先级筛选 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#71717A] w-16">优先级:</span>
                  <div className="flex gap-2 filter-group-v11">
                    {[
                      { value: "all", label: "全部", color: "#71717A" },
                      { value: "high", label: "高", color: "#EF4444" },
                      { value: "medium", label: "中", color: "#F59E0B" },
                      { value: "low", label: "低", color: "#3B82F6" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setSelectedPriority(p.value)}
                        className={`filter-btn-v11 ${selectedPriority === p.value ? 'active' : ''}`}
                        style={{
                          backgroundColor: selectedPriority === p.value ? `${p.color}20` : undefined,
                          borderColor: selectedPriority === p.value ? p.color : undefined,
                          color: selectedPriority === p.value ? p.color : undefined,
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 标签筛选 */}
                {allTags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-[#71717A] w-16 pt-1">标签:</span>
                    <div className="flex flex-wrap gap-2 filter-group-v11">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`filter-btn-v11 flex items-center gap-1.5 ${
                            selectedTags.includes(tag) ? 'active' : ''
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 清除筛选 */}
                {(selectedPriority !== "all" || selectedTags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#71717A] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    清除所有筛选
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 统计信息 */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-sm">
          <div className="flex items-center gap-6">
            <span className="text-[#71717A]">
              共 <span className="text-white font-medium">{filteredTasks.length}</span> 个任务
            </span>
            <span className="text-[#71717A]">
              待办: <span className="text-[#71717A] font-medium">{filteredTasks.filter(t => t.status === 'todo').length}</span>
            </span>
            <span className="text-[#71717A]">
              进行中: <span className="text-[#3B82F6] font-medium">{filteredTasks.filter(t => t.status === 'in_progress').length}</span>
            </span>
            <span className="text-[#71717A]">
              已完成: <span className="text-[#10B981] font-medium">{filteredTasks.filter(t => t.status === 'done').length}</span>
            </span>
          </div>

          {/* 批量操作 */}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#71717A]">已选择 {selectedTasks.size} 个</span>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#71717A] hover:text-white transition-all">
                <Play className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#71717A] hover:text-white transition-all">
                <Pause className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#71717A] hover:text-[#EF4444] transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
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
            const isDragOver = dragOverColumn === column.id;
            
            return (
              <div 
                key={column.id} 
                className={`glass-card-v5 min-h-[500px] flex flex-col transition-all duration-300 ${
                  isDragOver ? 'ring-2 ring-[#3B82F6]/50 bg-[#3B82F6]/5 drop-zone-active' : ''
                }`}
                style={{ backgroundColor: 'rgba(17, 17, 24, 0.6)' }}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(column.id);
                }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(column.id);
                }}
              >
                {/* 列标题 */}
                <div 
                  className="p-4 border-b border-white/5"
                  style={{ borderColor: `${column.color}20` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                  <div className="text-xs text-[#52525B] mt-1">
                    {column.titleEn}
                  </div>
                </div>

                {/* 任务列表 */}
                <div className="p-3 space-y-3 flex-1">
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task, index) => (
                      <TaskCard 
                        key={task._id} 
                        task={task} 
                        index={index}
                        isDragging={draggedTask?._id === task._id}
                        isSelected={selectedTasks.has(task._id)}
                        onDragStart={() => handleDragStart(task)}
                        onDragEnd={handleDragEnd}
                        onSelect={() => toggleTaskSelection(task._id)}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {columnTasks.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="empty-state-v11"
                    >
                      <div className="empty-state-v11-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/5">
                        <Plus className="w-6 h-6 opacity-50" />
                      </div>
                      <span className="text-sm font-medium text-[#71717A]">暂无任务</span>
                      <span className="text-xs mt-1 text-[#52525B]">点击添加新任务</span>
                    </motion.div>
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
      ) : (
        /* 列表视图 - 增强版 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="console-card overflow-hidden"
        >
          {/* 列表头部 */}
          <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-white/[0.02]">
            <button
              onClick={toggleSelectAll}
              className="p-1 hover:bg-white/10 rounded transition-all"
            >
              {selectedTasks.size === filteredTasks.length && filteredTasks.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#3B82F6]" />
              ) : (
                <Square className="w-4 h-4 text-[#71717A]" />
              )}
            </button>
            <span className="text-sm text-[#71717A] flex-1">任务名称</span>
            <span className="text-sm text-[#71717A] w-24 hidden md:block">进度</span>
            <span className="text-sm text-[#71717A] w-24 hidden lg:block">标签</span>
            <span className="text-sm text-[#71717A] w-20">优先级</span>
            <span className="text-sm text-[#71717A] w-20 hidden sm:block">负责人</span>
            <span className="text-sm text-[#71717A] w-10">操作</span>
          </div>

          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <TaskListItem 
                  key={task._id} 
                  task={task} 
                  index={index}
                  isSelected={selectedTasks.has(task._id)}
                  onSelect={() => toggleTaskSelection(task._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 迷你进度图表
function MiniProgressChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={data.map((value, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 40 - ((value - min) / range) * 30 - 5;
          return `${x},${y}`;
        }).join(' ')}
      />
    </svg>
  );
}

// 任务进度环形图
function TaskProgressRing({ progress, size = 36 }: { progress: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  let color = "#3B82F6";
  if (progress >= 80) color = "#10B981";
  else if (progress >= 50) color = "#F59E0B";
  else if (progress > 0) color = "#3B82F6";
  else color = "#71717A";

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
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-[10px] font-medium"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}

function TaskCard({ 
  task, 
  index, 
  isDragging,
  isSelected,
  onDragStart,
  onDragEnd,
  onSelect
}: { 
  task: Task; 
  index: number;
  isDragging?: boolean;
  isSelected?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onSelect?: () => void;
}) {
  const priorityColors: Record<string, { bg: string; text: string; border: string; glow: string; shadow: string; gradient: string }> = {
    high: { 
      bg: "rgba(239, 68, 68, 0.1)", 
      text: "#EF4444",
      border: "rgba(239, 68, 68, 0.3)",
      glow: "rgba(239, 68, 68, 0.4)",
      shadow: "0 20px 50px rgba(239, 68, 68, 0.3), 0 0 30px rgba(239, 68, 68, 0.2)",
      gradient: "from-red-500/10 to-transparent"
    },
    medium: { 
      bg: "rgba(245, 158, 11, 0.1)", 
      text: "#F59E0B",
      border: "rgba(245, 158, 11, 0.3)",
      glow: "rgba(245, 158, 11, 0.4)",
      shadow: "0 20px 50px rgba(245, 158, 11, 0.3), 0 0 30px rgba(245, 158, 11, 0.2)",
      gradient: "from-amber-500/10 to-transparent"
    },
    low: { 
      bg: "rgba(59, 130, 246, 0.1)", 
      text: "#3B82F6",
      border: "rgba(59, 130, 246, 0.3)",
      glow: "rgba(59, 130, 246, 0.4)",
      shadow: "0 20px 50px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2)",
      gradient: "from-blue-500/10 to-transparent"
    },
  };

  const priorityConfig = priorityColors[task.priority];
  const progress = task.progress || 0;

  // 模拟额外元数据
  const comments = task.comments || Math.floor(Math.random() * 8);
  const attachments = task.attachments || Math.floor(Math.random() * 4);
  const subtasks = task.subtasks || { total: Math.floor(Math.random() * 6) + 1, completed: Math.floor(Math.random() * 3) };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: isDragging ? 0.92 : 1, 
        y: isDragging ? -10 : 0,
        scale: isDragging ? 1.04 : 1,
        rotate: isDragging ? 2 : 0,
        boxShadow: isDragging 
          ? `${priorityConfig.shadow}, 0 0 50px ${priorityConfig.glow}` 
          : isSelected 
            ? `0 0 0 2px ${priorityConfig.text}, 0 0 25px ${priorityConfig.glow}` 
            : undefined,
        zIndex: isDragging ? 1000 : isSelected ? 10 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 1
      }}
      whileHover={{ 
        scale: isDragging ? 1.04 : 1.03, 
        y: isDragging ? -10 : -8,
        boxShadow: isDragging 
          ? undefined 
          : `${priorityConfig.shadow}, 0 0 35px ${priorityConfig.glow}`,
        borderColor: priorityConfig.border
      }}
      className={`kanban-card-v11 glass-card-v5 p-4 cursor-grab group relative overflow-hidden ${
        isDragging ? 'cursor-grabbing dragging-enhanced' : ''
      } ${isSelected ? 'ring-2' : ''}`}
      style={{ 
        borderLeftWidth: '4px',
        borderLeftColor: priorityConfig.text,
        borderColor: isDragging ? priorityConfig.border : isSelected ? priorityConfig.text : undefined,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        '--accent-glow': priorityConfig.glow
      } as React.CSSProperties}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* 拖拽时的发光背景 */}
      {isDragging && (
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            background: `linear-gradient(135deg, ${priorityConfig.glow} 0%, transparent 60%)`
          }}
        />
      )}

      {/* 悬停时的渐变背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${priorityConfig.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
      
      {/* 右上角装饰 */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 选择框 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        className="absolute top-3 left-3 z-20 p-1 hover:bg-white/10 rounded transition-all"
      >
        {isSelected ? (
          <CheckSquare className="w-4 h-4" style={{ color: priorityConfig.text }} />
        ) : (
          <Square className="w-4 h-4 text-[#52525B]" />
        )}
      </button>

      {/* 拖拽手柄 */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all z-10">
        <motion.div 
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <GripVertical className="w-4 h-4 text-[#52525B]" />
        </motion.div>
      </div>

      {/* 内容 */}
      <div className="relative z-10 pl-8">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-3 pr-8">
          <h4 className="font-semibold text-white group-hover:text-[#3B82F6] transition-colors line-clamp-2">
            {task.title}
          </h4>
        </div>
        
        <p className="text-sm text-[#71717A] mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
        
        {/* 进度条 */}
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#52525B] font-medium">进度</span>
              <motion.span 
                className="text-xs font-semibold"
                style={{ color: priorityConfig.text }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {progress}%
              </motion.span>
            </div>
            <div className="h-2 bg-[#1A1A24] rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full relative"
                style={{ backgroundColor: priorityConfig.text }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              >
                {/* 流动光效 */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
        
        {/* 子任务进度 */}
        {subtasks.total > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#1A1A24] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full"
                style={{ width: `${(subtasks.completed / subtasks.total) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[#52525B]">
              {subtasks.completed}/{subtasks.total}
            </span>
          </div>
        )}
        
        {/* 底部信息栏 */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          {/* 优先级标签 */}
          <motion.span 
            className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
            style={{ 
              backgroundColor: priorityConfig.bg,
              color: priorityConfig.text,
              border: `1px solid ${priorityConfig.border}`
            }}
            whileHover={{ scale: 1.05 }}
          >
            {task.priority}
          </motion.span>
          
          {/* 进度环形图 */}
          <TaskProgressRing progress={progress} size={36} />
        </div>
        
        {/* 元信息 */}
        <div className="flex items-center gap-3 mt-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#71717A]">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
            >
              {task.assignee.charAt(0)}
            </div>
            <span className="truncate max-w-[80px]">{task.assignee}</span>
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
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.tags.map((tag: string) => (
              <motion.span 
                key={tag}
                whileHover={{ scale: 1.05 }}
                className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-[#A1A1AA] flex items-center gap-1 hover:bg-white/10 transition-colors border border-white/5"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </motion.span>
            ))}
          </div>
        )}

        {/* 额外元信息 - 评论、附件 */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-[#52525B] hover:text-[#71717A] transition-colors cursor-pointer">
            <MessageSquare className="w-3 h-3" />
            <span>{comments}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#52525B] hover:text-[#71717A] transition-colors cursor-pointer">
            <Paperclip className="w-3 h-3" />
            <span>{attachments}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#52525B] ml-auto">
            <Clock className="w-3 h-3" />
            <span>{new Date(task.updatedAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskListItem({ 
  task, 
  index, 
  isSelected,
  onSelect
}: { 
  task: Task; 
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
    medium: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
    low: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
  };

  const priorityConfig = priorityColors[task.priority];
  const progress = task.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      className={`p-4 hover:bg-white/[0.02] transition-all group flex items-center gap-4 ${
        isSelected ? 'bg-white/[0.04]' : ''
      }`}
    >
      <button
        onClick={onSelect}
        className="p-1 hover:bg-white/10 rounded transition-all"
      >
        {isSelected ? (
          <CheckSquare className="w-4 h-4 text-[#3B82F6]" />
        ) : (
          <Square className="w-4 h-4 text-[#52525B] group-hover:text-[#71717A]" />
        )}
      </button>
      
      <div className={`w-2 h-2 rounded-full ${priorityConfig.bg.replace('/10', '')}`} />
      
      <div className="flex-1 min-w-0">
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
        {/* 进度条 */}
        <div className="w-24 hidden md:block">
          <div className="h-1.5 bg-[#1A1A24] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-[#52525B] mt-1 text-right">{progress}%</div>
        </div>

        <div className="hidden lg:flex gap-1">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 text-[#71717A]">
              #{tag}
            </span>
          ))}
        </div>
        
        <span className={`text-xs px-2 py-1 rounded font-medium border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>
          {task.priority}
        </span>
        
        <span className="text-xs text-[#71717A] w-20 hidden sm:block">
          {task.assignee}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#71717A] hover:text-white transition-all">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded-lg text-[#71717A] hover:text-[#EF4444] transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
