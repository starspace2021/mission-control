import memoriesData from './memories.json';

export interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'long_term' | 'daily' | 'project' | 'system';
  tags: string[];
  importance: number;
  updatedAt: string;
  createdAt?: string;
}

export const memories: Memory[] = memoriesData;
