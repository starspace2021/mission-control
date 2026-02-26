/**
 * 日报反馈收集模块
 * 
 * 参考设计: 简洁的交互卡片设计，类似 Notion 的轻量反馈组件
 * 数据追踪: 类似 Mixpanel 的事件追踪结构
 * 
 * 功能:
 * 1. 为飞书日报消息添加反馈按钮（有用/无用/缺内容）
 * 2. 支持快捷回复反馈
 * 3. 记录反馈数据到本地 JSON
 * 4. 月度反馈分析与报告生成
 * 5. 负面反馈告警与改进追踪
 */

const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================
const CONFIG = {
  // 反馈数据存储目录
  FEEDBACK_DIR: path.join(__dirname, '..', 'memory', 'feedback'),
  // 告警阈值配置
  ALERT_THRESHOLD: {
    // 负面反馈连续次数触发告警
    CONSECUTIVE_NEGATIVE: 3,
    // 单日负面反馈数量触发告警
    DAILY_NEGATIVE_COUNT: 5,
    // 高频问题提及次数
    ISSUE_MENTION_THRESHOLD: 3
  },
  // 反馈类型定义
  FEEDBACK_TYPES: {
    USEFUL: 'useful',           // 有用
    NOT_USEFUL: 'not_useful',   // 无用
    MISSING_CONTENT: 'missing', // 缺内容
    COMMENT: 'comment'          // 评论
  }
};

// ==================== 数据模型 ====================

/**
 * 反馈记录结构
 * @typedef {Object} FeedbackRecord
 * @property {string} id - 唯一标识
 * @property {string} taskName - 任务/日报名称
 * @property {string} reportDate - 日报日期 (YYYY-MM-DD)
 * @property {string} feedbackType - 反馈类型
 * @property {string} detail - 详细内容
 * @property {string} userId - 用户ID
 * @property {string} userName - 用户名
 * @property {number} timestamp - 时间戳 (ms)
 * @property {string} channel - 反馈渠道 (feishu/email/etc)
 * @property {string} [replyTo] - 回复的反馈ID
 * @property {boolean} [alertTriggered] - 是否触发告警
 * @property {string} [status] - 处理状态 (pending/resolved/ignored)
 */

/**
 * 反馈统计结构
 * @typedef {Object} FeedbackStats
 * @property {string} taskName - 任务名
 * @property {number} totalCount - 总反馈数
 * @property {number} usefulCount - 有用计数
 * @property {number} notUsefulCount - 无用计数
 * @property {number} missingCount - 缺内容计数
 * @property {number} satisfactionRate - 满意度 (%)
 * @property {string[]} topIssues - 高频问题
 */

// ==================== 核心类 ====================

class FeedbackCollector {
  constructor() {
    this.ensureDirectories();
  }

  /**
   * 确保必要的目录存在
   */
  ensureDirectories() {
    if (!fs.existsSync(CONFIG.FEEDBACK_DIR)) {
      fs.mkdirSync(CONFIG.FEEDBACK_DIR, { recursive: true });
    }
  }

  /**
   * 获取指定日期的反馈文件路径
   * @param {string} date - 日期 (YYYY-MM-DD)
   * @returns {string} 文件路径
   */
  getFeedbackFilePath(date) {
    return path.join(CONFIG.FEEDBACK_DIR, `${date}.json`);
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一标识
   */
  generateId() {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录一条反馈
   * @param {Object} params - 反馈参数
   * @param {string} params.taskName - 任务名
   * @param {string} params.reportDate - 日报日期
   * @param {string} params.feedbackType - 反馈类型
   * @param {string} [params.detail] - 详细内容
   * @param {string} [params.userId] - 用户ID
   * @param {string} [params.userName] - 用户名
   * @param {string} [params.channel='feishu'] - 渠道
   * @param {string} [params.replyTo] - 回复的反馈ID
   * @returns {FeedbackRecord} 记录的反馈
   */
  recordFeedback({
    taskName,
    reportDate,
    feedbackType,
    detail = '',
    userId = 'anonymous',
    userName = '匿名用户',
    channel = 'feishu',
    replyTo = null
  }) {
    const feedback = {
      id: this.generateId(),
      taskName,
      reportDate,
      feedbackType,
      detail,
      userId,
      userName,
      timestamp: Date.now(),
      channel,
      replyTo,
      status: 'pending'
    };

    // 检查是否需要触发告警
    if (feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL || 
        feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT) {
      feedback.alertTriggered = this.checkAlertTrigger(taskName, feedbackType);
    }

    // 保存到文件
    this.saveFeedback(feedback);

    // 如果触发告警，记录告警
    if (feedback.alertTriggered) {
      this.recordAlert(feedback);
    }

    return feedback;
  }

  /**
   * 保存反馈到文件
   * @param {FeedbackRecord} feedback - 反馈记录
   */
  saveFeedback(feedback) {
    const filePath = this.getFeedbackFilePath(feedback.reportDate);
    let feedbacks = [];

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        feedbacks = JSON.parse(content);
      } catch (e) {
        console.error(`读取反馈文件失败: ${filePath}`, e.message);
      }
    }

    feedbacks.push(feedback);
    fs.writeFileSync(filePath, JSON.stringify(feedbacks, null, 2), 'utf-8');
  }

  /**
   * 检查是否需要触发告警
   * @param {string} taskName - 任务名
   * @param {string} feedbackType - 反馈类型
   * @returns {boolean} 是否触发告警
   */
  checkAlertTrigger(taskName, feedbackType) {
    const today = new Date().toISOString().split('T')[0];
    const feedbacks = this.getFeedbacksByDate(today);
    
    // 统计今日该任务的负面反馈
    const todayNegative = feedbacks.filter(f => 
      f.taskName === taskName && 
      (f.feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL || 
       f.feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT)
    );

    // 检查是否达到单日阈值
    if (todayNegative.length >= CONFIG.ALERT_THRESHOLD.DAILY_NEGATIVE_COUNT) {
      return true;
    }

    // 检查连续负面反馈
    const recentFeedbacks = feedbacks
      .filter(f => f.taskName === taskName)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, CONFIG.ALERT_THRESHOLD.CONSECUTIVE_NEGATIVE);

    if (recentFeedbacks.length >= CONFIG.ALERT_THRESHOLD.CONSECUTIVE_NEGATIVE &&
        recentFeedbacks.every(f => 
          f.feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL || 
          f.feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT
        )) {
      return true;
    }

    return false;
  }

  /**
   * 记录告警
   * @param {FeedbackRecord} feedback - 触发告警的反馈
   */
  recordAlert(feedback) {
    const alertDir = path.join(CONFIG.FEEDBACK_DIR, 'alerts');
    if (!fs.existsSync(alertDir)) {
      fs.mkdirSync(alertDir, { recursive: true });
    }

    const alert = {
      id: `alert_${Date.now()}`,
      feedbackId: feedback.id,
      taskName: feedback.taskName,
      reportDate: feedback.reportDate,
      alertType: 'negative_feedback_spike',
      timestamp: Date.now(),
      status: 'active'
    };

    const alertFile = path.join(alertDir, `${feedback.reportDate}_alerts.json`);
    let alerts = [];

    if (fs.existsSync(alertFile)) {
      try {
        alerts = JSON.parse(fs.readFileSync(alertFile, 'utf-8'));
      } catch (e) {
        console.error(`读取告警文件失败: ${alertFile}`, e.message);
      }
    }

    alerts.push(alert);
    fs.writeFileSync(alertFile, JSON.stringify(alerts, null, 2), 'utf-8');

    console.log(`[ALERT] 任务 "${feedback.taskName}" 触发负面反馈告警`);
  }

  /**
   * 获取指定日期的所有反馈
   * @param {string} date - 日期 (YYYY-MM-DD)
   * @returns {FeedbackRecord[]} 反馈列表
   */
  getFeedbacksByDate(date) {
    const filePath = this.getFeedbackFilePath(date);
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`读取反馈文件失败: ${filePath}`, e.message);
      return [];
    }
  }

  /**
   * 获取日期范围内的反馈
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {FeedbackRecord[]} 反馈列表
   */
  getFeedbacksByDateRange(startDate, endDate) {
    const feedbacks = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dailyFeedbacks = this.getFeedbacksByDate(dateStr);
      feedbacks.push(...dailyFeedbacks);
    }

    return feedbacks;
  }

  /**
   * 获取任务的反馈统计
   * @param {string} taskName - 任务名
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {FeedbackStats} 统计结果
   */
  getTaskStats(taskName, startDate, endDate) {
    const feedbacks = this.getFeedbacksByDateRange(startDate, endDate)
      .filter(f => f.taskName === taskName);

    const usefulCount = feedbacks.filter(f => 
      f.feedbackType === CONFIG.FEEDBACK_TYPES.USEFUL
    ).length;

    const notUsefulCount = feedbacks.filter(f => 
      f.feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL
    ).length;

    const missingCount = feedbacks.filter(f => 
      f.feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT
    ).length;

    const totalCount = feedbacks.length;
    const satisfactionRate = totalCount > 0 
      ? Math.round((usefulCount / totalCount) * 100) 
      : 0;

    // 提取高频问题（简单词频统计）
    const issueKeywords = this.extractTopIssues(feedbacks);

    return {
      taskName,
      totalCount,
      usefulCount,
      notUsefulCount,
      missingCount,
      satisfactionRate,
      topIssues: issueKeywords
    };
  }

  /**
   * 提取高频问题关键词
   * @param {FeedbackRecord[]} feedbacks - 反馈列表
   * @returns {string[]} 高频问题
   */
  extractTopIssues(feedbacks) {
    const detailTexts = feedbacks
      .filter(f => f.detail && f.detail.length > 0)
      .map(f => f.detail.toLowerCase());

    if (detailTexts.length === 0) return [];

    // 简单的关键词提取（实际项目中可以使用更复杂的NLP）
    const wordFreq = {};
    const stopWords = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']);

    detailTexts.forEach(text => {
      // 提取2-6个字符的词组
      for (let len = 2; len <= 6; len++) {
        for (let i = 0; i <= text.length - len; i++) {
          const word = text.substr(i, len).trim();
          if (word.length >= 2 && !stopWords.has(word) && !/^\d+$/.test(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          }
        }
      }
    });

    // 返回频率最高的前5个
    return Object.entries(wordFreq)
      .filter(([_, count]) => count >= CONFIG.ALERT_THRESHOLD.ISSUE_MENTION_THRESHOLD)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => `${word}(${count}次)`);
  }

  /**
   * 更新反馈处理状态
   * @param {string} feedbackId - 反馈ID
   * @param {string} date - 日期
   * @param {string} status - 新状态
   * @param {string} [note] - 备注
   */
  updateFeedbackStatus(feedbackId, date, status, note = '') {
    const filePath = this.getFeedbackFilePath(date);
    if (!fs.existsSync(filePath)) return false;

    try {
      const feedbacks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const feedback = feedbacks.find(f => f.id === feedbackId);
      
      if (feedback) {
        feedback.status = status;
        if (note) feedback.resolutionNote = note;
        feedback.resolvedAt = Date.now();
        fs.writeFileSync(filePath, JSON.stringify(feedbacks, null, 2), 'utf-8');
        return true;
      }
    } catch (e) {
      console.error(`更新反馈状态失败: ${feedbackId}`, e.message);
    }

    return false;
  }
}

// ==================== 飞书交互卡片生成器 ====================

class FeishuFeedbackCard {
  /**
   * 生成日报反馈卡片
   * @param {string} taskName - 任务名
   * @param {string} reportDate - 日报日期
   * @returns {Object} 飞书卡片消息结构
   */
  static generateDailyReportCard(taskName, reportDate) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        template: 'blue',
        title: {
          content: `📊 ${taskName}`,
          tag: 'plain_text'
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**日期**: ${reportDate}\n**投递时间**: ${new Date().toLocaleString('zh-CN')}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'div',
          text: {
            content: '**这份日报对您有用吗？**',
            tag: 'lark_md'
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '✅ 有用',
                tag: 'plain_text'
              },
              type: 'primary',
              value: {
                action: 'feedback_useful',
                taskName,
                reportDate,
                feedbackType: CONFIG.FEEDBACK_TYPES.USEFUL
              }
            },
            {
              tag: 'button',
              text: {
                content: '❌ 无用',
                tag: 'plain_text'
              },
              type: 'default',
              value: {
                action: 'feedback_not_useful',
                taskName,
                reportDate,
                feedbackType: CONFIG.FEEDBACK_TYPES.NOT_USEFUL
              }
            },
            {
              tag: 'button',
              text: {
                content: '📝 缺内容',
                tag: 'plain_text'
              },
              type: 'default',
              value: {
                action: 'feedback_missing',
                taskName,
                reportDate,
                feedbackType: CONFIG.FEEDBACK_TYPES.MISSING_CONTENT
              }
            }
          ]
        },
        {
          tag: 'hr'
        },
        {
          tag: 'div',
          text: {
            content: '💡 **详细建议**（可选）：回复此消息说明具体意见',
            tag: 'lark_md'
          }
        }
      ]
    };
  }

  /**
   * 生成反馈确认卡片
   * @param {FeedbackRecord} feedback - 反馈记录
   * @returns {Object} 确认卡片
   */
  static generateConfirmationCard(feedback) {
    const typeLabels = {
      [CONFIG.FEEDBACK_TYPES.USEFUL]: '✅ 有用',
      [CONFIG.FEEDBACK_TYPES.NOT_USEFUL]: '❌ 无用',
      [CONFIG.FEEDBACK_TYPES.MISSING_CONTENT]: '📝 缺内容'
    };

    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        template: 'green',
        title: {
          content: '反馈已收到',
          tag: 'plain_text'
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**您的评价**: ${typeLabels[feedback.feedbackType] || feedback.feedbackType}\n**时间**: ${new Date(feedback.timestamp).toLocaleString('zh-CN')}`,
            tag: 'lark_md'
          }
        },
        {
          tag: 'div',
          text: {
            content: feedback.detail 
              ? `**详细建议**: ${feedback.detail}`
              : '💬 如需补充详细建议，请直接回复此消息',
            tag: 'lark_md'
          }
        }
      ]
    };
  }

  /**
   * 生成月度反馈报告卡片
   * @param {Object} report - 月度报告数据
   * @returns {Object} 报告卡片
   */
  static generateMonthlyReportCard(report) {
    const { month, totalTasks, overallStats, taskStats, topIssues } = report;

    const elements = [
      {
        tag: 'div',
        text: {
          content: `**统计周期**: ${month}\n**覆盖任务**: ${totalTasks} 个\n**总反馈数**: ${overallStats.totalCount} 条`,
          tag: 'lark_md'
        }
      },
      {
        tag: 'hr'
      },
      {
        tag: 'div',
        text: {
          content: `**整体满意度**: ${overallStats.satisfactionRate}%\n👍 有用: ${overallStats.usefulCount} | 👎 无用: ${overallStats.notUsefulCount} | 📝 缺内容: ${overallStats.missingCount}`,
          tag: 'lark_md'
        }
      }
    ];

    // 添加各任务统计
    if (taskStats.length > 0) {
      elements.push({ tag: 'hr' });
      elements.push({
        tag: 'div',
        text: {
          content: '**各任务满意度**',
          tag: 'lark_md'
        }
      });

      taskStats.forEach(stat => {
        elements.push({
          tag: 'div',
          text: {
            content: `• ${stat.taskName}: ${stat.satisfactionRate}% (${stat.totalCount}条反馈)`,
            tag: 'lark_md'
          }
        });
      });
    }

    // 添加高频问题
    if (topIssues.length > 0) {
      elements.push({ tag: 'hr' });
      elements.push({
        tag: 'div',
        text: {
          content: '**高频改进建议**',
          tag: 'lark_md'
        }
      });

      topIssues.forEach((issue, idx) => {
        elements.push({
          tag: 'div',
          text: {
            content: `${idx + 1}. ${issue}`,
            tag: 'lark_md'
          }
        });
      });
    }

    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        template: 'blue',
        title: {
          content: `📈 月度反馈报告 (${month})`,
          tag: 'plain_text'
        }
      },
      elements
    };
  }
}

// ==================== 月度分析报告生成器 ====================

class MonthlyFeedbackAnalyzer {
  constructor(collector) {
    this.collector = collector;
  }

  /**
   * 生成月度反馈报告
   * @param {string} yearMonth - 年月 (YYYY-MM)
   * @returns {Object} 月度报告
   */
  generateMonthlyReport(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = `${yearMonth}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // 获取当月所有反馈
    const allFeedbacks = this.collector.getFeedbacksByDateRange(startDate, endDate);

    if (allFeedbacks.length === 0) {
      return {
        month: yearMonth,
        totalTasks: 0,
        overallStats: {
          totalCount: 0,
          usefulCount: 0,
          notUsefulCount: 0,
          missingCount: 0,
          satisfactionRate: 0
        },
        taskStats: [],
        topIssues: [],
        dailyTrend: []
      };
    }

    // 统计整体数据
    const usefulCount = allFeedbacks.filter(f => 
      f.feedbackType === CONFIG.FEEDBACK_TYPES.USEFUL
    ).length;

    const notUsefulCount = allFeedbacks.filter(f => 
      f.feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL
    ).length;

    const missingCount = allFeedbacks.filter(f => 
      f.feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT
    ).length;

    const totalCount = allFeedbacks.length;
    const satisfactionRate = Math.round((usefulCount / totalCount) * 100);

    // 统计各任务数据
    const taskNames = [...new Set(allFeedbacks.map(f => f.taskName))];
    const taskStats = taskNames.map(taskName => 
      this.collector.getTaskStats(taskName, startDate, endDate)
    );

    // 提取高频问题
    const topIssues = this.collector.extractTopIssues(allFeedbacks);

    // 按天统计趋势
    const dailyTrend = this.calculateDailyTrend(allFeedbacks, startDate, endDate);

    return {
      month: yearMonth,
      totalTasks: taskNames.length,
      overallStats: {
        totalCount,
        usefulCount,
        notUsefulCount,
        missingCount,
        satisfactionRate
      },
      taskStats,
      topIssues,
      dailyTrend
    };
  }

  /**
   * 计算每日反馈趋势
   * @param {FeedbackRecord[]} feedbacks - 反馈列表
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Array} 每日趋势
   */
  calculateDailyTrend(feedbacks, startDate, endDate) {
    const dailyMap = {};
    
    // 初始化每天
    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { date: dateStr, count: 0, useful: 0, negative: 0 };
    }

    // 统计每天的数据
    feedbacks.forEach(f => {
      const dateStr = f.reportDate;
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].count++;
        if (f.feedbackType === CONFIG.FEEDBACK_TYPES.USEFUL) {
          dailyMap[dateStr].useful++;
        } else if (f.feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL ||
                   f.feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT) {
          dailyMap[dateStr].negative++;
        }
      }
    });

    return Object.values(dailyMap);
  }

  /**
   * 生成Markdown格式的报告
   * @param {Object} report - 报告数据
   * @returns {string} Markdown内容
   */
  generateMarkdownReport(report) {
    const { month, totalTasks, overallStats, taskStats, topIssues, dailyTrend } = report;

    let md = `# 月度反馈分析报告 - ${month}\n\n`;
    md += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    // 概览
    md += `## 📊 整体概况\n\n`;
    md += `- **统计周期**: ${month}\n`;
    md += `- **覆盖任务**: ${totalTasks} 个\n`;
    md += `- **总反馈数**: ${overallStats.totalCount} 条\n`;
    md += `- **整体满意度**: ${overallStats.satisfactionRate}%\n\n`;

    // 反馈分布
    md += `### 反馈分布\n\n`;
    md += `| 类型 | 数量 | 占比 |\n`;
    md += `|------|------|------|\n`;
    md += `| ✅ 有用 | ${overallStats.usefulCount} | ${overallStats.totalCount > 0 ? Math.round(overallStats.usefulCount/overallStats.totalCount*100) : 0}% |\n`;
    md += `| ❌ 无用 | ${overallStats.notUsefulCount} | ${overallStats.totalCount > 0 ? Math.round(overallStats.notUsefulCount/overallStats.totalCount*100) : 0}% |\n`;
    md += `| 📝 缺内容 | ${overallStats.missingCount} | ${overallStats.totalCount > 0 ? Math.round(overallStats.missingCount/overallStats.totalCount*100) : 0}% |\n\n`;

    // 各任务统计
    if (taskStats.length > 0) {
      md += `## 📈 各任务满意度\n\n`;
      md += `| 任务名称 | 总反馈 | 满意度 | 有用 | 无用 | 缺内容 |\n`;
      md += `|----------|--------|--------|------|------|--------|\n`;
      
      taskStats.forEach(stat => {
        md += `| ${stat.taskName} | ${stat.totalCount} | ${stat.satisfactionRate}% | ${stat.usefulCount} | ${stat.notUsefulCount} | ${stat.missingCount} |\n`;
      });
      md += `\n`;
    }

    // 高频问题
    if (topIssues.length > 0) {
      md += `## ⚠️ 高频改进建议\n\n`;
      topIssues.forEach((issue, idx) => {
        md += `${idx + 1}. ${issue}\n`;
      });
      md += `\n`;
    }

    // 每日趋势
    const activeDays = dailyTrend.filter(d => d.count > 0);
    if (activeDays.length > 0) {
      md += `## 📅 反馈趋势\n\n`;
      md += `活跃天数: ${activeDays.length} 天\n\n`;
      md += `| 日期 | 反馈数 | 有用 | 负面 |\n`;
      md += `|------|--------|------|------|\n`;
      
      activeDays.forEach(d => {
        md += `| ${d.date} | ${d.count} | ${d.useful} | ${d.negative} |\n`;
      });
      md += `\n`;
    }

    // 建议
    md += `## 💡 改进建议\n\n`;
    
    const lowSatisfactionTasks = taskStats.filter(s => s.satisfactionRate < 50);
    if (lowSatisfactionTasks.length > 0) {
      md += `### 需重点关注的任务\n\n`;
      lowSatisfactionTasks.forEach(task => {
        md += `- **${task.taskName}**: 满意度仅 ${task.satisfactionRate}%，建议深入分析原因\n`;
      });
      md += `\n`;
    }

    if (overallStats.satisfactionRate >= 80) {
      md += `- 整体满意度较高 (${overallStats.satisfactionRate}%)，保持当前质量水平\n`;
    } else if (overallStats.satisfactionRate >= 60) {
      md += `- 整体满意度中等 (${overallStats.satisfactionRate}%)，有提升空间\n`;
    } else {
      md += `- 整体满意度较低 (${overallStats.satisfactionRate}%)，需要重点关注和改进\n`;
    }

    md += `- 建议定期回顾用户反馈，持续优化内容质量\n`;
    md += `- 对于高频提及的问题，制定改进计划并跟踪效果\n`;

    return md;
  }

  /**
   * 保存月度报告到文件
   * @param {string} yearMonth - 年月
   * @param {Object} report - 报告数据
   */
  saveMonthlyReport(yearMonth, report) {
    const reportDir = path.join(CONFIG.FEEDBACK_DIR, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 保存JSON
    const jsonPath = path.join(reportDir, `${yearMonth}_report.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

    // 保存Markdown
    const mdContent = this.generateMarkdownReport(report);
    const mdPath = path.join(reportDir, `${yearMonth}_report.md`);
    fs.writeFileSync(mdPath, mdContent, 'utf-8');

    return { jsonPath, mdPath };
  }
}

// ==================== 反馈响应处理器 ====================

class FeedbackResponder {
  constructor(collector) {
    this.collector = collector;
  }

  /**
   * 处理飞书回调的反馈事件
   * @param {Object} event - 飞书事件数据
   * @returns {FeedbackRecord|null} 处理的反馈
   */
  handleFeishuCallback(event) {
    const { action, taskName, reportDate, feedbackType } = event.value || {};
    
    if (!action || !action.startsWith('feedback_')) {
      return null;
    }

    const userId = event.user_id || 'unknown';
    const userName = event.user_name || '未知用户';

    return this.collector.recordFeedback({
      taskName,
      reportDate,
      feedbackType,
      userId,
      userName,
      channel: 'feishu'
    });
  }

  /**
   * 处理用户回复的详细反馈
   * @param {Object} params - 参数
   * @param {string} params.replyToMessageId - 回复的消息ID
   * @param {string} params.content - 回复内容
   * @param {string} params.userId - 用户ID
   * @param {string} params.userName - 用户名
   * @returns {FeedbackRecord|null} 记录的反馈
   */
  handleDetailedFeedback({ replyToMessageId, content, userId, userName }) {
    // 这里需要根据消息ID查找原始日报信息
    // 实际实现中需要维护消息ID与日报的映射关系
    // 简化示例：假设从某处获取到原始任务信息
    
    // 解析回复内容判断反馈类型
    let feedbackType = CONFIG.FEEDBACK_TYPES.COMMENT;
    
    if (content.includes('没用') || content.includes('无用') || content.includes('不好')) {
      feedbackType = CONFIG.FEEDBACK_TYPES.NOT_USEFUL;
    } else if (content.includes('缺少') || content.includes('缺') || content.includes('没有')) {
      feedbackType = CONFIG.FEEDBACK_TYPES.MISSING_CONTENT;
    } else if (content.includes('有用') || content.includes('好') || content.includes('不错')) {
      feedbackType = CONFIG.FEEDBACK_TYPES.USEFUL;
    }

    // 这里需要实际的消息映射来获取taskName和reportDate
    // 简化处理，返回null表示需要外部提供上下文
    return null;
  }

  /**
   * 获取待处理的负面反馈
   * @param {string} [date] - 指定日期，默认今天
   * @returns {FeedbackRecord[]} 负面反馈列表
   */
  getPendingNegativeFeedback(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const feedbacks = this.collector.getFeedbacksByDate(targetDate);

    return feedbacks.filter(f => 
      (f.feedbackType === CONFIG.FEEDBACK_TYPES.NOT_USEFUL ||
       f.feedbackType === CONFIG.FEEDBACK_TYPES.MISSING_CONTENT) &&
      f.status === 'pending'
    );
  }

  /**
   * 标记反馈为已改进并通知用户
   * @param {string} feedbackId - 反馈ID
   * @param {string} date - 日期
   * @param {string} improvementNote - 改进说明
   * @returns {boolean} 是否成功
   */
  markAsImproved(feedbackId, date, improvementNote) {
    const success = this.collector.updateFeedbackStatus(
      feedbackId, 
      date, 
      'resolved', 
      improvementNote
    );

    if (success) {
      console.log(`[IMPROVED] 反馈 ${feedbackId} 已标记为已改进: ${improvementNote}`);
      // 实际实现中这里会发送通知给用户
    }

    return success;
  }
}

// ==================== 导出模块 ====================

module.exports = {
  // 配置常量
  CONFIG,
  FEEDBACK_TYPES: CONFIG.FEEDBACK_TYPES,
  
  // 核心类
  FeedbackCollector,
  FeishuFeedbackCard,
  MonthlyFeedbackAnalyzer,
  FeedbackResponder,
  
  // 便捷函数
  createCollector: () => new FeedbackCollector(),
  createAnalyzer: (collector) => new MonthlyFeedbackAnalyzer(collector),
  createResponder: (collector) => new FeedbackResponder(collector)
};

// ==================== CLI 支持 ====================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const collector = new FeedbackCollector();
  const analyzer = new MonthlyFeedbackAnalyzer(collector);

  switch (command) {
    case 'record': {
      // 示例: node feedback-collector.js record "Africa Intel" 2026-02-25 useful "内容很详细"
      const [, taskName, date, type, detail] = args;
      if (taskName && date && type) {
        const feedback = collector.recordFeedback({
          taskName,
          reportDate: date,
          feedbackType: type,
          detail: detail || ''
        });
        console.log('反馈已记录:', JSON.stringify(feedback, null, 2));
      } else {
        console.log('用法: node feedback-collector.js record <taskName> <date> <type> [detail]');
      }
      break;
    }

    case 'stats': {
      // 示例: node feedback-collector.js stats "Africa Intel" 2026-02-01 2026-02-25
      const [, taskName, startDate, endDate] = args;
      if (taskName && startDate && endDate) {
        const stats = collector.getTaskStats(taskName, startDate, endDate);
        console.log('任务统计:', JSON.stringify(stats, null, 2));
      } else {
        console.log('用法: node feedback-collector.js stats <taskName> <startDate> <endDate>');
      }
      break;
    }

    case 'monthly': {
      // 示例: node feedback-collector.js monthly 2026-02
      const [, yearMonth] = args;
      if (yearMonth) {
        const report = analyzer.generateMonthlyReport(yearMonth);
        const paths = analyzer.saveMonthlyReport(yearMonth, report);
        console.log('月度报告已生成:');
        console.log('  JSON:', paths.jsonPath);
        console.log('  Markdown:', paths.mdPath);
      } else {
        console.log('用法: node feedback-collector.js monthly <YYYY-MM>');
      }
      break;
    }

    case 'card': {
      // 示例: node feedback-collector.js card "Africa Intel" 2026-02-25
      const [, taskName, date] = args;
      if (taskName && date) {
        const card = FeishuFeedbackCard.generateDailyReportCard(taskName, date);
        console.log('飞书卡片结构:');
        console.log(JSON.stringify(card, null, 2));
      } else {
        console.log('用法: node feedback-collector.js card <taskName> <date>');
      }
      break;
    }

    default:
      console.log('反馈收集器 - 可用命令:');
      console.log('  record <taskName> <date> <type> [detail]  - 记录反馈');
      console.log('  stats <taskName> <startDate> <endDate>    - 查看任务统计');
      console.log('  monthly <YYYY-MM>                         - 生成月度报告');
      console.log('  card <taskName> <date>                    - 生成飞书卡片');
      console.log('');
      console.log('反馈类型:', Object.values(CONFIG.FEEDBACK_TYPES).join(', '));
  }
}
