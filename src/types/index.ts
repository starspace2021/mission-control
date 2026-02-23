export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  department: string;
  scheduledTime: string;
  executor: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Agent {
  id: string;
  name: string;
  department: string;
  status: 'online' | 'working' | 'offline';
  currentTask?: string;
  avatar?: string;
  role?: string;
}

export interface Memory {
  id: string;
  title: string;
  type: 'long_term' | 'daily' | 'project' | 'system';
  tags: string[];
  content: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  department: string;
  type: 'task' | 'meeting' | 'deadline';
  color: string;
}
