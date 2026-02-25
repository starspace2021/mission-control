import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

export function loadMemories(): Memory[] {
  const memoryDir = path.join(process.cwd(), '..', 'memory');
  
  if (!fs.existsSync(memoryDir)) {
    console.warn('Memory directory not found:', memoryDir);
    return [];
  }
  
  const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const filePath = path.join(memoryDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    // 根据文件名推断类型
    let type: Memory['type'] = 'daily';
    if (file.includes('config') || file.includes('rules')) {
      type = 'system';
    } else if (file.includes('project') || file.includes('iteration')) {
      type = 'project';
    } else if (file.includes('long') || file.includes('profile')) {
      type = 'long_term';
    } else if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file)) {
      type = 'daily';
    }
    
    // 从 frontmatter 获取类型，如果没有则使用推断的类型
    const finalType = data.type || type;
    
    // 获取文件修改时间作为 updatedAt
    const stats = fs.statSync(filePath);
    const updatedAt = data.updatedAt || stats.mtime.toISOString();
    const createdAt = data.createdAt || stats.birthtime.toISOString();
    
    return {
      id: file.replace('.md', ''),
      title: data.title || file.replace('.md', ''),
      content: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
      type: finalType,
      tags: data.tags || [],
      importance: data.importance || 5,
      updatedAt,
      createdAt,
    };
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
