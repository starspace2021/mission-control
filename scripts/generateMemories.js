const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function loadMemories() {
  const memoryDir = path.join(__dirname, '..', 'memory');
  
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
    let type = 'daily';
    if (file.includes('config') || file.includes('rules')) {
      type = 'system';
    } else if (file.includes('project') || file.includes('iteration')) {
      type = 'project';
    } else if (file.includes('long') || file.includes('profile')) {
      type = 'long_term';
    } else if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file)) {
      type = 'daily';
    }
    
    const finalType = data.type || type;
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

// 生成静态数据文件
const memories = loadMemories();
const outputPath = path.join(__dirname, '..', 'src', 'data', 'memories.json');

fs.writeFileSync(outputPath, JSON.stringify(memories, null, 2));
console.log(`Generated memories.json with ${memories.length} entries`);
