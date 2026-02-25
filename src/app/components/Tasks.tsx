'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { tasks as initialTasks } from '@/data/mockData';
import { Task } from '@/types';
import {
  GripVertical,
  Clock,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Plus,
  X,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  ArrowRight,
  Sparkles,
  Zap,
  AlertTriangle,
  User,
  CalendarDays,
  Bot,
  LayoutGrid,
  List,
  ArrowUpDown,
  Eye,
  MessageSquare,
  Paperclip,
  ChevronDown,
  CheckSquare,
  Play,
  Pause
} from 'lucide-react';

// ========== 配置 ==========
const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
  high: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    label: '高优先级',
    icon: AlertTriangle
  },
  medium: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    label: '中优先级',
    icon: Zap
  },
  low: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
    label: '低优先级',
    icon: Clock4
  },
};

const DEPT_CONFIG: Record<string, { color: string; bg: string; gradient: string }> = {
  Intel: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', gradient: 'from-[#3b82f6] to-[#8b5cf6]' },
  Analytics: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', gradient: 'from-[#8b5cf6] to-[#c084fc]' },
  Operations: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', gradient: 'from-[#f59e0b] to-[#f97316]' },
  Engineering: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', gradient: 'from-[#10b981] to-[#059669]' },
  Content: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', gradient: 'from-[#10b981] to-[#34d399]' },
  Product: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', gradient: 'from-[#3b82f6] to-[#60a5fa]' },
  Sales: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', gradient: 'from-[#f59e0b] to-[#fbbf24]' },
  Design: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', gradient: 'from-[#8b5cf6] to-[#c084fc]' },
  Market: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', gradient: 'from-[#10b981] to-[#34d399]' },
  Policy: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', gradient: 'from-[#8b5cf6] to-[#c084fc]' },
};

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: AlertCircle, description: '待处理任务' },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Clock4, description: '进行中任务' },
  { key: 'completed', label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2, description: '已完成任务' },
];

// ========== 子组件 ==========

function TaskCard({
  task,
  onClick,
  isDragging = false,
  isDragOver = false,
}: {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}) {
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
  const dept = DEPT_CONFIG[task.department] || { bg: 'rgba(113, 113, 122, 0.1)', color: '#71717A', gradient: 'from-[#71717A] to-[#A1A1AA]' };
  const PriorityIcon = priority.icon;

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{
        opacity: isDragging ? 0.9 : 1,
        y: isDragging ? -8 : 0,
        scale: isDragging ? 1.05 : isDragOver ? 1.02 : 1,
        rotate: isDragging ? 3 : 0,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`kanban-card ${isDragging ? 'dragging shadow-2xl' : ''} ${isDragOver ? 'ring-2 ring-[#3b82f6]/50' : ''} group`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: priority.color,
        background: `linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))`,
        boxShadow: isDragging ? `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${priority.color}30` : undefined
      }}
      draggable
    >
      {/* 顶部渐变条 */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(to right, ${priority.color}, ${dept.color})` }}
      />

      {/* 拖拽时的发光效果 */}
      {isDragging && (
        <div 
          className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at center, ${priority.color}, transparent)`,
          }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-sm text-white line-clamp-2 pr-8 leading-relaxed">
          {task.title}
        </h4>
        <motion.div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
        >
          <GripVertical className="w-4 h-4 text-[#52525B]" />
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <motion.span
          className="text-[10px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 cursor-pointer"
          style={{
            background: dept.bg,
            color: dept.color,
            borderColor: `${dept.color}30`
          }}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: dept.color }}
          />
          {task.department}
        </motion.span>
        <motion.span
          className="text-[10px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 cursor-pointer"
          style={{
            background: priority.bg,
            color: priority.color,
            borderColor: priority.border
          }}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          <PriorityIcon className="w-3 h-3" />
          {priority.label}
        </motion.span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#71717A]">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {task.scheduledTime.split(' ')[1]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: `linear-gradient(135deg, ${dept.color}30, ${dept.color}10)`,
              color: dept.color,
              border: `1px solid ${dept.color}40`
            }}
            whileHover={{ scale: 1.15, rotate: 10 }}
          >
            {task.executor.charAt(0)}
          </motion.div>
          <span className="text-[11px] text-[#A1A1AA]">{task.executor}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
  const dept = DEPT_CONFIG[task.department] || { bg: 'rgba(113, 113, 122, 0.1)', color: '#71717A', gradient: 'from-[#71717A] to-[#A1A1AA]' };
  const PriorityIcon = priority.icon;
  const [activeTab, setActiveTab] = useState('details');

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
        className="modal-content max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${priority.bg}, ${dept.bg})`,
                  border: `1px solid ${priority.border}`
                }}
              >
                <PriorityIcon className="w-7 h-7" style={{ color: priority.color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{task.title}</h2>
                <div className="flex gap-2">
                  <span
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5"
                    style={{
                      background: dept.bg,
                      color: dept.color,
                      borderColor: `${dept.color}30`
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: dept.color }} />
                    {task.department}
                  </span>
                  <span
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5"
                    style={{
                      background: priority.bg,
                      color: priority.color,
                      borderColor: priority.border
                    }}
                  >
                    <PriorityIcon className="w-3.5 h-3.5" />
                    {priority.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit3 className="w-5 h-5 text-[#71717A]" />
              </motion.button>
              <motion.button
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-5 h-5 text-[#71717A] hover:text-[#EF4444]" />
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-[#71717A]" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/5">
          <div className="flex gap-1 px-6">
            {['details', 'comments', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-[#3b82f6] text-[#3b82f6]' 
                    : 'border-transparent text-[#71717A] hover:text-white'
                }`}
              >
                {tab === 'details' ? '详情' : tab === 'comments' ? '评论 (3)' : '历史'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div>
                <div className="text-xs text-[#71717A] mb-1">计划时间</div>
                <div className="text-white font-medium">{task.scheduledTime}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                <Tag className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <div>
                <div className="text-xs text-[#71717A] mb-1">状态</div>
                <div className="text-white font-medium capitalize">
                  {task.status === 'in_progress' ? '进行中' : task.status === 'completed' ? '已完成' : '待处理'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${dept.color}20, ${dept.color}10)` }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
                style={{
                  background: `${dept.color}20`,
                  color: dept.color,
                  borderColor: `${dept.color}40`
                }}
              >
                {task.executor.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#71717A] mb-1">执行者</div>
              <div className="text-white font-medium">{task.executor}</div>
            </div>
          </div>

          {/* 任务描述 */}
          <div className="p-4 rounded-xl bg-[#1A1A24] border border-white/5">
            <div className="text-xs text-[#71717A] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              任务描述
            </div>
            <p className="text-white/80 leading-relaxed">
              此任务由系统自动创建，属于{task.department}部门的常规工作流程。
              优先级为{priority.label}，计划执行时间为{task.scheduledTime}。
            </p>
          </div>

          {/* 子任务 */}
          <div className="p-4 rounded-xl bg-[#1A1A24] border border-white/5">
            <div className="text-xs text-[#71717A] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                子任务 (2/4)
              </span>
              <span className="text-[#10b981]">50%</span>
            </div>
            <div className="space-y-2">
              {['数据收集', '初步分析', '报告撰写', '质量检查'].map((subtask, i) => (
                <div key={subtask} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    i < 2 ? 'bg-[#10b981] border-[#10b981]' : 'border-[#52525B]'
                  }`}>
                    {i < 2 && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${i < 2 ? 'text-[#71717A] line-through' : 'text-white'}`}>
                    {subtask}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/5 flex gap-3">
          <motion.button
            className="btn btn-primary flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit3 className="w-4 h-4" />
            编辑任务
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            关闭
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TaskStats() {
  const stats = [
    { label: '总任务', value: 24, color: '#3b82f6', icon: Calendar },
    { label: '进行中', value: 8, color: '#F59E0B', icon: Clock4 },
    { label: '已完成', value: 12, color: '#22C55E', icon: CheckCircle2 },
    { label: '高优先级', value: 4, color: '#EF4444', icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className="card p-4 flex items-center gap-3 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${stat.color}15` }}
          >
            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-[#71717A]">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FilterBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-v4 p-4 mb-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                       text-white placeholder:text-[#52525B] focus:border-[#3b82f6]/50
                       focus:outline-none transition-all text-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                       text-white focus:border-[#3b82f6]/50 focus:outline-none text-sm"
          >
            <option value="all">全部部门</option>
            <option value="Intel">情报部</option>
            <option value="Policy">政策部</option>
            <option value="Market">市场部</option>
            <option value="Engineering">工程部</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                       text-white focus:border-[#3b82f6]/50 focus:outline-none text-sm"
          >
            <option value="all">全部优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>

          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            新建任务
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ========== 主组件 ==========
export default function Tasks() {
  const [allTasks] = useState<Task[]>(initialTasks);
  const [selected, setSelected] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // 过滤任务
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedDept !== 'all' && task.department !== selectedDept) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      return true;
    });
  }, [allTasks, searchQuery, selectedDept, selectedPriority]);

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
      console.log(`Task ${draggedTask.id} moved to ${columnId}`);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-6">
      <TaskStats />
      
      {/* 增强的筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-v4 p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                         text-white placeholder:text-[#52525B] focus:border-[#3b82f6]/50
                         focus:outline-none transition-all text-sm"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                         text-white focus:border-[#3b82f6]/50 focus:outline-none text-sm"
            >
              <option value="all">全部部门</option>
              <option value="Intel">情报部</option>
              <option value="Policy">政策部</option>
              <option value="Market">市场部</option>
              <option value="Engineering">工程部</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                         text-white focus:border-[#3b82f6]/50 focus:outline-none text-sm"
            >
              <option value="all">全部优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>

            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              新建任务
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col, colIndex) => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          const Icon = col.icon;
          const isDragOver = dragOverColumn === col.key;

          return (
            <motion.div
              key={col.key}
              className={`card min-h-[600px] flex flex-col transition-all duration-300 ${
                isDragOver ? 'ring-2 ring-[#3b82f6]/50 bg-[#3b82f6]/5 scale-[1.01]' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.1 }}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(col.key);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.key);
              }}
            >
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: col.bg }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: col.color }} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-white">{col.label}</h3>
                      <p className="text-xs text-[#71717A]">{col.description}</p>
                    </div>
                  </div>

                  <motion.span
                    className="text-sm px-3 py-1.5 rounded-full font-bold"
                    style={{ backgroundColor: col.bg, color: col.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {colTasks.length}
                  </motion.span>
                </div>
              </div>

              <div className="p-3 space-y-3 flex-1">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelected(task)}
                        isDragging={draggedTask?.id === task.id}
                        isDragOver={isDragOver && draggedTask?.id !== task.id}
                      />
                    </div>
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <motion.div
                    className={`empty-state py-16 transition-all duration-300 ${
                      isDragOver ? 'bg-[#3b82f6]/10 rounded-lg border-2 border-dashed border-[#3b82f6]/30' : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-[#52525B]" />
                    </div>
                    <span className="text-sm font-medium text-[#71717A]">{isDragOver ? '释放以添加任务' : '暂无任务'}</span>
                    <span className="text-xs text-[#52525B] mt-1">{isDragOver ? '' : '拖拽任务到此处'}</span>
                  </motion.div>
                )}
              </div>

              <div className="p-4 border-t border-white/5">
                <motion.button
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm text-[#71717A]
                           hover:text-white hover:bg-white/5 rounded-xl transition-all
                           border border-dashed border-white/10 hover:border-white/20"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Plus className="w-4 h-4" />
                  添加任务
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <TaskModal
            task={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
