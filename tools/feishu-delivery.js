/**
 * 飞书统一投递模块
 * 用于解决所有定时任务投递配置不一致的问题
 * 
 * 功能特性：
 * - 统一封装飞书消息发送
 * - 支持文本、Markdown、卡片格式
 * - 内置失败重试机制（最多3次）
 * - 支持降级策略（失败时记录日志）
 * - 详细错误记录和统计
 */

const fs = require('fs');
const path = require('path');

class FeishuDelivery {
  constructor(options = {}) {
    // 配置初始化
    this.config = {
      // 从环境变量或配置文件读取默认用户ID
      defaultUserId: options.defaultUserId || process.env.FEISHU_DEFAULT_USER_ID || null,
      // 飞书机器人 webhook URL
      webhookUrl: options.webhookUrl || process.env.FEISHU_WEBHOOK_URL || null,
      // 飞书应用凭证（用于 OpenAPI 方式）
      appId: options.appId || process.env.FEISHU_APP_ID || null,
      appSecret: options.appSecret || process.env.FEISHU_APP_SECRET || null,
      // 重试配置
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000, // 毫秒
      // 日志配置
      logDir: options.logDir || path.join(process.cwd(), 'logs'),
      enableLog: options.enableLog !== false,
      // 超时配置
      timeout: options.timeout || 30000,
      ...options
    };

    // 统计信息
    this.stats = {
      totalAttempts: 0,
      successCount: 0,
      failCount: 0,
      retryCount: 0,
      lastError: null,
      errors: []
    };

    // 确保日志目录存在
    if (this.config.enableLog) {
      this._ensureLogDir();
    }
  }

  /**
   * 确保日志目录存在
   */
  _ensureLogDir() {
    try {
      if (!fs.existsSync(this.config.logDir)) {
        fs.mkdirSync(this.config.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('[FeishuDelivery] 创建日志目录失败:', err.message);
    }
  }

  /**
   * 获取日志文件路径
   */
  _getLogFile(type = 'delivery') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.config.logDir, `feishu-${type}-${date}.log`);
  }

  /**
   * 写入日志
   */
  _log(level, message, data = null) {
    if (!this.config.enableLog) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      const logFile = this._getLogFile('delivery');
      fs.appendFileSync(logFile, logLine);
    } catch (err) {
      console.error('[FeishuDelivery] 写入日志失败:', err.message);
    }

    // 同时输出到控制台
    if (level === 'ERROR') {
      console.error(`[FeishuDelivery] ${message}`, data || '');
    } else {
      console.log(`[FeishuDelivery] ${message}`, data || '');
    }
  }

  /**
   * 写入错误日志
   */
  _logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorEntry = {
      timestamp,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context
    };

    try {
      const errorFile = this._getLogFile('error');
      fs.appendFileSync(errorFile, JSON.stringify(errorEntry) + '\n');
    } catch (err) {
      console.error('[FeishuDelivery] 写入错误日志失败:', err.message);
    }

    // 更新统计
    this.stats.lastError = errorEntry;
    this.stats.errors.push(errorEntry);
    // 只保留最近100条错误
    if (this.stats.errors.length > 100) {
      this.stats.errors = this.stats.errors.slice(-100);
    }
  }

  /**
   * 发送 HTTP 请求（带重试机制）
   */
  async _sendWithRetry(url, payload, attempt = 1) {
    this.stats.totalAttempts++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
      }

      // 检查飞书业务错误码
      if (result.code !== 0 && result.code !== undefined) {
        throw new Error(`Feishu API Error ${result.code}: ${result.msg || result.message || 'Unknown error'}`);
      }

      this.stats.successCount++;
      this._log('INFO', `消息发送成功 (attempt ${attempt})`, { url: url.replace(/key=[^&]+/, 'key=***') });
      return { success: true, data: result };

    } catch (error) {
      this._log('WARN', `发送失败 (attempt ${attempt}): ${error.message}`);

      // 重试逻辑
      if (attempt < this.config.maxRetries) {
        this.stats.retryCount++;
        this._log('INFO', `将在 ${this.config.retryDelay}ms 后进行第 ${attempt + 1} 次重试...`);
        await this._sleep(this.config.retryDelay * attempt); // 指数退避
        return this._sendWithRetry(url, payload, attempt + 1);
      }

      // 重试耗尽，记录错误
      this.stats.failCount++;
      this._logError(error, { url: url.replace(/key=[^&]+/, 'key=***'), payload, attempt });
      
      // 降级策略：记录到本地文件
      this._fallbackLog(payload);
      
      return { success: false, error: error.message, attempts: attempt };
    }
  }

  /**
   * 降级策略：将消息记录到本地文件
   */
  _fallbackLog(payload) {
    try {
      const fallbackFile = path.join(this.config.logDir, 'feishu-fallback.log');
      const entry = {
        timestamp: new Date().toISOString(),
        payload
      };
      fs.appendFileSync(fallbackFile, JSON.stringify(entry) + '\n');
      this._log('INFO', '消息已记录到降级日志');
    } catch (err) {
      console.error('[FeishuDelivery] 降级日志记录失败:', err.message);
    }
  }

  /**
   * 延时函数
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取实际的用户ID
   */
  _getUserId(userId) {
    return userId || this.config.defaultUserId;
  }

  /**
   * 验证配置
   */
  _validateConfig(userId) {
    const targetUserId = this._getUserId(userId);
    
    if (!targetUserId) {
      throw new Error('未提供用户ID，且未配置默认用户ID');
    }

    if (!this.config.webhookUrl && !(this.config.appId && this.config.appSecret)) {
      throw new Error('未配置飞书 webhook URL 或应用凭证');
    }

    return { targetUserId };
  }

  /**
   * 发送文本消息
   * @param {string} userId - 用户ID（可选，默认使用配置中的用户ID）
   * @param {string} text - 文本内容
   * @param {object} options - 额外选项
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async sendText(userId, text, options = {}) {
    try {
      // 支持省略 userId 参数
      if (arguments.length === 2 && typeof text === 'object') {
        options = text;
        text = userId;
        userId = null;
      }

      const { targetUserId } = this._validateConfig(userId);

      if (!text || typeof text !== 'string') {
        throw new Error('文本内容不能为空');
      }

      this._log('INFO', '准备发送文本消息', { userId: targetUserId, textLength: text.length });

      const payload = {
        msg_type: 'text',
        content: {
          text: text
        },
        ...options.extraPayload
      };

      // 如果指定了用户ID，添加到 payload
      if (targetUserId) {
        // 支持多种用户ID格式
        if (targetUserId.startsWith('ou_')) {
          payload.open_id = targetUserId;
        } else if (targetUserId.includes('@')) {
          payload.email = targetUserId;
        } else {
          payload.user_id = targetUserId;
        }
      }

      const result = await this._sendWithRetry(this.config.webhookUrl, payload);
      return result;

    } catch (error) {
      this._logError(error, { method: 'sendText', userId, text: text?.substring(0, 100) });
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送 Markdown 消息
   * @param {string} userId - 用户ID（可选）
   * @param {string} title - 消息标题
   * @param {string} content - Markdown 内容
   * @param {object} options - 额外选项
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async sendMarkdown(userId, title, content, options = {}) {
    try {
      // 支持省略 userId 参数
      if (arguments.length === 3 && typeof title === 'object') {
        options = title;
        content = title;
        title = userId;
        userId = null;
      }

      const { targetUserId } = this._validateConfig(userId);

      if (!content || typeof content !== 'string') {
        throw new Error('Markdown 内容不能为空');
      }

      this._log('INFO', '准备发送 Markdown 消息', { userId: targetUserId, title });

      const markdownContent = title ? `# ${title}\n\n${content}` : content;

      const payload = {
        msg_type: 'interactive',
        card: {
          config: {
            wide_screen_mode: true
          },
          header: title ? {
            title: {
              tag: 'plain_text',
              content: title
            },
            template: options.headerColor || 'blue'
          } : undefined,
          elements: [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: content
              }
            }
          ]
        },
        ...options.extraPayload
      };

      // 如果没有 header，删除 undefined 字段
      if (!payload.card.header) {
        delete payload.card.header;
      }

      if (targetUserId) {
        if (targetUserId.startsWith('ou_')) {
          payload.open_id = targetUserId;
        } else if (targetUserId.includes('@')) {
          payload.email = targetUserId;
        } else {
          payload.user_id = targetUserId;
        }
      }

      const result = await this._sendWithRetry(this.config.webhookUrl, payload);
      return result;

    } catch (error) {
      this._logError(error, { method: 'sendMarkdown', userId, title, content: content?.substring(0, 100) });
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送卡片消息
   * @param {string} userId - 用户ID（可选）
   * @param {object} cardData - 卡片数据
   * @param {object} options - 额外选项
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async sendCard(userId, cardData, options = {}) {
    try {
      // 支持省略 userId 参数
      if (arguments.length === 2 && typeof cardData === 'object') {
        options = cardData;
        cardData = userId;
        userId = null;
      }

      const { targetUserId } = this._validateConfig(userId);

      if (!cardData || typeof cardData !== 'object') {
        throw new Error('卡片数据必须是对象');
      }

      this._log('INFO', '准备发送卡片消息', { userId: targetUserId });

      const payload = {
        msg_type: 'interactive',
        card: cardData,
        ...options.extraPayload
      };

      if (targetUserId) {
        if (targetUserId.startsWith('ou_')) {
          payload.open_id = targetUserId;
        } else if (targetUserId.includes('@')) {
          payload.email = targetUserId;
        } else {
          payload.user_id = targetUserId;
        }
      }

      const result = await this._sendWithRetry(this.config.webhookUrl, payload);
      return result;

    } catch (error) {
      this._logError(error, { method: 'sendCard', userId, cardData });
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量发送消息
   * @param {string[]} userIds - 用户ID列表
   * @param {Function} sendFn - 发送函数 (sendText/sendMarkdown/sendCard)
   * @param {...any} args - 其他参数
   * @returns {Promise<Array>}
   */
  async batchSend(userIds, sendFn, ...args) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { success: false, error: '用户ID列表不能为空' };
    }

    this._log('INFO', `开始批量发送，目标用户数: ${userIds.length}`);

    const results = [];
    for (const userId of userIds) {
      const result = await sendFn.call(this, userId, ...args);
      results.push({ userId, ...result });
      // 批量发送间隔，避免频率限制
      await this._sleep(100);
    }

    const successCount = results.filter(r => r.success).length;
    this._log('INFO', `批量发送完成，成功: ${successCount}/${userIds.length}`);

    return { success: true, results, summary: { total: userIds.length, success: successCount, fail: userIds.length - successCount } };
  }

  /**
   * 获取投递统计信息
   * @returns {object}
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalAttempts > 0 
        ? ((this.stats.successCount / this.stats.totalAttempts) * 100).toFixed(2) + '%'
        : 'N/A',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 重置统计数据
   */
  resetStats() {
    this.stats = {
      totalAttempts: 0,
      successCount: 0,
      failCount: 0,
      retryCount: 0,
      lastError: null,
      errors: []
    };
    this._log('INFO', '统计数据已重置');
    return this.getStats();
  }

  /**
   * 获取最近错误
   * @param {number} limit - 返回错误数量
   * @returns {Array}
   */
  getRecentErrors(limit = 10) {
    return this.stats.errors.slice(-limit);
  }

  /**
   * 健康检查
   * @returns {object}
   */
  healthCheck() {
    const checks = {
      config: {
        hasDefaultUserId: !!this.config.defaultUserId,
        hasWebhookUrl: !!this.config.webhookUrl,
        hasAppCredentials: !!(this.config.appId && this.config.appSecret)
      },
      stats: this.getStats(),
      logDir: {
        path: this.config.logDir,
        exists: fs.existsSync(this.config.logDir),
        writable: true
      }
    };

    checks.healthy = checks.config.hasWebhookUrl && checks.logDir.exists;
    
    return checks;
  }
}

// 创建默认实例的工厂函数
function createDelivery(options = {}) {
  return new FeishuDelivery(options);
}

// 单例模式支持
let defaultInstance = null;

function getDefaultInstance(options = {}) {
  if (!defaultInstance) {
    defaultInstance = new FeishuDelivery(options);
  }
  return defaultInstance;
}

// 导出模块
module.exports = {
  FeishuDelivery,
  createDelivery,
  getDefaultInstance
};