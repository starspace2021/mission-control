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
    
    // 根据文件名和路径推断类型
    let type: Memory['type'] = 'daily';
    const lowerFile = file.toLowerCase();
    
    // 系统文档：配置、规则、设置相关
    if (lowerFile.includes('config') || 
        lowerFile.includes('rules') || 
        lowerFile.includes('setting') ||
        lowerFile.includes('system') ||
        lowerFile.includes('schema') ||
        lowerFile.includes('template')) {
      type = 'system';
    } 
    // 项目文档：项目、迭代、任务相关
    else if (lowerFile.includes('project') || 
             lowerFile.includes('iteration') ||
             lowerFile.includes('task') ||
             lowerFile.includes('dashboard') ||
             lowerFile.includes('feature') ||
             lowerFile.includes('release')) {
      type = 'project';
    } 
    // 长期记忆：身份、用户、策略、架构相关
    else if (lowerFile.includes('identity') || 
             lowerFile.includes('user') ||
             lowerFile.includes('profile') ||
             lowerFile.includes('strategy') ||
             lowerFile.includes('architecture') ||
             lowerFile.includes('structure') ||
             lowerFile.includes('team') ||
             lowerFile.includes('department') ||
             lowerFile.includes('agent') ||
             lowerFile.includes('soul') ||
             lowerFile.includes('memory') && !lowerFile.match(/^\d{4}-\d{2}-\d{2}/)) {
      type = 'long_term';
    } 
    // 每日记录：日期格式 YYYY-MM-DD.md
    else if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file)) {
      type = 'daily';
    }
    // 其他有内容但没有特定关键词的，根据文件位置判断
    else {
      // 检查文件内容中是否有类型标记
      if (body.includes('# 长期记忆') || body.includes('## 长期记忆')) {
        type = 'long_term';
      } else if (body.includes('# 项目') || body.includes('## 项目')) {
        type = 'project';
      } else if (body.includes('# 系统') || body.includes('## 系统')) {
        type = 'system';
      }
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
