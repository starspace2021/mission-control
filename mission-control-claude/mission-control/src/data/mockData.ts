import { Task, Agent, Memory, CalendarEvent, PipelineStep } from '@/types';

export const tasks: Task[] = [
  { id: '1', title: 'Research new market trends', status: 'todo', department: 'Research', scheduledTime: '2024-04-18 09:00', executor: 'Henry', priority: 'high' },
  { id: '2', title: 'Review task list', status: 'todo', department: 'Operations', scheduledTime: '2024-04-18 10:00', executor: 'Me', priority: 'medium' },
  { id: '3', title: 'Update user onboarding flow', status: 'todo', department: 'Product', scheduledTime: '2024-04-19 14:00', executor: 'Maya', priority: 'low' },
  { id: '4', title: 'Analyze data report', status: 'in_progress', department: 'Analytics', scheduledTime: '2024-04-18 11:00', executor: 'Henry', priority: 'high' },
  { id: '5', title: 'Review onter process', status: 'in_progress', department: 'Operations', scheduledTime: '2024-04-18 13:00', executor: 'Henry', priority: 'medium' },
  { id: '6', title: 'Competitor analysis', status: 'in_progress', department: 'Research', scheduledTime: '2024-04-18 15:00', executor: 'Leo', priority: 'high' },
  { id: '7', title: 'Write blog post', status: 'completed', department: 'Content', scheduledTime: '2024-04-17 09:00', executor: 'Henry', priority: 'low' },
  { id: '8', title: 'Deploy to staging', status: 'completed', department: 'Engineering', scheduledTime: '2024-04-17 14:00', executor: 'Dev', priority: 'high' },
  { id: '9', title: 'Client presentation deck', status: 'completed', department: 'Sales', scheduledTime: '2024-04-16 11:00', executor: 'Maya', priority: 'medium' },
];

export const agents: Agent[] = [
  { id: '1', name: 'Henry', department: 'Operations', status: 'working', currentTask: 'Analyze data report', role: 'AI Assistant' },
  { id: '2', name: 'Dev Agent', department: 'Engineering', status: 'online', currentTask: 'Code review', role: 'Dev Agent' },
  { id: '3', name: 'Writer Agent', department: 'Content', status: 'working', currentTask: 'Blog post drafting', role: 'Writer Agent' },
  { id: '4', name: 'Design Agent', department: 'Design', status: 'online', currentTask: undefined, role: 'Design Agent' },
  { id: '5', name: 'Maya', department: 'Research', status: 'working', currentTask: 'Market analysis', role: 'Research Agent' },
  { id: '6', name: 'Leo', department: 'Analytics', status: 'offline', currentTask: undefined, role: 'Data Agent' },
  { id: '7', name: 'Aria', department: 'Content', status: 'online', currentTask: 'Social media scheduling', role: 'Content Agent' },
  { id: '8', name: 'Rex', department: 'Engineering', status: 'working', currentTask: 'API integration', role: 'Backend Agent' },
];

export const memories: Memory[] = [
  { id: '1', title: 'Strategy Discussion', type: 'long_term', tags: ['strategy', 'planning', 'Q2'], content: 'Discussed Q2 roadmap priorities with the team. Focus on user retention and new feature rollout.', updatedAt: '2024-04-18' },
  { id: '2', title: 'Product Research Notes', type: 'project', tags: ['product', 'research', 'UX'], content: 'User interviews revealed key pain points in onboarding flow. Need to simplify step 3 and add progress indicators.', updatedAt: '2024-04-12' },
  { id: '3', title: 'Travel Plans Recap', type: 'daily', tags: ['travel', 'conference'], content: 'Booked flights for SaaStr conference. Hotel confirmation: #4521B. Arriving May 14th.', updatedAt: '2024-04-05' },
  { id: '4', title: 'System Configuration Update', type: 'system', tags: ['system', 'config', 'api'], content: 'Updated API rate limits to 1000 req/min. New webhook endpoints configured for Slack and Notion.', updatedAt: '2024-04-01' },
  { id: '5', title: 'Team Retrospective Notes', type: 'project', tags: ['team', 'retro', 'process'], content: 'Action items: improve async communication, weekly standups to bi-weekly, add sprint planning doc.', updatedAt: '2024-03-28' },
  { id: '6', title: 'Daily Standup Apr 18', type: 'daily', tags: ['standup', 'daily'], content: 'Henry: working on data analysis. Dev: code review in progress. Writer: blog post draft 80% done.', updatedAt: '2024-04-18' },
];

export const calendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Team Meeting', date: '2024-04-08', department: 'Operations', color: 'blue' },
  { id: '2', title: 'Project Sketch', date: '2024-04-08', department: 'Design', color: 'purple' },
  { id: '3', title: 'Client Call', date: '2024-04-10', department: 'Sales', color: 'green' },
  { id: '4', title: 'Project Deadline', date: '2024-04-15', department: 'Engineering', color: 'orange' },
  { id: '5', title: 'Project DevTest', date: '2024-04-19', department: 'Engineering', color: 'red' },
  { id: '6', title: 'Design Review', date: '2024-04-22', department: 'Design', color: 'purple' },
  { id: '7', title: 'Sprint Planning', date: '2024-04-24', department: 'Engineering', color: 'blue' },
];

export const pipelineSteps: PipelineStep[] = [
  { id: '1', title: 'Data Collection', description: 'Gathering raw data from all sources', status: 'completed', progress: 100 },
  { id: '2', title: 'Processing', description: 'Cleaning and normalizing data', status: 'completed', progress: 100 },
  { id: '3', title: 'Analysis', description: 'Running ML models and generating insights', status: 'active', progress: 65 },
  { id: '4', title: 'Report Generation', description: 'Compiling results into structured report', status: 'pending', progress: 0 },
  { id: '5', title: 'Distribution', description: 'Sending to stakeholders via email & Slack', status: 'pending', progress: 0 },
];

export const taskTrend = [
  { day: 'Mon', completed: 8, created: 12 },
  { day: 'Tue', completed: 15, created: 10 },
  { day: 'Wed', completed: 11, created: 14 },
  { day: 'Thu', completed: 18, created: 9 },
  { day: 'Fri', completed: 14, created: 16 },
  { day: 'Sat', completed: 7, created: 5 },
  { day: 'Sun', completed: 9, created: 8 },
];

export const departmentLoad = [
  { name: 'Engineering', value: 35, color: '#3B82F6' },
  { name: 'Content', value: 25, color: '#10B981' },
  { name: 'Research', value: 20, color: '#F59E0B' },
  { name: 'Design', value: 12, color: '#8B5CF6' },
  { name: 'Analytics', value: 8, color: '#EF4444' },
];
