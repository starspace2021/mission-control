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
  Pause,
  Target,
  Flag,
  Layers,
  TrendingUp,
  BarChart3,
  PieChart,
  RotateCcw
} from 'lucide-react';

// ========== 配置 ==========
const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType; gradient: string }> = {
  high: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    label: '高优先级',
    icon: AlertTriangle,
    gradient: 'from-[#ef4444] to-[#f97316]'
  },
  medium: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    label: '中优先级',
    icon: Zap,
    gradient: 'from-[#f59e0b] to-[#fbbf24]'
  },
  low: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
    label: '低优先级',
    icon: Clock4,
    gradient: 'from-[#3b82f6] to-[#60a5fa]'
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
  { key: 'todo', label: 'To Do', color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: AlertCircle, description: '待处理任务', gradient: 'from-[#64748b] to-[#94a3b8]' },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Clock4, description: '进行中任务', gradient: 'from-[#3b82f6] to-[#60a5fa]' },
  { key: 'completed', label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2, description: '已完成任务', gradient: 'from-[#10b981] to-[#34d399]' },
];

// 任务趋势数据
const TASK_TREND_DATA = [
  { day: '周一', completed: 8, total: 12 },
  { day: '周二', completed: 12, total: 15 },
  { day: '周三', completed: 10, total: 14 },
  { day: '周四', completed: 15, total: 18 },
  { day: '周五', completed: 18, total: 20 },
  { day: '周六', completed: 5, total: 8 },
  { day: '周日', completed: 7, total: 10 },
];

// ========== 子组件 ==========

// 任务完成率环形图
function TaskCompletionRing({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 36;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        {/* 背景圆环 */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          fill="none"
        />
        {/* 进度圆环 */}
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke="url(#completionGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{percentage}%</span>
        <span className="text-[10px] text-[#71717A]">完成率</span>
      </div>
    </div>
  );
}

// 任务统计趋势图
function TaskStatsChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="h-16 flex items-end gap-1">
      {TASK_TREND_DATA.map((data, i) => {
        const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
        return (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full bg-gradient-to-t from-[#3b82f6] to-[#10b981] rounded-t cursor-pointer relative"
              style={{ height: `${completionRate}%`, minHeight: '4px' }}
              initial={{ height: 0 }}
              animate={{ height: `${completionRate}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {hoveredIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a24] border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap z-10"
                  >
                    {data.completed}/{data.total}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <span className="text-[9px] text-[#71717A]">{data.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// 增强的任务卡片 - v3.0 优化版
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
        opacity: isDragging ? 0.95 : 1,
        y: isDragging ? -8 : 0,
        scale: isDragging ? 1.05 : isDragOver ? 1.02 : 1,
        rotate: isDragging ? 3 : 0,
        boxShadow: isDragging 
          ? `0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px ${priority.color}40`
          : isDragOver
          ? `0 0 0 2px ${priority.color}50, 0 10px 30px rgba(0, 0, 0, 0.3)`
          : '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`kanban-card ${isDragging ? 'dragging' : ''} ${isDragOver ? 'ring-2 ring-[#3b82f6]/50' : ''} group relative overflow-hidden`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: priority.color,
        background: isDragging 
          ? `linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(10, 10, 15, 0.99))`
          : `linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      draggable
    >
      {/* 顶部渐变条 - 动态 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(to right, ${priority.color}, ${dept.color})` }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: isDragging ? 1 : undefined, opacity: isDragging ? 1 : undefined }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* 拖拽时的发光效果 */}
      {isDragging && (
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at center, ${priority.color}30, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* 悬停时的背景光效 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${priority.color}05, transparent)`,
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex items-start justify-between mb-3 pl-2 relative z-10">
        <h4 className="font-medium text-sm text-white line-clamp-2 pr-8 leading-relaxed group-hover:text-white/90 transition-colors">
          {task.title}
        </h4>
        <motion.div
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <GripVertical className="w-4 h-4 text-[#52525B]" />
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 pl-2 relative z-10">
        <motion.span
          className="text-[10px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer"
          style={{
            background: dept.bg,
            color: dept.color,
            borderColor: `${dept.color}30`
          }}
          whileHover={{ scale: 1.05, y: -1, boxShadow: `0 4px 12px ${dept.color}30` }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: dept.color }}
          />
          {task.department}
        </motion.span>
        <motion.span
          className="text-[10px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer"
          style={{
            background: priority.bg,
            color: priority.color,
            borderColor: priority.border
          }}
          whileHover={{ scale: 1.05, y: -1, boxShadow: `0 4px 12px ${priority.color}30` }}
          whileTap={{ scale: 0.95 }}
        >
          <PriorityIcon className="w-3 h-3" />
          {priority.label}
        </motion.span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-2 relative z-10">
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
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'details', label: '详情', icon: Target },
    { id: 'comments', label: '评论', icon: MessageSquare, count: 3 },
    { id: 'history', label: '历史', icon: Clock },
    { id: 'subtasks', label: '子任务', icon: CheckSquare, count: 4 },
  ];

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
        {/* 头部 - 更清晰的层级 */}
        <div className="p-6 border-b border-white/5 relative overflow-hidden">
          {/* 背景装饰 */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-10"
            style={{ 
              background: `radial-gradient(circle at top right, ${priority.color}, transparent 70%)`,
            }}
          />
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${priority.bg}, ${dept.bg})`,
                  border: `1px solid ${priority.border}`
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{ background: `linear-gradient(135deg, ${priority.color}, transparent)` }}
                />
                <PriorityIcon className="w-7 h-7 relative z-10" style={{ color: priority.color }} />
              </motion.div>
              <div>
                <motion.h2 
                  className="text-xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {task.title}
                </motion.h2>
                <div className="flex gap-2 flex-wrap">
                  <motion.span
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5"
                    style={{
                      background: dept.bg,
                      color: dept.color,
                      borderColor: `${dept.color}30`
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: dept.color }} />
                    {task.department}
                  </motion.span>
                  <motion.span
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5"
                    style={{
                      background: priority.bg,
                      color: priority.color,
                      borderColor: priority.border
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <PriorityIcon className="w-3.5 h-3.5" />
                    {priority.label}
                  </motion.span>
                  <motion.span
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 bg-white/5 text-[#A1A1AA] border-white/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {task.status === 'in_progress' ? '进行中' : task.status === 'completed' ? '已完成' : '待处理'}
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
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

        {/* Tabs - 更现代的样式 */}
        <div className="border-b border-white/5 px-6">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${
                    isActive 
                      ? 'text-[#3b82f6]' 
                      : 'text-[#71717A] hover:text-white'
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-white/10 text-[#71717A]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5 hover:border-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#3b82f6]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#71717A] mb-1">计划时间</div>
                      <div className="text-white font-medium">{task.scheduledTime}</div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5 hover:border-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#71717A] mb-1">任务ID</div>
                      <div className="text-white font-medium font-mono text-sm">#{task.id.slice(-6)}</div>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A24] border border-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
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
                  <motion.button
                    className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-[#A1A1AA] hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    重新分配
                  </motion.button>
                </motion.div>

                {/* 任务描述 */}
                <motion.div 
                  className="p-4 rounded-xl bg-[#1A1A24] border border-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="text-xs text-[#71717A] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    任务描述
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    此任务由系统自动创建，属于{task.department}部门的常规工作流程。
                    优先级为{priority.label}，计划执行时间为{task.scheduledTime}。
                  </p>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'subtasks' && (
              <motion.div
                key="subtasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-[#1A1A24] border border-white/5"
              >
                <div className="text-xs text-[#71717A] mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    子任务 (2/4)
                  </span>
                  <span className="text-[#10b981] font-medium">50%</span>
                </div>
                <div className="space-y-2">
                  {['数据收集', '初步分析', '报告撰写', '质量检查'].map((subtask, i) => (
                    <motion.div 
                      key={subtask} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <motion.div 
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${
                          i < 2 ? 'bg-[#10b981] border-[#10b981]' : 'border-[#52525B] hover:border-[#3b82f6]'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {i < 2 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </motion.div>
                      <span className={`text-sm ${i < 2 ? 'text-[#71717A] line-through' : 'text-white'}`}>
                        {subtask}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

// 增强的统计面板
function TaskStats({ stats }: { stats: { total: number; todo: number; inProgress: number; completed: number; highPriority: number } }) {
  const statItems = [
    { label: '总任务', value: stats.total, color: '#3b82f6', icon: Calendar, bg: 'from-[#3b82f6]/20 to-[#3b82f6]/5' },
    { label: '待处理', value: stats.todo, color: '#64748b', icon: AlertCircle, bg: 'from-[#64748b]/20 to-[#64748b]/5' },
    { label: '进行中', value: stats.inProgress, color: '#F59E0B', icon: Clock4, bg: 'from-[#F59E0B]/20 to-[#F59E0B]/5' },
    { label: '已完成', value: stats.completed, color: '#22C55E', icon: CheckCircle2, bg: 'from-[#22C55E]/20 to-[#22C55E]/5' },
    { label: '高优先级', value: stats.highPriority, color: '#EF4444', icon: AlertTriangle, bg: 'from-[#EF4444]/20 to-[#EF4444]/5' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
          className="stat-card-v2 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.bg}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </motion.div>
            <div>
              <motion.div 
                className="text-xl font-bold"
                style={{ 
                  color: stat.color,
                  textShadow: `0 0 20px ${stat.color}30`
                }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: i * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-[#71717A]">{stat.label}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 增强的筛选栏
function FilterBar({ 
  searchQuery, 
  setSearchQuery, 
  selectedDept, 
  setSelectedDept, 
  selectedPriority, 
  setSelectedPriority,
  viewMode,
  setViewMode,
  hasActiveFilters,
  onClearFilters,
  sortBy,
  setSortBy
}: { 
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDept: string;
  setSelectedDept: (d: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  viewMode: 'board' | 'list';
  setViewMode: (m: 'board' | 'list') => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}) {
  const departments = ['all', 'Intel', 'Policy', 'Market', 'Engineering'];
  const priorities = ['all', 'high', 'medium', 'low'];
  const sortOptions = [
    { value: 'newest', label: '最新' },
    { value: 'priority', label: '优先级' },
    { value: 'dueDate', label: '截止日期' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-v4 p-4"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] group-focus-within:text-[#3b82f6] transition-colors" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl
                       text-white placeholder:text-[#52525B] focus:border-[#3b82f6]/50
                       focus:outline-none transition-all text-sm focus:ring-2 focus:ring-[#3b82f6]/20"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3 text-[#71717A]" />
            </motion.button>
          )}
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          {/* 视图切换 */}
          <div className="flex gap-1 bg-[#0a0a0f] rounded-xl p-1 border border-white/10">
            <motion.button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'board'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#71717A] hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              看板
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#71717A] hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-3.5 h-3.5" />
              列表
            </motion.button>
          </div>

          {/* 排序 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 pr-8 text-xs text-white focus:border-[#3b82f6]/50 focus:outline-none cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#71717A] pointer-events-none" />
          </div>

          {/* 部门筛选 */}
          <div className="flex gap-1 bg-[#0a0a0f] rounded-xl p-1 border border-white/10 flex-wrap">
            {departments.map((dept) => (
              <motion.button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDept === dept
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-[#71717A] hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {dept === 'all' ? '全部' : dept}
              </motion.button>
            ))}
          </div>

          {/* 优先级筛选 */}
          <div className="flex gap-1 bg-[#0a0a0f] rounded-xl p-1 border border-white/10 flex-wrap">
            {priorities.map((p) => {
              const config = p === 'all' ? null : PRIORITY_CONFIG[p];
              return (
                <motion.button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedPriority === p
                      ? config 
                        ? '' 
                        : 'bg-[#3b82f6] text-white'
                      : 'text-[#71717A] hover:text-white hover:bg-white/5'
                  }`}
                  style={selectedPriority === p && config ? {
                    background: config.bg,
                    color: config.color,
                    border: `1px solid ${config.border}`
                  } : {}}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {config && <config.icon className="w-3 h-3" />}
                  {p === 'all' ? '全部' : config?.label}
                </motion.button>
              );
            })}
          </div>

          {/* 清除筛选 */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onClearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#71717A] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-3 h-3" />
                清除
              </motion.button>
            )}
          </AnimatePresence>

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
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [sortBy, setSortBy] = useState('newest');

  // 过滤任务
  const filteredTasks = useMemo(() => {
    let tasks = allTasks.filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedDept !== 'all' && task.department !== selectedDept) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      return true;
    });

    // 排序
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        tasks = [...tasks].sort((a, b) => priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low']);
        break;
      case 'dueDate':
        tasks = [...tasks].sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
        break;
      default:
        break;
    }

    return tasks;
  }, [allTasks, searchQuery, selectedDept, selectedPriority, sortBy]);

  // 统计
  const stats = useMemo(() => ({
    total: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'todo').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    highPriority: filteredTasks.filter(t => t.priority === 'high').length,
  }), [filteredTasks]);

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedPriority('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedDept !== 'all' || selectedPriority !== 'all' || sortBy !== 'newest';

  return (
    <div className="space-y-6">
      {/* 增强统计面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧统计卡片 */}
        <div className="lg:col-span-2">
          <TaskStats stats={stats} />
        </div>
        
        {/* 右侧完成率环形图和趋势 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-4 flex items-center gap-4"
        >
          <TaskCompletionRing completed={stats.completed} total={stats.total} />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-white mb-2">任务完成率</h4>
            <TaskStatsChart />
          </div>
        </motion.div>
      </div>
      
      <FilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        viewMode={viewMode}
        setViewMode={setViewMode}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col, colIndex) => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          const Icon = col.icon;
          const isDragOver = dragOverColumn === col.key;

          return (
            <motion.div
              key={col.key}
              className={`card min-h-[400px] flex flex-col transition-all duration-300 ${
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
              {/* 列标题 */}
              <div className="kanban-header mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: col.bg }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Icon className="w-6 h-6" style={{ color: col.color }} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-white text-base">{col.label}</h3>
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

              {/* 任务列表 */}
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
                    className={`empty-state-enhanced py-12 transition-all duration-300 ${
                      isDragOver ? 'bg-[#3b82f6]/10 rounded-lg border-2 border-dashed border-[#3b82f6]/30' : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="icon-wrapper"
                      animate={isDragOver ? { scale: [1, 1.1, 1], y: [0, -5, 0] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Plus className="w-8 h-8 text-[#71717A]" />
                    </motion.div>
                    <span className="text-sm font-medium text-[#71717A]">{isDragOver ? '释放以添加任务' : '暂无任务'}</span>
                    <span className="text-xs text-[#52525B] mt-1">{isDragOver ? '' : '拖拽任务到此处'}</span>
                  </motion.div>
                )}
              </div>

              {/* 添加按钮 */}
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
