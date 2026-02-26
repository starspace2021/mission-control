/**
 * 任务失败降级处理模块
 * Failover Handler Module
 * 
 * 功能：
 * 1. 监控任务执行时间，超过80%阈值时触发预警
 * 2. 任务超时失败时自动生成简化版报告
 * 3. 记录降级事件日志，统计降级频率
 * 4. 识别高频失败任务
 */

const fs = require('fs');
const path = require('path');

// 默认配置
const DEFAULT_OPTIONS = {
  // 超时时间（毫秒）
  timeout: 300000, // 默认5分钟
  // 预警阈值（0-1之间，表示超时时间的百分比）
  warningThreshold: 0.8,
  // 日志文件路径
  logPath: path.join(__dirname, '../logs/failover.log'),
  // 统计文件路径
  statsPath: path.join(__dirname, '../logs/failover-stats.json'),
  // 是否启用日志
  enableLogging: true,
  // 任务名称
  taskName: '未命名任务',
  // 简化版报告生成函数（可选，用于自定义报告格式）
  customReportGenerator: null,
  // 预警回调函数
  onWarning: null,
  // 失败回调函数
  onFailure: null,
};

/**
 * 确保日志目录存在
 */
function ensureLogDirectory(logPath) {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 写入日志
 */
function writeLog(message, logPath) {
  ensureLogDirectory(logPath);
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, logEntry, 'utf8');
}

/**
 * 读取统计数据
 */
function loadStats(statsPath) {
  if (!fs.existsSync(statsPath)) {
    return {
      totalExecutions: 0,
      totalFailures: 0,
      totalWarnings: 0,
      taskStats: {}, // 按任务统计
      recentFailures: [], // 最近失败记录
      lastUpdated: new Date().toISOString()
    };
  }
  try {
    return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  } catch (e) {
    return {
      totalExecutions: 0,
      totalFailures: 0,
      totalWarnings: 0,
      taskStats: {},
      recentFailures: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * 保存统计数据
 */
function saveStats(stats, statsPath) {
  ensureLogDirectory(statsPath);
  stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
}

/**
 * 更新任务统计
 */
function updateTaskStats(stats, taskName, isFailure, isWarning, error) {
  stats.totalExecutions++;
  
  if (!stats.taskStats[taskName]) {
    stats.taskStats[taskName] = {
      executions: 0,
      failures: 0,
      warnings: 0,
      lastFailure: null,
      lastWarning: null,
      failureReasons: []
    };
  }
  
  const taskStat = stats.taskStats[taskName];
  taskStat.executions++;
  
  if (isFailure) {
    stats.totalFailures++;
    taskStat.failures++;
    taskStat.lastFailure = new Date().toISOString();
    if (error) {
      taskStat.failureReasons.push({
        time: new Date().toISOString(),
        reason: error.message || String(error)
      });
      // 只保留最近10条失败原因
      if (taskStat.failureReasons.length > 10) {
        taskStat.failureReasons.shift();
      }
    }
    
    // 记录到最近失败列表
    stats.recentFailures.push({
      taskName,
      time: new Date().toISOString(),
      reason: error?.message || String(error)
    });
    // 只保留最近20条
    if (stats.recentFailures.length > 20) {
      stats.recentFailures.shift();
    }
  }
  
  if (isWarning) {
    stats.totalWarnings++;
    taskStat.warnings++;
    taskStat.lastWarning = new Date().toISOString();
  }
}

/**
 * 获取高频失败任务列表
 */
function getHighFrequencyFailureTasks(stats, threshold = 0.3) {
  const highFreqTasks = [];
  
  for (const [taskName, taskStat] of Object.entries(stats.taskStats)) {
    if (taskStat.executions >= 3) { // 至少执行3次才统计
      const failureRate = taskStat.failures / taskStat.executions;
      if (failureRate >= threshold) {
        highFreqTasks.push({
          taskName,
          failureRate: failureRate.toFixed(2),
          failures: taskStat.failures,
          executions: taskStat.executions,
          lastFailure: taskStat.lastFailure
        });
      }
    }
  }
  
  // 按失败率排序
  return highFreqTasks.sort((a, b) => parseFloat(b.failureRate) - parseFloat(a.failureRate));
}

/**
 * 生成简化版报告
 * @param {string} taskName - 任务名称
 * @param {object} partialData - 部分数据（包含关键告警、数据源等）
 * @param {Error} error - 错误对象
 * @returns {string} 简化版报告文本
 */
function generateFallbackReport(taskName, partialData = {}, error = null) {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN');
  
  // 提取关键告警（P0/P1级别）
  const criticalAlerts = partialData.criticalAlerts || partialData.alerts?.filter(
    alert => alert.level === 'P0' || alert.level === 'P1'
  ) || [];
  
  // 提取数据源
  const dataSources = partialData.dataSources || partialData.sources || ['未知数据源'];
  
  // 错误信息
  const errorMessage = error?.message || error || '未知错误';
  
  // 构建报告
  let report = `【${taskName}】简化版报告 - ${timeStr}\n\n`;
  report += `⚠️ 完整报告生成失败，以下为关键信息：\n\n`;
  
  // 关键告警部分
  report += `【关键告警】\n`;
  if (criticalAlerts.length > 0) {
    criticalAlerts.forEach(alert => {
      const level = alert.level || 'P1';
      const message = alert.message || alert.description || JSON.stringify(alert);
      report += `- [${level}] ${message}\n`;
    });
  } else {
    report += `- 暂无P0/P1级关键告警\n`;
  }
  report += `\n`;
  
  // 数据来源部分
  report += `【数据来源】\n`;
  report += `- 本次数据来自：${Array.isArray(dataSources) ? dataSources.join('、') : dataSources}\n\n`;
  
  // 失败原因部分
  report += `【失败原因】\n`;
  report += `- ${errorMessage}\n\n`;
  
  // 建议部分
  report += `【建议】\n`;
  report += `- 稍后查看完整报告，或联系管理员\n`;
  
  return report;
}

/**
 * 带降级的任务执行
 * @param {Function} taskFn - 任务函数（返回Promise）
 * @param {object} options - 配置选项
 * @returns {Promise<{success: boolean, result: any, isFallback: boolean, report?: string}>}
 */
async function executeWithFailover(taskFn, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { 
    timeout, 
    warningThreshold, 
    logPath, 
    statsPath, 
    enableLogging, 
    taskName,
    customReportGenerator,
    onWarning,
    onFailure
  } = opts;
  
  // 加载统计数据
  const stats = loadStats(statsPath);
  
  const warningTime = timeout * warningThreshold;
  let warningTriggered = false;
  let startTime = Date.now();
  
  // 创建预警定时器
  const warningTimer = setTimeout(() => {
    warningTriggered = true;
    const elapsed = Date.now() - startTime;
    const message = `⚠️ 任务"${taskName}"执行时间超过${(elapsed/1000).toFixed(1)}秒，接近超时阈值(${warningThreshold*100}%)`;
    
    if (enableLogging) {
      writeLog(`[WARNING] ${message}`, logPath);
    }
    
    if (onWarning) {
      onWarning({
        taskName,
        elapsed,
        threshold: warningThreshold,
        message
      });
    }
    
    // 更新统计
    updateTaskStats(stats, taskName, false, true, null);
    saveStats(stats, statsPath);
  }, warningTime);
  
  try {
    // 创建带超时的Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`任务执行超时（${timeout}ms）`));
      }, timeout);
    });
    
    // 执行任务
    const result = await Promise.race([taskFn(), timeoutPromise]);
    
    // 清除预警定时器
    clearTimeout(warningTimer);
    
    const elapsed = Date.now() - startTime;
    
    if (enableLogging) {
      writeLog(`[SUCCESS] 任务"${taskName}"执行成功，耗时${elapsed}ms`, logPath);
    }
    
    // 更新统计
    updateTaskStats(stats, taskName, false, warningTriggered, null);
    saveStats(stats, statsPath);
    
    return {
      success: true,
      result,
      isFallback: false,
      elapsed,
      warningTriggered
    };
    
  } catch (error) {
    // 清除预警定时器
    clearTimeout(warningTimer);
    
    const elapsed = Date.now() - startTime;
    
    if (enableLogging) {
      writeLog(`[FAILURE] 任务"${taskName}"执行失败：${error.message}，耗时${elapsed}ms`, logPath);
    }
    
    // 更新统计
    updateTaskStats(stats, taskName, true, warningTriggered, error);
    saveStats(stats, statsPath);
    
    // 调用失败回调
    if (onFailure) {
      onFailure({
        taskName,
        error,
        elapsed,
        warningTriggered
      });
    }
    
    // 尝试获取部分数据用于生成简化报告
    let partialData = {};
    try {
      // 如果任务函数有提供部分数据的方法，尝试获取
      if (typeof taskFn.getPartialData === 'function') {
        partialData = await taskFn.getPartialData();
      }
    } catch (e) {
      // 忽略部分数据获取失败
    }
    
    // 生成简化版报告
    const report = customReportGenerator 
      ? customReportGenerator(taskName, partialData, error)
      : generateFallbackReport(taskName, partialData, error);
    
    return {
      success: false,
      error,
      isFallback: true,
      report,
      elapsed,
      warningTriggered
    };
  }
}

/**
 * 获取降级统计信息
 * @param {string} statsPath - 统计文件路径
 * @returns {object} 统计信息
 */
function getFailoverStats(statsPath = DEFAULT_OPTIONS.statsPath) {
  const stats = loadStats(statsPath);
  const highFreqTasks = getHighFrequencyFailureTasks(stats);
  
  return {
    ...stats,
    highFrequencyFailureTasks: highFreqTasks,
    overallFailureRate: stats.totalExecutions > 0 
      ? (stats.totalFailures / stats.totalExecutions).toFixed(4) 
      : '0.0000',
    summary: {
      totalExecutions: stats.totalExecutions,
      totalFailures: stats.totalFailures,
      totalWarnings: stats.totalWarnings,
      failureRate: stats.totalExecutions > 0 
        ? ((stats.totalFailures / stats.totalExecutions) * 100).toFixed(2) + '%'
        : '0%',
      highRiskTasks: highFreqTasks.length
    }
  };
}

/**
 * 重置统计数据
 * @param {string} statsPath - 统计文件路径
 */
function resetFailoverStats(statsPath = DEFAULT_OPTIONS.statsPath) {
  const emptyStats = {
    totalExecutions: 0,
    totalFailures: 0,
    totalWarnings: 0,
    taskStats: {},
    recentFailures: [],
    lastUpdated: new Date().toISOString()
  };
  saveStats(emptyStats, statsPath);
  return emptyStats;
}

/**
 * 创建带降级保护的任务包装器
 * @param {Function} taskFn - 任务函数
 * @param {object} defaultOptions - 默认配置
 * @returns {Function} 包装后的任务函数
 */
function createFailoverTask(taskFn, defaultOptions = {}) {
  return async function(options = {}) {
    const mergedOptions = { ...defaultOptions, ...options };
    return executeWithFailover(taskFn, mergedOptions);
  };
}

module.exports = {
  // 核心功能
  executeWithFailover,
  generateFallbackReport,
  
  // 统计功能
  getFailoverStats,
  resetFailoverStats,
  
  // 工具函数
  createFailoverTask,
  
  // 配置常量
  DEFAULT_OPTIONS
};
