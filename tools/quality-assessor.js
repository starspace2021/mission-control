#!/usr/bin/env node
/**
 * Quality Assessor Module
 * 日报质量评估系统 - 量化每份日报的质量
 * 
 * 参考设计：简洁实用的 CLI 工具风格
 * 作者：侧影
 */

const fs = require('fs');
const path = require('path');

// ============================================
// 配置
// ============================================

const CONFIG = {
  // 评分权重
  weights: {
    coverage: 0.25,      // 覆盖率
    accuracy: 0.25,      // 准确性
    timeliness: 0.20,    // 时效性
    readability: 0.15,   // 可读性
    completeness: 0.15   // 完整性
  },
  
  // 输出目录 - 使用 workspace 根目录下的 memory/quality-reports
  outputDir: path.join(process.cwd(), '..', 'memory', 'quality-reports'),
  
  // 日报模板字段（用于完整性检查）
  requiredFields: [
    '报告日期',
    '报告时段',
    '执行摘要',
    '来源'
  ],
  
  // 信息来源类型（用于覆盖率检查）
  sourceTypes: [
    '路透社', '新华社', '彭博社', '华尔街日报', '金融时报',
    '半岛电视台', 'BBC', 'CNN', '法新社', '美联社',
    '政府官网', '智库报告', '学术期刊', 'Twitter', '社交媒体',
    '卫星数据', '统计数据', '财报', '新闻稿'
  ],
  
  // 关键词类别（用于内容深度评估）
  keywordCategories: {
    security: ['安全', '袭击', '冲突', '军事', '恐怖', '绑架', '伤亡'],
    economy: ['贸易', '投资', 'GDP', '增长', '关税', '出口', '进口', '货币', '通胀'],
    politics: ['外交', '协议', '峰会', '选举', '制裁', '合作', '访问'],
    business: ['企业', '公司', '合同', '项目', '并购', '融资', '上市'],
    technology: ['技术', '5G', 'AI', '数字', '创新', '专利']
  }
};

// ============================================
// 工具函数
// ============================================

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 获取今天的日期字符串
 */
function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * 解析日期字符串为时间戳
 */
function parseDate(dateStr) {
  // 支持格式：2026年2月22日、2026-02-22、2026/02/22
  const patterns = [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])).getTime();
    }
  }
  return null;
}

/**
 * 计算天数差
 */
function daysDiff(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(date1 - date2) / oneDay);
}

// ============================================
// 评分维度实现
// ============================================

/**
 * 1. 覆盖率评分 (Coverage)
 * 评估信息来源的多样性
 * 
 * 评分逻辑：
 * - 统计唯一来源数量
 * - 统计关键词类别覆盖
 * - 评估内容广度
 */
function assessCoverage(content) {
  let score = 5; // 基础分
  let details = [];
  
  // 1.1 统计来源数量
  const foundSources = [];
  for (const source of CONFIG.sourceTypes) {
    if (content.includes(source)) {
      foundSources.push(source);
    }
  }
  
  const sourceCount = foundSources.length;
  if (sourceCount >= 5) score += 2;
  else if (sourceCount >= 3) score += 1;
  
  details.push(`信息来源: ${sourceCount}个 (${foundSources.join(', ') || '无明确来源'})`);
  
  // 1.2 统计关键词类别覆盖
  let categoryCount = 0;
  for (const [category, keywords] of Object.entries(CONFIG.keywordCategories)) {
    const hasKeyword = keywords.some(kw => content.includes(kw));
    if (hasKeyword) categoryCount++;
  }
  
  if (categoryCount >= 4) score += 2;
  else if (categoryCount >= 2) score += 1;
  
  details.push(`主题覆盖: ${categoryCount}/5 类别`);
  
  // 1.3 内容长度评估
  const charCount = content.length;
  if (charCount > 5000) score += 1;
  else if (charCount < 1000) score -= 1;
  
  details.push(`内容长度: ${charCount}字符`);
  
  // 确保在 1-10 范围内
  score = Math.max(1, Math.min(10, score));
  
  return { score, details, metadata: { sourceCount, categoryCount, charCount, sources: foundSources } };
}

/**
 * 2. 准确性评分 (Accuracy)
 * 评估事实核查和引用来源
 * 
 * 评分逻辑：
 * - 检查是否有明确的来源引用
 * - 检查是否有数据支撑
 * - 检查是否有日期/时间戳
 * - LLM 辅助评估（标记需要人工复核的部分）
 */
function assessAccuracy(content) {
  let score = 5;
  let details = [];
  let flags = [];
  
  // 2.1 检查来源引用
  const sourcePattern = /来源[：:]\s*([^\n]+)/g;
  const sources = [];
  let match;
  while ((match = sourcePattern.exec(content)) !== null) {
    sources.push(match[1].trim());
  }
  
  const sourceCount = sources.length;
  if (sourceCount >= 5) score += 2;
  else if (sourceCount >= 3) score += 1;
  else if (sourceCount === 0) {
    score -= 2;
    flags.push('缺少来源引用');
  }
  
  details.push(`引用来源: ${sourceCount}处`);
  
  // 2.2 检查数据支撑
  const dataPatterns = [
    /\d+\.?\d*\s*%/,           // 百分比
    /\$\d+\.?\d*\s*(亿|万)?/,  // 金额
    /\d+\s*(人|个|家|次)/,      // 数量
    /\d{4}年/,                 // 年份
    /GDP|贸易额|投资/           // 经济指标
  ];
  
  let dataPoints = 0;
  for (const pattern of dataPatterns) {
    const matches = content.match(new RegExp(pattern, 'g'));
    if (matches) dataPoints += matches.length;
  }
  
  if (dataPoints >= 10) score += 2;
  else if (dataPoints >= 5) score += 1;
  
  details.push(`数据点: ${dataPoints}个`);
  
  // 2.3 检查日期一致性
  const dateMatches = content.match(/\d{4}[年/-]\d{1,2}[月/-]\d{1,2}/g);
  const uniqueDates = [...new Set(dateMatches || [])];
  
  if (uniqueDates.length >= 3) score += 1;
  
  details.push(`日期引用: ${uniqueDates.length}个`);
  
  // 2.4 标记需要复核的内容
  const vaguePatterns = [
    /据悉/, / reportedly /i, /据说/, /有消息称/,
    /可能/, /或许/, /大概/, /估计/
  ];
  
  for (const pattern of vaguePatterns) {
    if (pattern.test(content)) {
      flags.push(`发现模糊表述: ${pattern.source}`);
    }
  }
  
  // 确保在 1-10 范围内
  score = Math.max(1, Math.min(10, score));
  
  return { score, details, flags, metadata: { sourceCount, dataPoints, uniqueDates: uniqueDates.length } };
}

/**
 * 3. 时效性评分 (Timeliness)
 * 评估信息新鲜度
 * 
 * 评分逻辑：
 * - 检查报告日期与内容日期的匹配度
 * - 检查是否包含"过去24小时"等时效标识
 * - 评估内容日期分布
 */
function assessTimeliness(content, reportDate) {
  let score = 5;
  let details = [];
  
  // 3.1 检查时效标识
  const timelinessMarkers = [
    '过去24小时', '过去48小时', '今日', '昨日', '最新',
    '刚刚', '实时', '24-hour', 'latest', 'breaking'
  ];
  
  let markerCount = 0;
  for (const marker of timelinessMarkers) {
    if (content.includes(marker)) markerCount++;
  }
  
  if (markerCount >= 2) score += 2;
  else if (markerCount >= 1) score += 1;
  
  details.push(`时效标识: ${markerCount}个`);
  
  // 3.2 检查日期新鲜度
  const reportTimestamp = parseDate(reportDate) || Date.now();
  const contentDates = [];
  
  // 提取所有日期
  const datePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日/g;
  let dateMatch;
  while ((dateMatch = datePattern.exec(content)) !== null) {
    const date = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
    contentDates.push(date.getTime());
  }
  
  // 计算平均日期偏移
  if (contentDates.length > 0) {
    const avgDate = contentDates.reduce((a, b) => a + b, 0) / contentDates.length;
    const daysOffset = daysDiff(reportTimestamp, avgDate);
    
    if (daysOffset <= 1) score += 2;
    else if (daysOffset <= 3) score += 1;
    else if (daysOffset > 7) score -= 1;
    
    details.push(`平均时效: ${daysOffset}天前`);
  } else {
    details.push('未提取到具体日期');
  }
  
  // 3.3 检查是否有历史数据堆积
  const oldDates = contentDates.filter(d => daysDiff(reportTimestamp, d) > 7);
  if (oldDates.length > contentDates.length * 0.5) {
    score -= 1;
    details.push('警告: 超过50%内容为一周前信息');
  }
  
  // 确保在 1-10 范围内
  score = Math.max(1, Math.min(10, score));
  
  return { score, details, metadata: { markerCount, contentDates: contentDates.length, avgDaysOffset: contentDates.length > 0 ? daysDiff(reportTimestamp, contentDates.reduce((a, b) => a + b, 0) / contentDates.length) : null } };
}

/**
 * 4. 可读性评分 (Readability)
 * 评估结构清晰度和语言流畅度
 * 
 * 评分逻辑：
 * - 检查标题结构
 * - 检查列表使用
 * - 检查段落长度
 * - 检查格式规范
 */
function assessReadability(content) {
  let score = 5;
  let details = [];
  
  // 4.1 检查标题结构
  const headingPatterns = [
    /^##+\s+/m,           // Markdown 标题
    /^【.+】/m,           // 中文方括号标题
    /^[\d一二三四五]+[、.]/m  // 数字/中文序号
  ];
  
  let headingCount = 0;
  for (const pattern of headingPatterns) {
    const matches = content.match(new RegExp(pattern, 'gm'));
    if (matches) headingCount += matches.length;
  }
  
  if (headingCount >= 5) score += 2;
  else if (headingCount >= 3) score += 1;
  else if (headingCount === 0) score -= 1;
  
  details.push(`标题结构: ${headingCount}个层级`);
  
  // 4.2 检查列表使用
  const listPatterns = [
    /^-\s+/m,             // 无序列表
    /^\d+\.\s+/m,         // 有序列表
    /^\*\s+/m            // 星号列表
  ];
  
  let listItemCount = 0;
  for (const pattern of listPatterns) {
    const matches = content.match(new RegExp(pattern, 'gm'));
    if (matches) listItemCount += matches.length;
  }
  
  if (listItemCount >= 10) score += 2;
  else if (listItemCount >= 5) score += 1;
  
  details.push(`列表项: ${listItemCount}个`);
  
  // 4.3 检查段落长度
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const longParagraphs = paragraphs.filter(p => p.length > 500);
  
  if (longParagraphs.length === 0) score += 1;
  else if (longParagraphs.length > paragraphs.length * 0.3) {
    score -= 1;
    details.push('警告: 存在过长段落');
  }
  
  details.push(`段落数: ${paragraphs.length}`);
  
  // 4.4 检查表格使用
  const tablePattern = /\|.*\|.*\|/;
  if (tablePattern.test(content)) {
    score += 1;
    details.push('包含数据表格');
  }
  
  // 4.5 检查 emoji/标记使用
  const emojiPattern = /[🔴🟢🔵🟡⚠️✅❌📊📈📉]/;
  if (emojiPattern.test(content)) {
    score += 1;
    details.push('使用视觉标记');
  }
  
  // 确保在 1-10 范围内
  score = Math.max(1, Math.min(10, score));
  
  return { score, details, metadata: { headingCount, listItemCount, paragraphCount: paragraphs.length, hasTable: tablePattern.test(content), hasEmoji: emojiPattern.test(content) } };
}

/**
 * 5. 完整性评分 (Completeness)
 * 评估必填字段是否齐全
 * 
 * 评分逻辑：
 * - 检查模板字段
 * - 检查关键章节
 * - 检查元数据
 */
function assessCompleteness(content) {
  let score = 5;
  let details = [];
  let missingFields = [];
  
  // 5.1 检查必填字段
  for (const field of CONFIG.requiredFields) {
    if (content.includes(field)) {
      score += 0.5;
    } else {
      missingFields.push(field);
    }
  }
  
  details.push(`必填字段: ${CONFIG.requiredFields.length - missingFields.length}/${CONFIG.requiredFields.length}`);
  
  // 5.2 检查关键章节
  const keySections = [
    { name: '执行摘要', patterns: ['执行摘要', '摘要', '概述', '总结'] },
    { name: '风险评估', patterns: ['风险评估', '风险', '预警'] },
    { name: '安全事件', patterns: ['安全', '事件', '冲突'] },
    { name: '商业投资', patterns: ['商业', '投资', '贸易', '经济'] },
    { name: '外交政治', patterns: ['外交', '政治', '政策'] }
  ];
  
  let sectionCount = 0;
  for (const section of keySections) {
    const hasSection = section.patterns.some(p => content.includes(p));
    if (hasSection) sectionCount++;
  }
  
  if (sectionCount >= 4) score += 2;
  else if (sectionCount >= 3) score += 1;
  
  details.push(`关键章节: ${sectionCount}/${keySections.length}`);
  
  // 5.3 检查元数据
  const metadataPatterns = [
    /报告日期[：:]/,
    /编制[：:]/,
    /来源[：:]/
  ];
  
  let metadataCount = 0;
  for (const pattern of metadataPatterns) {
    if (pattern.test(content)) metadataCount++;
  }
  
  if (metadataCount >= 3) score += 1;
  
  details.push(`元数据项: ${metadataCount}/3`);
  
  // 5.4 检查是否有结论/建议
  const conclusionPatterns = [
    /结论/, /建议/, /展望/, /下一步/, /风险评估/
  ];
  
  let hasConclusion = false;
  for (const pattern of conclusionPatterns) {
    if (pattern.test(content)) {
      hasConclusion = true;
      break;
    }
  }
  
  if (hasConclusion) {
    score += 1;
    details.push('包含结论/建议');
  }
  
  // 确保在 1-10 范围内
  score = Math.max(1, Math.min(10, score));
  
  return { score, details, missingFields, metadata: { sectionCount, metadataCount, hasConclusion } };
}

// ============================================
// 主评估函数
// ============================================

/**
 * 评估单份日报
 * @param {string} content - 日报内容
 * @param {string} taskName - 任务名称
 * @param {string} reportDate - 报告日期 (YYYY-MM-DD)
 * @returns {Object} 质量评估报告
 */
function assessReport(content, taskName, reportDate) {
  // 执行各维度评估
  const coverage = assessCoverage(content);
  const accuracy = assessAccuracy(content);
  const timeliness = assessTimeliness(content, reportDate);
  const readability = assessReadability(content);
  const completeness = assessCompleteness(content);
  
  // 计算总分
  const totalScore = Math.round(
    coverage.score * CONFIG.weights.coverage +
    accuracy.score * CONFIG.weights.accuracy +
    timeliness.score * CONFIG.weights.timeliness +
    readability.score * CONFIG.weights.readability +
    completeness.score * CONFIG.weights.completeness
  );
  
  // 生成建议
  const suggestions = generateSuggestions({
    coverage, accuracy, timeliness, readability, completeness
  });
  
  // 生成质量等级
  let grade;
  if (totalScore >= 9) grade = 'A+';
  else if (totalScore >= 8) grade = 'A';
  else if (totalScore >= 7) grade = 'B+';
  else if (totalScore >= 6) grade = 'B';
  else if (totalScore >= 5) grade = 'C';
  else grade = 'D';
  
  return {
    taskName,
    reportDate,
    assessedAt: new Date().toISOString(),
    scores: {
      coverage: coverage.score,
      accuracy: accuracy.score,
      timeliness: timeliness.score,
      readability: readability.score,
      completeness: completeness.score,
      total: totalScore,
      grade
    },
    details: {
      coverage: coverage.details,
      accuracy: accuracy.details,
      timeliness: timeliness.details,
      readability: readability.details,
      completeness: completeness.details
    },
    flags: {
      accuracy: accuracy.flags || [],
      completeness: completeness.missingFields || []
    },
    metadata: {
      coverage: coverage.metadata,
      accuracy: accuracy.metadata,
      timeliness: timeliness.metadata,
      readability: readability.metadata,
      completeness: completeness.metadata
    },
    suggestions
  };
}

/**
 * 生成改进建议
 */
function generateSuggestions(results) {
  const suggestions = [];
  
  // 覆盖率建议
  if (results.coverage.score < 6) {
    suggestions.push('增加信息来源多样性，建议引用至少3-5个不同来源');
    suggestions.push('扩展主题覆盖，包含安全、经济、政治等多维度内容');
  } else if (results.coverage.score < 8) {
    suggestions.push('可适当增加更多权威来源引用');
  }
  
  // 准确性建议
  if (results.accuracy.score < 6) {
    suggestions.push('加强事实核查，为关键数据添加来源引用');
    suggestions.push('减少模糊表述，使用具体数据和日期');
  }
  if (results.accuracy.flags && results.accuracy.flags.length > 0) {
    suggestions.push(`复核以下问题: ${results.accuracy.flags.join('; ')}`);
  }
  
  // 时效性建议
  if (results.timeliness.score < 6) {
    suggestions.push('增加最新动态内容，减少过时信息');
    suggestions.push('明确标注"过去24小时"等时效标识');
  }
  
  // 可读性建议
  if (results.readability.score < 6) {
    suggestions.push('优化文档结构，使用更多标题层级');
    suggestions.push('使用列表和表格提升信息可读性');
  }
  
  // 完整性建议
  if (results.completeness.score < 6) {
    suggestions.push('补充缺失的必填字段');
    if (results.completeness.missingFields && results.completeness.missingFields.length > 0) {
      suggestions.push(`缺失: ${results.completeness.missingFields.join(', ')}`);
    }
  }
  
  if (suggestions.length === 0) {
    suggestions.push('报告质量良好，继续保持');
  }
  
  return suggestions;
}

// ============================================
// 输出函数
// ============================================

/**
 * 保存质量报告
 */
function saveQualityReport(report) {
  ensureDir(CONFIG.outputDir);
  
  const filename = `${report.reportDate}.json`;
  const filepath = path.join(CONFIG.outputDir, filename);
  
  // 读取已有报告（如果存在）
  let reports = [];
  if (fs.existsSync(filepath)) {
    try {
      reports = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      if (!Array.isArray(reports)) reports = [reports];
    } catch (e) {
      reports = [];
    }
  }
  
  // 添加新报告
  reports.push(report);
  
  // 保存
  fs.writeFileSync(filepath, JSON.stringify(reports, null, 2), 'utf-8');
  
  return filepath;
}

/**
 * 生成文本格式的质量报告
 */
function generateTextReport(report) {
  const lines = [
    `================================`,
    `📊 日报质量评估报告`,
    `================================`,
    ``,
    `任务名称: ${report.taskName}`,
    `报告日期: ${report.reportDate}`,
    `评估时间: ${new Date(report.assessedAt).toLocaleString('zh-CN')}`,
    ``,
    `--------------------------------`,
    `📈 评分概览`,
    `--------------------------------`,
    ``,
    `  覆盖率    ${report.scores.coverage}/10  ${'█'.repeat(report.scores.coverage)}${'░'.repeat(10 - report.scores.coverage)}`,
    `  准确性    ${report.scores.accuracy}/10  ${'█'.repeat(report.scores.accuracy)}${'░'.repeat(10 - report.scores.accuracy)}`,
    `  时效性    ${report.scores.timeliness}/10  ${'█'.repeat(report.scores.timeliness)}${'░'.repeat(10 - report.scores.timeliness)}`,
    `  可读性    ${report.scores.readability}/10  ${'█'.repeat(report.scores.readability)}${'░'.repeat(10 - report.scores.readability)}`,
    `  完整性    ${report.scores.completeness}/10  ${'█'.repeat(report.scores.completeness)}${'░'.repeat(10 - report.scores.completeness)}`,
    ``,
    `  ──────────────────────────────`,
    `  总评分    ${report.scores.total}/10  [等级: ${report.scores.grade}]`,
    ``,
    `--------------------------------`,
    `🔍 详细分析`,
    `--------------------------------`,
    ``,
    `[覆盖率]`,
    ...report.details.coverage.map(d => `  • ${d}`),
    ``,
    `[准确性]`,
    ...report.details.accuracy.map(d => `  • ${d}`),
    ...(report.flags.accuracy.length > 0 ? ['', '  ⚠️ 注意:', ...report.flags.accuracy.map(f => `    - ${f}`)] : []),
    ``,
    `[时效性]`,
    ...report.details.timeliness.map(d => `  • ${d}`),
    ``,
    `[可读性]`,
    ...report.details.readability.map(d => `  • ${d}`),
    ``,
    `[完整性]`,
    ...report.details.completeness.map(d => `  • ${d}`),
    ...(report.flags.completeness.length > 0 ? ['', '  ⚠️ 缺失字段:', ...report.flags.completeness.map(f => `    - ${f}`)] : []),
    ``,
    `--------------------------------`,
    `💡 改进建议`,
    `--------------------------------`,
    ``,
    ...report.suggestions.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `================================`,
    ``
  ];
  
  return lines.join('\n');
}

// ============================================
// 周度趋势分析
// ============================================

/**
 * 获取周度质量报告
 * @param {string} weekStart - 周开始日期 (YYYY-MM-DD)
 */
function getWeeklyTrend(weekStart) {
  const startDate = new Date(weekStart);
  const reports = [];
  
  // 读取本周所有报告
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const filepath = path.join(CONFIG.outputDir, `${dateStr}.json`);
    
    if (fs.existsSync(filepath)) {
      try {
        const dayReports = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        reports.push(...(Array.isArray(dayReports) ? dayReports : [dayReports]));
      } catch (e) {
        // 忽略错误
      }
    }
  }
  
  if (reports.length === 0) {
    return null;
  }
  
  // 按任务分组统计
  const taskStats = {};
  for (const report of reports) {
    const task = report.taskName;
    if (!taskStats[task]) {
      taskStats[task] = {
        count: 0,
        totalScore: 0,
        scores: []
      };
    }
    taskStats[task].count++;
    taskStats[task].totalScore += report.scores.total;
    taskStats[task].scores.push({
      date: report.reportDate,
      score: report.scores.total,
      grade: report.scores.grade
    });
  }
  
  // 计算平均值和趋势
  const taskSummaries = [];
  for (const [task, stats] of Object.entries(taskStats)) {
    const avgScore = Math.round(stats.totalScore / stats.count * 10) / 10;
    
    // 计算趋势
    let trend = 'stable';
    if (stats.scores.length >= 2) {
      const first = stats.scores[0].score;
      const last = stats.scores[stats.scores.length - 1].score;
      const diff = last - first;
      if (diff >= 2) trend = 'up';
      else if (diff <= -2) trend = 'down';
    }
    
    // 识别质量退化
    const degradation = stats.scores.some((s, i) => i > 0 && s.score < stats.scores[i - 1].score - 2);
    
    taskSummaries.push({
      taskName: task,
      reportCount: stats.count,
      averageScore: avgScore,
      trend,
      trendSymbol: trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️',
      degradation,
      scores: stats.scores
    });
  }
  
  // 整体统计
  const allScores = reports.map(r => r.scores.total);
  const overallAvg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length * 10) / 10;
  
  return {
    weekStart,
    weekEnd: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
    overall: {
      totalReports: reports.length,
      averageScore: overallAvg,
      scoreDistribution: {
        'A+ (9-10)': allScores.filter(s => s >= 9).length,
        'A (8-8.9)': allScores.filter(s => s >= 8 && s < 9).length,
        'B+ (7-7.9)': allScores.filter(s => s >= 7 && s < 8).length,
        'B (6-6.9)': allScores.filter(s => s >= 6 && s < 7).length,
        'C (5-5.9)': allScores.filter(s => s >= 5 && s < 6).length,
        'D (<5)': allScores.filter(s => s < 5).length
      }
    },
    tasks: taskSummaries.sort((a, b) => b.averageScore - a.averageScore)
  };
}

/**
 * 生成周度趋势报告文本
 */
function generateWeeklyReport(trend) {
  if (!trend) {
    return '本周暂无质量报告数据';
  }
  
  const lines = [
    `================================`,
    `📊 周度质量趋势报告`,
    `================================`,
    ``,
    `统计周期: ${trend.weekStart} 至 ${trend.weekEnd}`,
    `生成时间: ${new Date(trend.generatedAt).toLocaleString('zh-CN')}`,
    ``,
    `--------------------------------`,
    `📈 整体概览`,
    `--------------------------------`,
    ``,
    `  总报告数: ${trend.overall.totalReports}份`,
    `  平均得分: ${trend.overall.averageScore}/10`,
    ``,
    `  质量分布:`,
    ...Object.entries(trend.overall.scoreDistribution).map(([grade, count]) => 
      `    ${grade}: ${count}份 ${'█'.repeat(count)}`
    ),
    ``,
    `--------------------------------`,
    `📋 任务质量排行`,
    `--------------------------------`,
    ``
  ];
  
  for (const task of trend.tasks) {
    lines.push(`  ${task.trendSymbol} ${task.taskName}`);
    lines.push(`     平均分: ${task.averageScore}/10 | 报告数: ${task.reportCount}`);
    lines.push(`     趋势: ${task.trend === 'up' ? '上升' : task.trend === 'down' ? '下降' : '稳定'}`);
    if (task.degradation) {
      lines.push(`     ⚠️ 注意: 该任务出现质量退化`);
    }
    lines.push(`     得分记录: ${task.scores.map(s => s.score).join(' → ')}`);
    lines.push('');
  }
  
  // 退化任务警告
  const degradedTasks = trend.tasks.filter(t => t.degradation);
  if (degradedTasks.length > 0) {
    lines.push(`--------------------------------`);
    lines.push(`⚠️ 质量退化预警`);
    lines.push(`--------------------------------`);
    lines.push('');
    for (const task of degradedTasks) {
      lines.push(`  • ${task.taskName} - 建议关注并改进`);
    }
    lines.push('');
  }
  
  lines.push(`================================`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * 保存周度趋势报告
 */
function saveWeeklyReport(trend) {
  ensureDir(CONFIG.outputDir);
  
  const filename = `weekly-${trend.weekStart}.json`;
  const filepath = path.join(CONFIG.outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(trend, null, 2), 'utf-8');
  
  // 同时保存文本版本
  const textReport = generateWeeklyReport(trend);
  fs.writeFileSync(filepath.replace('.json', '.txt'), textReport, 'utf-8');
  
  return filepath;
}

// ============================================
// CLI 接口
// ============================================

function showHelp() {
  console.log(`
📊 Quality Assessor - 日报质量评估系统

用法:
  node quality-assessor.js <command> [options]

命令:
  assess <file> <taskName> <date>   评估单份日报
  weekly <weekStartDate>            生成周度趋势报告
  list [date]                       列出质量报告
  help                              显示帮助

示例:
  # 评估日报
  node quality-assessor.js assess ./africa_report.md "非洲情报" 2026-02-22

  # 生成周度报告
  node quality-assessor.js weekly 2026-02-17

  # 列出今日报告
  node quality-assessor.js list

评分维度 (1-10分):
  • 覆盖率   - 信息来源多样性
  • 准确性   - 事实核查、引用来源
  • 时效性   - 信息新鲜度
  • 可读性   - 结构清晰度、语言流畅度
  • 完整性   - 必填字段是否齐全
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'assess': {
      if (args.length < 4) {
        console.error('错误: 缺少参数');
        console.log('用法: node quality-assessor.js assess <file> <taskName> <date>');
        process.exit(1);
      }
      
      const [_, filePath, taskName, reportDate] = args;
      
      if (!fs.existsSync(filePath)) {
        console.error(`错误: 文件不存在: ${filePath}`);
        process.exit(1);
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const report = assessReport(content, taskName, reportDate);
      
      // 保存报告
      const savedPath = saveQualityReport(report);
      
      // 输出报告
      console.log(generateTextReport(report));
      console.log(`\n✅ 质量报告已保存: ${savedPath}`);
      
      break;
    }
    
    case 'weekly': {
      const weekStart = args[1] || getTodayString();
      const trend = getWeeklyTrend(weekStart);
      
      if (trend) {
        const savedPath = saveWeeklyReport(trend);
        console.log(generateWeeklyReport(trend));
        console.log(`\n✅ 周度报告已保存: ${savedPath}`);
      } else {
        console.log(`本周 (${weekStart} 开始) 暂无质量报告数据`);
      }
      
      break;
    }
    
    case 'list': {
      const date = args[1] || getTodayString();
      const filepath = path.join(CONFIG.outputDir, `${date}.json`);
      
      if (fs.existsSync(filepath)) {
        const reports = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        console.log(`\n📊 ${date} 的质量报告:\n`);
        for (const report of (Array.isArray(reports) ? reports : [reports])) {
          console.log(`  • ${report.taskName}: ${report.scores.total}/10 [${report.scores.grade}]`);
        }
        console.log('');
      } else {
        console.log(`\n${date} 暂无质量报告\n`);
      }
      
      break;
    }
    
    default:
      console.error(`未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// ============================================
// 模块导出
// ============================================

module.exports = {
  assessReport,
  getWeeklyTrend,
  generateTextReport,
  generateWeeklyReport,
  saveQualityReport,
  saveWeeklyReport,
  CONFIG
};

// 如果直接运行此文件
if (require.main === module) {
  main();
}
