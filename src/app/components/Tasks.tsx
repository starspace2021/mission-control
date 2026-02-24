'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X
} from 'lucide-react';

// ========== 配置 ==========
const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  high: { 
    color: '#EF4444', 
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)'
  },
  medium: { 
    color: '#F59E0B', 
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)'
  },
  low: { 
    color: '#4A7BFF', 
    bg: 'rgba(74, 123, 255, 0.1)',
    border: 'rgba(74, 123, 255, 0.3)'
  },
};

const DEPT_CONFIG: Record<string, { color: string; bg: string }> = {
  Research: { color: '#4A7BFF', bg: 'rgba(74, 123, 255, 0.1)' },
  Analytics: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  Operations: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  Engineering: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  Content: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  Product: { color: '#4A7BFF', bg: 'rgba(74, 123, 255, 0.1)' },
  Sales: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  Design: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  Intel: { color: '#4A7BFF', bg: 'rgba(74, 123, 255, 0.1)' },
  Market: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  Policy: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
};

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: AlertCircle },
  { key: 'in_progress', label: 'In Progress', color: '#4A7BFF', bg: 'rgba(74, 123, 255, 0.08)', icon: Clock4 },
  { key: 'completed', label: 'Completed', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)', icon: CheckCircle2 },
];

// ========== 子组件 ==========

function TaskCard({ 
  task, 
  onClick,
  isDragging = false,
}: { 
  task: Task; 
  onClick: () => void;
  isDragging?: boolean;
}) {
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
  const dept = DEPT_CONFIG[task.department] || { bg: 'rgba(113, 113, 122, 0.1)', color: '#71717A' };
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isDragging ? 0.9 : 1, 
        y: isDragging ? -4 : 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`kanban-card ${isDragging ? 'dragging' : ''}`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: priority.color
      }}
      draggable
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-white line-clamp-2 pr-6">
          {task.title}
        </h4>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-[#52525B]" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span 
          className="text-[10px] px-2 py-0.5 rounded-md border"
          style={{ 
            background: dept.bg, 
            color: dept.color,
            borderColor: `${dept.color}30`
          }}
        >
          {task.department}
        </span>
        <span 
          className="text-[10px] px-2 py-0.5 rounded-md border"
          style={{ 
            background: priority.bg, 
            color: priority.color,
            borderColor: priority.border
          }}
        >
          {task.priority}
        </span>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#71717A]" />
          <span className="text-[11px] text-[#71717A]">
            {task.scheduledTime.split(' ')[1]}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
            style={{ background: 'rgba(74, 123, 255, 0.2)', color: '#4A7BFF' }}
          >
            {task.executor.charAt(0)}
          </div>
          <span className="text-[11px] text-[#A1A1AA]">{task.executor}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const priority = PRIORITY_CONFIG[task.priority || 'medium'];
  const dept = DEPT_CONFIG[task.department] || { bg: 'rgba(113, 113, 122, 0.1)', color: '#71717A' };

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
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex gap-2">
                <span 
                  className="text-xs px-2 py-1 rounded-md border"
                  style={{ 
                    background: dept.bg, 
                    color: dept.color,
                    borderColor: `${dept.color}30`
                  }}
                >
                  {task.department}
                </span>
                <span 
                  className="text-xs px-2 py-1 rounded-md border"
                  style={{ 
                    background: priority.bg, 
                    color: priority.color,
                    borderColor: priority.border
                  }}
                >
                  {task.priority}
                </span>
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
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#71717A]" />
            </div>
            <div>
              <div className="text-xs text-[#71717A]">Scheduled Time</div>
              <div className="text-white font-medium">{task.scheduledTime}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#71717A]" />
            </div>
            <div>
              <div className="text-xs text-[#71717A]">Status</div>
              <div className="text-white font-medium capitalize">
                {task.status.replace('_', ' ')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] flex items-center justify-center">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(74, 123, 255, 0.2)', color: '#4A7BFF' }}
              >
                {task.executor.charAt(0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#71717A]">Executor</div>
              <div className="text-white font-medium">{task.executor}</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 flex gap-3">
          <button className="btn btn-primary flex-1">Edit Task</button>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== 主组件 ==========
export default function Tasks() {
  const [allTasks] = useState<Task[]>(initialTasks);
  const [selected, setSelected] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => {
          const colTasks = allTasks.filter(t => t.status === col.key);
          const Icon = col.icon;
          const isDragOver = dragOverColumn === col.key;
          
          return (
            <motion.div 
              key={col.key} 
              className={`card min-h-[600px] flex flex-col transition-all duration-200 ${
                isDragOver ? 'ring-2 ring-[#4A7BFF]/50 bg-[#4A7BFF]/5' : ''
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
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: col.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: col.color }} />
                    </div>
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
              
              <div className="p-3 space-y-3 flex-1">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => (
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
                      />
                    </div>
                  ))}
                </AnimatePresence>
                
                {colTasks.length === 0 && (
                  <div className="empty-state py-12">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Plus className="w-5 h-5 text-[#52525B]" />
                    </div>
                    <span className="text-sm font-medium text-[#71717A]">No tasks</span>
                    <span className="text-xs text-[#52525B] mt-1">Drag tasks here</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-white/5">
                <button className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-all border border-dashed border-white/10 hover:border-white/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
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
