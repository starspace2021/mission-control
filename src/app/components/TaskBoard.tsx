"use client";

import { motion } from "framer-motion";

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
  const columns = [
    { id: "todo", title: "TO DO", color: "#ff0080" },
    { id: "in_progress", title: "IN PROGRESS", color: "#00f5ff" },
    { id: "review", title: "REVIEW", color: "#b829dd" },
    { id: "done", title: "DONE", color: "#00ff88" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-4 gap-4"
    >
      {columns.map((column) => (
        <div key={column.id} className="glass-card min-h-[600px]">
          {/* 列标题 */}
          <div 
            className="p-4 border-b border-white/10"
            style={{ borderColor: `${column.color}30` }}
          >
            <h3 
              className="font-bold text-sm tracking-wider"
              style={{ color: column.color }}
            >
              {column.title}
            </h3>
            <div className="text-xs text-white/40 mt-1 font-mono">
              {tasks?.filter(t => t.status === column.id).length || 0} TASKS
            </div>
          </div>

          {/* 任务列表 */}
          <div className="p-4 space-y-3">
            {tasks
              ?.filter((t) => t.status === column.id)
              .map((task, index) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  index={index}
                />
              ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function TaskCard({ task, index }: { 
  task: Task; 
  index: number;
}) {
  const priorityColors: Record<string, string> = {
    high: "#ff0080",
    medium: "#b829dd",
    low: "#00f5ff",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card p-4 cursor-pointer group relative overflow-hidden"
    >
      {/* 优先级指示条 */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: priorityColors[task.priority] }}
      />

      {/* 内容 */}
      <div className="pl-3">
        <h4 className="font-medium text-white group-hover:text-[#00f5ff] transition-colors">
          {task.title}
        </h4>
        <p className="text-sm text-white/50 mt-1 line-clamp-2">
          {task.description}
        </p>
        
        {/* 元信息 */}
        <div className="flex items-center gap-3 mt-3 text-xs">
          <span className="flex items-center gap-1 text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff]" />
            {task.assignee}
          </span>
          {task.dueDate && (
            <span className="text-white/30 font-mono">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* 标签 */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag: string) => (
              <span 
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
