'use client';
import { useState } from 'react';
import { tasks as initialTasks } from '@/data/mockData';
import { Task } from '@/types';

const priorityColor: Record<string, string> = {
  high: 'tag-red',
  medium: 'tag-orange',
  low: 'tag-green',
};

const deptColor: Record<string, string> = {
  Research: 'tag-blue',
  Analytics: 'tag-purple',
  Operations: 'tag-orange',
  Engineering: 'tag-green',
  Content: 'tag-green',
  Product: 'tag-blue',
  Sales: 'tag-orange',
  Design: 'tag-purple',
};

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div className="task-card" onClick={onClick}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <span className={`tag ${deptColor[task.department] || 'tag-gray'}`}>{task.department}</span>
        {task.priority && <span className={`tag ${priorityColor[task.priority]}`}>{task.priority}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕐 {task.scheduledTime.split(' ')[1]}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: 'var(--accent-blue)' }}>
            {task.executor.charAt(0)}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{task.executor}</span>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [allTasks] = useState<Task[]>(initialTasks);
  const [selected, setSelected] = useState<Task | null>(null);

  const columns = [
    { key: 'todo', label: 'To Do', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
    { key: 'in_progress', label: 'In Progress', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
    { key: 'completed', label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {columns.map(col => {
          const colTasks = allTasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }}></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', background: col.bg, color: col.color, borderRadius: 8, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                  {colTasks.length}
                </span>
              </div>
              <div className="scroll-area" style={{ maxHeight: 480 }}>
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelected(task)} />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{selected.title}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`tag ${deptColor[selected.department] || 'tag-gray'}`}>{selected.department}</span>
                  {selected.priority && <span className={`tag ${priorityColor[selected.priority]}`}>{selected.priority}</span>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Status</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selected.status.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Executor</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: 'var(--accent-blue)' }}>{selected.executor.charAt(0)}</div>
                  <span style={{ fontWeight: 600 }}>{selected.executor}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Scheduled</span>
                <span style={{ fontWeight: 600 }}>{selected.scheduledTime}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', width: 100 }}>Department</span>
                <span style={{ fontWeight: 600 }}>{selected.department}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
