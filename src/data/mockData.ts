export const taskTrend = [
  { day: 'Mon', completed: 12, created: 8 },
  { day: 'Tue', completed: 15, created: 10 },
  { day: 'Wed', completed: 18, created: 12 },
  { day: 'Thu', completed: 14, created: 9 },
  { day: 'Fri', completed: 20, created: 15 },
  { day: 'Sat', completed: 16, created: 11 },
  { day: 'Sun', completed: 22, created: 13 },
];

export const departmentLoad = [
  { name: 'Intel', value: 35, color: '#3B82F6' },
  { name: 'Policy', value: 25, color: '#8B5CF6' },
  { name: 'Market', value: 20, color: '#10B981' },
  { name: 'Engineering', value: 15, color: '#F59E0B' },
  { name: 'Other', value: 5, color: '#EC4899' },
];

export const tasks = [
  { id: '1', title: '非洲涉华情报收集', status: 'in_progress' as const, department: 'Intel', scheduledTime: '2024-01-01 20:00', executor: '系统', priority: 'high' as const },
  { id: '2', title: 'Polymarket 监控', status: 'in_progress' as const, department: 'Market', scheduledTime: '2024-01-01 20:00', executor: '系统', priority: 'high' as const },
  { id: '3', title: '美国对华政策监控', status: 'todo' as const, department: 'Policy', scheduledTime: '2024-01-01 18:00', executor: '系统', priority: 'high' as const },
  { id: '4', title: 'QQ邮箱自动清理', status: 'completed' as const, department: 'Engineering', scheduledTime: '2024-01-01 06:00', executor: '系统', priority: 'medium' as const },
];

export const agents = [
  { id: '1', name: 'Africa Intel Collector', department: 'Intel', status: 'working' as const, currentTask: '非洲情报收集', role: 'Collector' },
  { id: '2', name: 'Policy Collector', department: 'Policy', status: 'online' as const, currentTask: '', role: 'Analyst' },
  { id: '3', name: 'Market Analyst', department: 'Market', status: 'offline' as const, currentTask: '', role: 'Analyst' },
];

export const memories = [
  { id: '1', title: '非洲涉华情报系统', type: 'project', tags: ['情报', '非洲', '自动化'], content: '建立了完整的非洲涉华情报收集和分析系统', updatedAt: '2024-01-01' },
  { id: '2', title: '用户画像 - Hourglass', type: 'long_term', tags: ['用户', 'OSINT'], content: 'OSINT从业者，40岁男性', updatedAt: '2024-01-01' },
];

export const calendarEvents = [
  { id: '1', title: '非洲情报简报', date: '2024-04-15', time: '20:00', department: 'Intel', type: 'task', color: 'blue' },
  { id: '2', title: 'Polymarket 简报', date: '2024-04-16', time: '20:00', department: 'Market', type: 'task', color: 'green' },
];

export const pipelineSteps = [
  { id: '1', title: 'Data Ingestion', status: 'completed', progress: 100 },
  { id: '2', title: 'Processing', status: 'completed', progress: 100 },
  { id: '3', title: 'Analysis', status: 'active', progress: 65 },
  { id: '4', title: 'Report Generation', status: 'pending', progress: 0 },
  { id: '5', title: 'Distribution', status: 'pending', progress: 0 },
];
