#!/usr/bin/env node
/**
 * 历史对比模块 - 日报与昨日对比功能
 * 
 * 功能：
 * - 提取昨日同主题日报的关键数据
 * - 对比今日 vs 昨日：新增事件、消失事件、变化趋势
 * - 生成对比摘要
 * 
 * 作者: OpenClaw
 * 创建时间: 2026-02-25
 */

const fs = require('fs');
const path = require('path');

// ============================================
// 配置
// ============================================
const CONFIG = {
  // 快照存储目录
  SNAPSHOT_DIR: path.join(__dirname, '..', 'memory', 'daily-snapshots'),
  // 日报存储目录
  MEMORY_DIR: path.join(__dirname, '..', 'memory'),
  // 默认保留天数
  DEFAULT_RETENTION_DAYS: 30,
  // 优先级映射
  PRIORITY_LEVELS: {
    'P0': { label: '紧急', weight: 3 },
    'P1': { label: '重要', weight: 2 },
    'P2': { label: '一般', weight: 1 }
  }
};

// ============================================
// 数据模型
// ============================================

/**
 * 日报快照数据结构
 */
class DailySnapshot {
  constructor(options = {}) {
    this.date = options.date || new Date().toISOString().split('T')[0];
    this.topic = options.topic || 'default';
    this.summary = {
      totalEvents: options.totalEvents || 0,
      p0Count: options.p0Count || 0,
      p1Count: options.p1Count || 0,
      p2Count: options.p2Count || 0,
      dataSources: options.dataSources || [],
      keyMetrics: options.keyMetrics || {}
    };
    this.events = options.events || [];
    this.metadata = {
      createdAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * 从日报内容解析快照
   */
  static parseFromReport(reportContent, topic, date) {
    const snapshot = new DailySnapshot({ date, topic });
    
    // 解析事件数量
    const eventMatches = reportContent.match(/(?:事件|情报|条目|新闻).*?(\d+)\s*条/g);
    if (eventMatches) {
      const numbers = eventMatches.map(m => parseInt(m.match(/\d+/)[0]));
      snapshot.summary.totalEvents = Math.max(...numbers, 0);
    }

    // 解析优先级分布
    const p0Match = reportContent.match(/P0.*?[:：]\s*(\d+)/i);
    const p1Match = reportContent.match(/P1.*?[:：]\s*(\d+)/i);
    const p2Match = reportContent.match(/P2.*?[:：]\s*(\d+)/i);
    
    snapshot.summary.p0Count = p0Match ? parseInt(p0Match[1]) : 0;
    snapshot.summary.p1Count = p1Match ? parseInt(p1Match[1]) : 0;
    snapshot.summary.p2Count = p2Match ? parseInt(p2Match[1]) : 0;

    // 解析事件列表
    const eventPattern = /(?:^|\n)[\s]*(?:\d+\.|[\-\*]|[🔴🟡🟢])\s*(.+?)(?=\n[\s]*(?:\d+\.|[\-\*]|[🔴🟡🟢])|$)/gs;
    const eventMatches2 = reportContent.matchAll(eventPattern);
    for (const match of eventMatches2) {
      const eventText = match[1].trim();
      if (eventText.length > 5) {
        const priority = eventText.includes('P0') ? 'P0' : 
                        eventText.includes('P1') ? 'P1' : 
                        eventText.includes('P2') ? 'P2' : 'P2';
        snapshot.events.push({
          id: generateEventId(eventText),
          title: eventText.substring(0, 100),
          priority,
          fullText: eventText
        });
      }
    }

    // 解析关键指标
    const metricPatterns = [
      /(关税|税率).*?(\d+(?:\.\d+)?%?)/gi,
      /(概率|可能性).*?(\d+(?:\.\d+)?%?)/gi,
      /(指数|指标).*?(\d+(?:\.\d+)?)/gi,
      /(价格|报价).*?(\d+(?:\.\d+)?)/gi
    ];
    
    metricPatterns.forEach(pattern => {
      const matches = reportContent.matchAll(pattern);
      for (const match of matches) {
        const name = match[1];
        const value = match[2];
        snapshot.summary.keyMetrics[name] = value;
      }
    });

    // 解析数据源
    const sourceMatch = reportContent.match(/(?:数据源|来源)[:：](.+?)(?=\n|$)/i);
    if (sourceMatch) {
      snapshot.summary.dataSources = sourceMatch[1].split(/[,，;；]/).map(s => s.trim()).filter(Boolean);
    }

    return snapshot;
  }
}

/**
 * 对比结果数据结构
 */
class ComparisonResult {
  constructor() {
    this.date = new Date().toISOString().split('T')[0];
    this.yesterdayDate = null;
    this.topic = null;
    this.changes = {
      totalEvents: { yesterday: 0, today: 0, diff: 0 },
      p0Count: { yesterday: 0, today: 0, diff: 0 },
      p1Count: { yesterday: 0, today: 0, diff: 0 },
      p2Count: { yesterday: 0, today: 0, diff: 0 }
    };
    this.newEvents = [];
    this.removedEvents = [];
    this.metricChanges = [];
    this.dataSourceChanges = { added: [], removed: [] };
    this.trendAnalysis = null;
  }
}

// ============================================
// 工具函数
// ============================================

/**
 * 生成事件唯一ID
 */
function generateEventId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .slice(0, 5)
    .join('_')
    .substring(0, 50);
}

/**
 * 获取指定日期的字符串格式 (YYYY-MM-DD)
 */
function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * 获取昨天的日期字符串
 */
function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(yesterday);
}

/**
 * 获取N天前的日期字符串
 */
function getNDaysAgoString(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return getDateString(date);
}

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================
// 快照管理
// ============================================

/**
 * 保存日报快照
 */
function saveSnapshot(snapshot) {
  ensureDir(CONFIG.SNAPSHOT_DIR);
  
  const filename = `${snapshot.date}_${snapshot.topic}.json`;
  const filepath = path.join(CONFIG.SNAPSHOT_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf8');
  return filepath;
}

/**
 * 加载指定日期和主题的快照
 */
function loadSnapshot(date, topic) {
  const filename = `${date}_${topic}.json`;
  const filepath = path.join(CONFIG.SNAPSHOT_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    return null;
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
}

/**
 * 获取指定主题的所有历史快照
 */
function getSnapshotsByTopic(topic, days = 30) {
  const snapshots = [];
  const endDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateStr = getDateString(date);
    
    const snapshot = loadSnapshot(dateStr, topic);
    if (snapshot) {
      snapshots.push(snapshot);
    }
  }
  
  return snapshots.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 清理过期快照
 */
function cleanupOldSnapshots(retentionDays = CONFIG.DEFAULT_RETENTION_DAYS) {
  if (!fs.existsSync(CONFIG.SNAPSHOT_DIR)) {
    return 0;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoffStr = getDateString(cutoffDate);
  
  let deletedCount = 0;
  const files = fs.readdirSync(CONFIG.SNAPSHOT_DIR);
  
  files.forEach(file => {
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})_/);
    if (dateMatch && dateMatch[1] < cutoffStr) {
      fs.unlinkSync(path.join(CONFIG.SNAPSHOT_DIR, file));
      deletedCount++;
    }
  });
  
  return deletedCount;
}

// ============================================
// 对比核心逻辑
// ============================================

/**
 * 对比两个快照
 */
function compareSnapshots(yesterdaySnapshot, todaySnapshot) {
  const result = new ComparisonResult();
  result.yesterdayDate = yesterdaySnapshot.date;
  result.topic = todaySnapshot.topic;
  
  // 1. 事件数量变化
  result.changes.totalEvents = {
    yesterday: yesterdaySnapshot.summary.totalEvents,
    today: todaySnapshot.summary.totalEvents,
    diff: todaySnapshot.summary.totalEvents - yesterdaySnapshot.summary.totalEvents
  };
  
  result.changes.p0Count = {
    yesterday: yesterdaySnapshot.summary.p0Count,
    today: todaySnapshot.summary.p0Count,
    diff: todaySnapshot.summary.p0Count - yesterdaySnapshot.summary.p0Count
  };
  
  result.changes.p1Count = {
    yesterday: yesterdaySnapshot.summary.p1Count,
    today: todaySnapshot.summary.p1Count,
    diff: todaySnapshot.summary.p1Count - yesterdaySnapshot.summary.p1Count
  };
  
  result.changes.p2Count = {
    yesterday: yesterdaySnapshot.summary.p2Count,
    today: todaySnapshot.summary.p2Count,
    diff: todaySnapshot.summary.p2Count - yesterdaySnapshot.summary.p2Count
  };
  
  // 2. 新增/消失事件
  const yesterdayEventIds = new Set(yesterdaySnapshot.events.map(e => e.id));
  const todayEventIds = new Set(todaySnapshot.events.map(e => e.id));
  
  result.newEvents = todaySnapshot.events.filter(e => !yesterdayEventIds.has(e.id));
  result.removedEvents = yesterdaySnapshot.events.filter(e => !todayEventIds.has(e.id));
  
  // 3. 关键指标变化
  const allMetricKeys = new Set([
    ...Object.keys(yesterdaySnapshot.summary.keyMetrics),
    ...Object.keys(todaySnapshot.summary.keyMetrics)
  ]);
  
  allMetricKeys.forEach(key => {
    const yesterday = yesterdaySnapshot.summary.keyMetrics[key];
    const today = todaySnapshot.summary.keyMetrics[key];
    
    if (yesterday !== today) {
      result.metricChanges.push({
        name: key,
        yesterday: yesterday || 'N/A',
        today: today || 'N/A',
        changed: yesterday !== today
      });
    }
  });
  
  // 4. 数据源变化
  const yesterdaySources = new Set(yesterdaySnapshot.summary.dataSources);
  const todaySources = new Set(todaySnapshot.summary.dataSources);
  
  result.dataSourceChanges.added = todaySnapshot.summary.dataSources.filter(s => !yesterdaySources.has(s));
  result.dataSourceChanges.removed = yesterdaySnapshot.summary.dataSources.filter(s => !todaySources.has(s));
  
  return result;
}

/**
 * 分析趋势（基于历史数据）
 */
function analyzeTrend(snapshots, days = 7) {
  if (snapshots.length < 2) {
    return '数据不足，无法分析趋势';
  }
  
  const recentSnapshots = snapshots.slice(-days);
  const totalEvents = recentSnapshots.map(s => s.summary.totalEvents);
  const p0Counts = recentSnapshots.map(s => s.summary.p0Count);
  
  // 计算平均值
  const avgTotal = totalEvents.reduce((a, b) => a + b, 0) / totalEvents.length;
  const avgP0 = p0Counts.reduce((a, b) => a + b, 0) / p0Counts.length;
  
  // 判断趋势
  const firstHalf = totalEvents.slice(0, Math.floor(totalEvents.length / 2));
  const secondHalf = totalEvents.slice(Math.floor(totalEvents.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trendDesc = '';
  if (secondAvg > firstAvg * 1.1) {
    trendDesc = `📈 情报数量呈上升趋势（近${days}日平均 ${avgTotal.toFixed(1)} 条/日）`;
  } else if (secondAvg < firstAvg * 0.9) {
    trendDesc = `📉 情报数量呈下降趋势（近${days}日平均 ${avgTotal.toFixed(1)} 条/日）`;
  } else {
    trendDesc = `➡️ 情报数量保持稳定（近${days}日平均 ${avgTotal.toFixed(1)} 条/日）`;
  }
  
  // P0事件趋势
  if (avgP0 > 1) {
    trendDesc += `，P0级事件平均 ${avgP0.toFixed(1)} 条/日`;
  }
  
  return trendDesc;
}

// ============================================
// 报告生成
// ============================================

/**
 * 生成对比报告（Markdown格式）
 */
function generateComparisonReport(comparisonResult, trendAnalysis = null) {
  const r = comparisonResult;
  const changes = r.changes;
  
  let report = `【与昨日对比】\n\n`;
  
  // 整体变化
  report += `📊 整体变化\n`;
  const totalDiff = changes.totalEvents.diff;
  const totalDiffStr = totalDiff > 0 ? `(+${totalDiff})` : totalDiff < 0 ? `(${totalDiff})` : '(持平)';
  report += `- 情报总数：昨日 ${changes.totalEvents.yesterday} 条 → 今日 ${changes.totalEvents.today} 条 ${totalDiffStr}\n`;
  
  const p0Diff = changes.p0Count.diff;
  const p0DiffStr = p0Diff > 0 ? `(+${p0Diff} 🔴)` : p0Diff < 0 ? `(${p0Diff} 🟢)` : '(持平)';
  report += `- P0级事件：昨日 ${changes.p0Count.yesterday} 条 → 今日 ${changes.p0Count.today} 条 ${p0DiffStr}\n`;
  
  if (changes.p1Count.yesterday > 0 || changes.p1Count.today > 0) {
    const p1Diff = changes.p1Count.diff;
    const p1DiffStr = p1Diff > 0 ? `(+${p1Diff})` : p1Diff < 0 ? `(${p1Diff})` : '(持平)';
    report += `- P1级事件：昨日 ${changes.p1Count.yesterday} 条 → 今日 ${changes.p1Count.today} 条 ${p1DiffStr}\n`;
  }
  
  report += `\n`;
  
  // 新增重要事件
  if (r.newEvents.length > 0) {
    report += `🔴 新增重要事件\n`;
    r.newEvents.slice(0, 5).forEach((event, index) => {
      const priorityEmoji = event.priority === 'P0' ? '🔴' : event.priority === 'P1' ? '🟡' : '🟢';
      report += `${index + 1}. ${priorityEmoji} ${event.title}\n`;
    });
    if (r.newEvents.length > 5) {
      report += `... 还有 ${r.newEvents.length - 5} 条新增事件\n`;
    }
    report += `\n`;
  } else {
    report += `🔴 新增重要事件\n无新增事件\n\n`;
  }
  
  // 已解决/消失
  if (r.removedEvents.length > 0) {
    report += `🟢 已解决/消失\n`;
    r.removedEvents.slice(0, 5).forEach((event, index) => {
      report += `${index + 1}. ${event.title}\n`;
    });
    if (r.removedEvents.length > 5) {
      report += `... 还有 ${r.removedEvents.length - 5} 条已消失事件\n`;
    }
    report += `\n`;
  } else {
    report += `🟢 已解决/消失\n无消失事件\n\n`;
  }
  
  // 关键指标变化
  if (r.metricChanges.length > 0) {
    report += `📈 关键指标变化\n`;
    r.metricChanges.forEach(metric => {
      report += `- ${metric.name}：昨日 ${metric.yesterday} → 今日 ${metric.today}\n`;
    });
    report += `\n`;
  }
  
  // 数据源变化
  if (r.dataSourceChanges.added.length > 0 || r.dataSourceChanges.removed.length > 0) {
    report += `📡 数据源变化\n`;
    if (r.dataSourceChanges.added.length > 0) {
      report += `- 新增来源：${r.dataSourceChanges.added.join(', ')}\n`;
    }
    if (r.dataSourceChanges.removed.length > 0) {
      report += `- 移除来源：${r.dataSourceChanges.removed.join(', ')}\n`;
    }
    report += `\n`;
  }
  
  // 7日趋势
  if (trendAnalysis) {
    report += `📊 7日趋势\n${trendAnalysis}\n`;
  }
  
  return report;
}

/**
 * 生成简化的对比摘要（用于嵌入）
 */
function generateBriefSummary(comparisonResult) {
  const r = comparisonResult;
  const changes = r.changes;
  
  const parts = [];
  
  // 总事件变化
  if (changes.totalEvents.diff !== 0) {
    const direction = changes.totalEvents.diff > 0 ? '↑' : '↓';
    parts.push(`情报${direction}${Math.abs(changes.totalEvents.diff)}条`);
  }
  
  // P0变化
  if (changes.p0Count.diff > 0) {
    parts.push(`新增${changes.p0Count.diff}条P0事件🔴`);
  } else if (changes.p0Count.diff < 0) {
    parts.push(`减少${Math.abs(changes.p0Count.diff)}条P0事件🟢`);
  }
  
  // 新增事件数量
  if (r.newEvents.length > 0) {
    parts.push(`${r.newEvents.length}条新事件`);
  }
  
  return parts.length > 0 ? parts.join('，') : '今日无显著变化';
}

// ============================================
// 主入口函数
// ============================================

/**
 * 执行日报对比（主函数）
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.topic - 日报主题（默认：default）
 * @param {string} options.todayReport - 今日日报内容（可选）
 * @param {string} options.todayDate - 今日日期（默认：今天）
 * @param {boolean} options.saveSnapshot - 是否保存今日快照（默认：true）
 * @param {boolean} options.includeTrend - 是否包含趋势分析（默认：true）
 * @returns {Object} 对比结果和报告
 */
function compareDailyReport(options = {}) {
  const topic = options.topic || 'default';
  const todayDate = options.todayDate || getDateString();
  const yesterdayDate = getYesterdayString();
  
  // 1. 加载或创建今日快照
  let todaySnapshot;
  if (options.todayReport) {
    todaySnapshot = DailySnapshot.parseFromReport(options.todayReport, topic, todayDate);
  } else {
    todaySnapshot = loadSnapshot(todayDate, topic);
    if (!todaySnapshot) {
      return {
        success: false,
        error: `未找到今日(${todayDate})的快照，请提供今日日报内容`
      };
    }
  }
  
  // 2. 保存今日快照
  if (options.saveSnapshot !== false) {
    saveSnapshot(todaySnapshot);
  }
  
  // 3. 加载昨日快照
  const yesterdaySnapshot = loadSnapshot(yesterdayDate, topic);
  if (!yesterdaySnapshot) {
    return {
      success: false,
      error: `未找到昨日(${yesterdayDate})的快照，无法进行对比`,
      todaySnapshot: todaySnapshot
    };
  }
  
  // 4. 执行对比
  const comparisonResult = compareSnapshots(yesterdaySnapshot, todaySnapshot);
  
  // 5. 趋势分析
  let trendAnalysis = null;
  if (options.includeTrend !== false) {
    const historicalSnapshots = getSnapshotsByTopic(topic, 7);
    trendAnalysis = analyzeTrend(historicalSnapshots, 7);
  }
  
  // 6. 生成报告
  const fullReport = generateComparisonReport(comparisonResult, trendAnalysis);
  const briefSummary = generateBriefSummary(comparisonResult);
  
  return {
    success: true,
    topic,
    todayDate,
    yesterdayDate,
    comparison: comparisonResult,
    trendAnalysis,
    reports: {
      full: fullReport,
      brief: briefSummary
    }
  };
}

/**
 * 从日报文件自动对比
 * 
 * @param {string} reportFilePath - 日报文件路径
 * @param {string} topic - 日报主题
 * @returns {Object} 对比结果
 */
function compareFromFile(reportFilePath, topic = 'default') {
  if (!fs.existsSync(reportFilePath)) {
    return {
      success: false,
      error: `文件不存在: ${reportFilePath}`
    };
  }
  
  const content = fs.readFileSync(reportFilePath, 'utf8');
  const dateMatch = path.basename(reportFilePath).match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : getDateString();
  
  return compareDailyReport({
    topic,
    todayReport: content,
    todayDate: date,
    saveSnapshot: true,
    includeTrend: true
  });
}

/**
 * 获取指定主题的7日/30日趋势数据
 * 
 * @param {string} topic - 日报主题
 * @param {number} days - 天数（默认7天）
 * @returns {Object} 趋势数据
 */
function getTrendData(topic = 'default', days = 7) {
  const snapshots = getSnapshotsByTopic(topic, days);
  
  if (snapshots.length === 0) {
    return {
      success: false,
      error: `未找到主题 "${topic}" 的历史数据`
    };
  }
  
  const dates = snapshots.map(s => s.date);
  const totalEvents = snapshots.map(s => s.summary.totalEvents);
  const p0Counts = snapshots.map(s => s.summary.p0Count);
  const p1Counts = snapshots.map(s => s.summary.p1Count);
  const p2Counts = snapshots.map(s => s.summary.p2Count);
  
  // 计算统计数据
  const avgTotal = totalEvents.reduce((a, b) => a + b, 0) / totalEvents.length;
  const maxTotal = Math.max(...totalEvents);
  const minTotal = Math.min(...totalEvents);
  
  const avgP0 = p0Counts.reduce((a, b) => a + b, 0) / p0Counts.length;
  const totalP0 = p0Counts.reduce((a, b) => a + b, 0);
  
  return {
    success: true,
    topic,
    days,
    data: {
      dates,
      totalEvents,
      p0Counts,
      p1Counts,
      p2Counts
    },
    statistics: {
      avgTotal: Math.round(avgTotal * 10) / 10,
      maxTotal,
      minTotal,
      avgP0: Math.round(avgP0 * 10) / 10,
      totalP0
    },
    trendDescription: analyzeTrend(snapshots, days)
  };
}

// ============================================
// CLI 支持
// ============================================

function printUsage() {
  console.log(`
用法: node history-comparator.js [命令] [选项]

命令:
  compare <文件路径> [主题]     对比指定日报文件与昨日数据
  trend [主题] [天数]            查看趋势数据（默认7天）
  snapshot <文件路径> [主题]     仅保存快照，不对比
  cleanup [保留天数]             清理过期快照（默认30天）
  init                           初始化示例数据

示例:
  node history-comparator.js compare ./reports/2026-02-25.md us-china
  node history-comparator.js trend us-china 30
  node history-comparator.js cleanup 7
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printUsage();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'compare': {
      const filePath = args[1];
      const topic = args[2] || 'default';
      
      if (!filePath) {
        console.error('错误: 请提供日报文件路径');
        printUsage();
        process.exit(1);
      }
      
      const result = compareFromFile(filePath, topic);
      
      if (result.success) {
        console.log(result.reports.full);
        console.log('\n--- 简要摘要 ---');
        console.log(result.reports.brief);
      } else {
        console.error('对比失败:', result.error);
        process.exit(1);
      }
      break;
    }
    
    case 'trend': {
      const topic = args[1] || 'default';
      const days = parseInt(args[2]) || 7;
      
      const result = getTrendData(topic, days);
      
      if (result.success) {
        console.log(`\n📊 ${topic} 主题 - ${days}日趋势分析\n`);
        console.log(result.trendDescription);
        console.log('\n统计数据:');
        console.log(`- 平均情报数: ${result.statistics.avgTotal} 条/日`);
        console.log(`- 最高情报数: ${result.statistics.maxTotal} 条`);
        console.log(`- 最低情报数: ${result.statistics.minTotal} 条`);
        console.log(`- P0事件总计: ${result.statistics.totalP0} 条`);
        console.log('\n历史数据:');
        result.data.dates.forEach((date, i) => {
          console.log(`  ${date}: ${result.data.totalEvents[i]}条 (P0:${result.data.p0Counts[i]})`);
        });
      } else {
        console.error('获取趋势失败:', result.error);
        process.exit(1);
      }
      break;
    }
    
    case 'snapshot': {
      const filePath = args[1];
      const topic = args[2] || 'default';
      
      if (!filePath) {
        console.error('错误: 请提供日报文件路径');
        printUsage();
        process.exit(1);
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const dateMatch = path.basename(filePath).match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : getDateString();
      
      const snapshot = DailySnapshot.parseFromReport(content, topic, date);
      const savedPath = saveSnapshot(snapshot);
      
      console.log(`✅ 快照已保存: ${savedPath}`);
      console.log(`   日期: ${snapshot.date}`);
      console.log(`   主题: ${snapshot.topic}`);
      console.log(`   事件数: ${snapshot.summary.totalEvents}`);
      break;
    }
    
    case 'cleanup': {
      const days = parseInt(args[1]) || CONFIG.DEFAULT_RETENTION_DAYS;
      const deleted = cleanupOldSnapshots(days);
      console.log(`✅ 已清理 ${deleted} 个过期快照（保留${days}天内数据）`);
      break;
    }
    
    case 'init': {
      // 创建示例快照数据
      ensureDir(CONFIG.SNAPSHOT_DIR);
      
      const topics = ['us-china', 'africa', 'default'];
      const today = new Date();
      
      topics.forEach(topic => {
        for (let i = 7; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = getDateString(date);
          
          const snapshot = new DailySnapshot({
            date: dateStr,
            topic,
            totalEvents: Math.floor(Math.random() * 20) + 10,
            p0Count: Math.floor(Math.random() * 3),
            p1Count: Math.floor(Math.random() * 5) + 2,
            p2Count: Math.floor(Math.random() * 10) + 5,
            dataSources: ['Source A', 'Source B', 'Source C'],
            keyMetrics: { '关税': '25%', '概率': '60%' },
            events: [
              { id: `event_${dateStr}_1`, title: `示例事件1 - ${dateStr}`, priority: 'P1' },
              { id: `event_${dateStr}_2`, title: `示例事件2 - ${dateStr}`, priority: 'P2' }
            ]
          });
          
          saveSnapshot(snapshot);
        }
      });
      
      console.log('✅ 示例数据已创建');
      console.log(`   位置: ${CONFIG.SNAPSHOT_DIR}`);
      break;
    }
    
    default:
      console.error(`未知命令: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// ============================================
// 模块导出
// ============================================
module.exports = {
  // 核心类
  DailySnapshot,
  ComparisonResult,
  
  // 主要功能
  compareDailyReport,
  compareFromFile,
  getTrendData,
  
  // 快照管理
  saveSnapshot,
  loadSnapshot,
  getSnapshotsByTopic,
  cleanupOldSnapshots,
  
  // 报告生成
  generateComparisonReport,
  generateBriefSummary,
  
  // 工具函数
  getDateString,
  getYesterdayString,
  getNDaysAgoString,
  
  // 配置
  CONFIG
};

// 如果直接运行此文件
if (require.main === module) {
  main();
}
