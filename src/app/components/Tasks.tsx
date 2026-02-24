'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tasks as initialTasks } from '@/data/mockData';
import { Task } from '@/types';
import { 
  GripVertical, 
  Clock, 
  MoreHorizontal,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Plus
} from 'lucide-react';

const priorityColor: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  high: { 
    bg: 'bg-[#EF4444]/10', 
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/30',
    glow: 'shadow-[#EF4444]/20'
  },
  medium: { 
    bg: 'bg-[#F59E0B]/10', 
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/30',
    glow: 'shadow-[#F59E0B]/20'
  },
  low: { 
    bg: 'bg-[#3B82F6]/10', 
    text: 'text-[#3B82F6]',
    border: 'border-[#3B82F6]/30',
    glow: 'shadow-[#3B82F6]/20'
  },
};

const deptColor: Record<string, { bg: string; text: string }> = {
  Research: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  Analytics: { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
  Operations: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  Engineering: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  Content: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  Product: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  Sales: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  Design: { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
};

function TaskCard({ 
  task, 
  onClick,
  isDragging = false,
  dragHandleProps
}: { 
  task: Task; 
  onClick: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}) {
  const priority = priorityColor[task.priority || 'medium'];
  const dept = deptColor[task.department] || { bg: 'bg-[#71717A]/10', text: 'text-[#71717A]' };
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: isDragging ? 0.9 : 1, 
        y: isDragging ? -10 : 0,
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 3 : 0,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${priority.glow.replace('shadow-', '').replace('/20', '/30')}`
      }}
      onClick={onClick}
      className={`console-card p-4 cursor-grab group relative overflow-hidden kanban-card ${
        isDragging ? 'cursor-grabbing z-50' : ''
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#3B82F6'
      }}
      draggable
      {...dragHandleProps}
    >
      {/* 拖拽时的发光背景 */}
      {isDragging && (
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            background: `linear-gradient(135deg, ${task.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'} 0%, transparent 60%)`
          }}
        />
      )}
      
      {/* 悬停时的渐变背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        task.priority === 'high' ? 'from-red-500/5' : 
        task.priority === 'medium' ? 'from-amber-500/5' : 
        'from-blue-500/5'
      } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* 右上角装饰 */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* 拖拽手柄 */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all z-10">
        <div className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <GripVertical className="w-4 h-4 text-[#52525B]" />
        </div>
      </div>
      
      <div className="relative z-10">
        {/* 标题 */}
        <h4 className="font-semibold text-white group-hover:text-[#3B82F6] transition-colors line-clamp-2 pr-8">
          {task.title}
        </h4>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`text-[10px] px-2 py-1 rounded-md ${dept.bg} ${dept.text} border border-white/5`}>
            {task.department}
          </span>
          <span className={`text-[10px] px-2 py-1 rounded-md ${priority.bg} ${priority.text} border ${priority.border}`}>
            {task.priority}
          </span>
        </div>
        
        {/* 底部信息 */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-[#71717A]" />
            <span className="text-xs text-[#71717A]">
              {task.scheduledTime.split(' ')[1]}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
            >
              {task.executor.charAt(0)}
            </div>
            <span className="text-xs text-[#A1A1AA]">{task.executor}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Tasks() {
  const [allTasks] = useState<Task[]>(initialTasks);
  const [selected, setSelected] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns = [
    { key: 'todo', label: 'To Do', color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: AlertCircle },
    { key: 'in_progress', label: 'In Progress', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', icon: Clock4 },
    { key: 'completed', label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle2 },
  ];

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
      {/* 看板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = allTasks.filter(t => t.status === col.key);
          const Icon = col.icon;
          const isDragOver = dragOverColumn === col.key;
          
          return (
            <motion.div 
              key={col.key} 
              className={`console-card min-h-[600px] flex flex-col transition-all duration-300 ${
                isDragOver ? 'ring-2 ring-[#3B82F6]/50 bg-[#3B82F6]/5' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: col.bg }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: col.color }} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-white">{col.label}</h3>
                      <p className="text-xs text-[#71717A]">{colTasks.length} tasks</p>
                    </div>
                  </div>
                  
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: col.bg, color: col.color }}
                  >
                    {colTasks.length}
                  </span>
                </div>
              </div>
              
              {/* 任务列表 */}
              <div className="p-4 space-y-3 flex-1">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onClick={() => setSelected(task)}
                      isDragging={draggedTask?.id === task.id}
                      dragHandleProps={{
                        onDragStart: () => handleDragStart(task),
                        onDragEnd: handleDragEnd,
                      }}
                    />
                  ))}
                </AnimatePresence>
                
                {colTasks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-[#52525B]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center mb-4 border border-white/5">
                      <Plus className="w-6 h-6 opacity-50" />
                    </div>
                    <span className="text-sm font-medium">No tasks</span>
                    <span className="text-xs mt-1 opacity-60">Drag tasks here</span>
                  </motion.div>
                )}
              </div>
              
              {/* 添加按钮 */}
              <div className="p-4 border-t border-white/5">
                <motion.button 
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm text-[#71717A] hover:text-white hover:bg-white/5 rounded-xl transition-all border border-dashed border-white/10 hover:border-white/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="console-card w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selected.title}</h2>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-md ${deptColor[selected.department]?.bg || 'bg-[#71717A]/10'} ${deptColor[selected.department]?.text || 'text-[#71717A]'}`}>
                        {selected.department}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md ${priorityColor[selected.priority || 'medium'].bg} ${priorityColor[selected.priority || 'medium'].text} border ${priorityColor[selected.priority || 'medium'].border}`}>
                        {selected.priority}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelected(null)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span className="text-[#71717A]">✕</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#71717A]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#71717A]">Scheduled Time</div>
                    <div className="text-white font-medium">{selected.scheduledTime}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
                    <Tag className="w-5 h-5 text-[#71717A]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#71717A]">Status</div>
                    <div className="text-white font-medium capitalize">{selected.status.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
                    >
                      {selected.executor.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#71717A]">Executor</div>
                    <div className="text-white font-medium">{selected.executor}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-white/5 flex gap-3">
                <motion.button 
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white rounded-xl transition-all font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Task
                </motion.button>
                <motion.button 
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
