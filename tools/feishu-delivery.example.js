/**
 * 飞书投递模块使用示例
 * 
 * 本文件展示了如何使用 feishu-delivery.js 模块
 */

const { FeishuDelivery, createDelivery, getDefaultInstance } = require('./feishu-delivery');

// ============================================
// 1. 基础用法 - 使用环境变量配置
// ============================================

// 方式1: 创建新实例（推荐用于定时任务）
const delivery = createDelivery({
  // 从环境变量读取，也可直接配置
  defaultUserId: process.env.FEISHU_DEFAULT_USER_ID,
  webhookUrl: process.env.FEISHU_WEBHOOK_URL,
  // 可选配置
  maxRetries: 3,
  retryDelay: 1000,
  logDir: './logs',
  enableLog: true,
  timeout: 30000
});

// 方式2: 使用单例模式（推荐用于全局复用）
const singletonDelivery = getDefaultInstance({
  defaultUserId: 'user_xxx',
  webhookUrl: 'https://open.feishu.cn/open-apis/bot/v2/hook/xxx'
});

// ============================================
// 2. 发送文本消息
// ============================================

async function exampleSendText() {
  // 示例1: 使用默认用户ID发送
  const result1 = await delivery.sendText('这是一条测试消息');
  console.log('发送结果:', result1);

  // 示例2: 指定用户ID发送
  const result2 = await delivery.sendText('ou_xxx', '指定用户的消息');
  console.log('发送结果:', result2);

  // 示例3: 带额外选项
  const result3 = await delivery.sendText('消息内容', {
    extraPayload: {
      // 可以添加额外的 payload 字段
    }
  });
  console.log('发送结果:', result3);
}

// ============================================
// 3. 发送 Markdown 消息
// ============================================

async function exampleSendMarkdown() {
  // 示例1: 带标题的 Markdown
  const result1 = await delivery.sendMarkdown(
    'ou_xxx',           // 用户ID
    '📊 日报通知',       // 标题
    '## 今日统计\n\n- 任务完成: 10\n- 待处理: 3\n- 延期: 1',  // Markdown内容
    { headerColor: 'green' }  // 标题颜色: blue/green/orange/red
  );
  console.log('发送结果:', result1);

  // 示例2: 不带标题的 Markdown
  const result2 = await delivery.sendMarkdown(
    null,  // 使用默认用户ID
    null,  // 无标题
    '**加粗文本**\n\n- 列表项1\n- 列表项2'
  );
  console.log('发送结果:', result2);
}

// ============================================
// 4. 发送卡片消息
// ============================================

async function exampleSendCard() {
  // 构建卡片数据
  const cardData = {
    config: {
      wide_screen_mode: true
    },
    header: {
      title: {
        tag: 'plain_text',
        content: '📋 任务提醒'
      },
      template: 'blue'
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '您有一个待办任务需要处理'
        }
      },
      {
        tag: 'hr'  // 分割线
      },
      {
        tag: 'div',
        fields: [
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: '**任务名称:**\n代码评审'
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: '**截止时间:**\n今天 18:00'
            }
          }
        ]
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '查看详情'
            },
            type: 'primary',
            url: 'https://example.com/task/123'
          }
        ]
      }
    ]
  };

  const result = await delivery.sendCard('ou_xxx', cardData);
  console.log('卡片发送结果:', result);
}

// ============================================
// 5. 批量发送
// ============================================

async function exampleBatchSend() {
  const userIds = ['ou_user1', 'ou_user2', 'ou_user3'];
  
  // 批量发送文本
  const batchResult = await delivery.batchSend(
    userIds,
    delivery.sendText,
    '这是一条群发的通知消息'
  );
  
  console.log('批量发送结果:', batchResult);
  // 输出: { success: true, results: [...], summary: { total: 3, success: 3, fail: 0 } }
}

// ============================================
// 6. 统计和监控
// ============================================

async function exampleStats() {
  // 获取投递统计
  const stats = delivery.getStats();
  console.log('投递统计:', stats);
  // 输出示例:
  // {
  //   totalAttempts: 10,
  //   successCount: 9,
  //   failCount: 1,
  //   retryCount: 2,
  //   lastError: {...},
  //   errors: [...],
  //   successRate: '90.00%',
  //   timestamp: '2024-01-15T08:30:00.000Z'
  // }

  // 获取最近错误
  const recentErrors = delivery.getRecentErrors(5);
  console.log('最近错误:', recentErrors);

  // 健康检查
  const health = delivery.healthCheck();
  console.log('健康状态:', health);

  // 重置统计
  delivery.resetStats();
}

// ============================================
// 7. 定时任务集成示例
// ============================================

/**
 * 定时任务中使用示例
 * 
 * 在定时任务脚本中:
 * 
 * ```javascript
 * // daily-report.js
 * const { createDelivery } = require('../tools/feishu-delivery');
 * 
 * const delivery = createDelivery({
 *   defaultUserId: process.env.FEISHU_DEFAULT_USER_ID,
 *   webhookUrl: process.env.FEISHU_WEBHOOK_URL,
 *   logDir: './logs/daily-report'
 * });
 * 
 * async function sendDailyReport() {
 *   const report = generateReport(); // 你的报告生成逻辑
 *   
 *   const result = await delivery.sendMarkdown(
 *     '📊 每日数据报告',
 *     report,
 *     { headerColor: 'blue' }
 *   );
 *   
 *   if (!result.success) {
 *     console.error('报告发送失败:', result.error);
 *     // 可以在这里添加额外的告警逻辑
 *   }
 *   
 *   // 打印统计信息
 *   console.log('投递统计:', delivery.getStats());
 * }
 * 
 * sendDailyReport().catch(console.error);
 * ```
 */

// ============================================
// 8. 错误处理和降级
// ============================================

async function exampleErrorHandling() {
  // 发送失败时会自动重试3次
  // 如果全部失败，会:
  // 1. 记录错误日志到 logs/feishu-error-YYYY-MM-DD.log
  // 2. 将消息内容记录到降级日志 logs/feishu-fallback.log
  // 3. 返回失败的响应

  const result = await delivery.sendText('测试消息');
  
  if (!result.success) {
    console.error('发送失败，已记录到降级日志');
    console.error('错误信息:', result.error);
    console.error('尝试次数:', result.attempts);
    
    // 可以在这里添加额外的告警通知（如邮件、短信等）
  }
}

// ============================================
// 运行示例
// ============================================

async function runExamples() {
  console.log('=== 飞书投递模块使用示例 ===\n');
  
  // 健康检查
  console.log('1. 健康检查:');
  console.log(delivery.healthCheck());
  console.log();
  
  // 注意: 以下示例需要配置真实的 webhook URL 才能实际发送
  // 取消注释以运行实际测试
  
  // await exampleSendText();
  // await exampleSendMarkdown();
  // await exampleSendCard();
  // await exampleBatchSend();
  
  console.log('2. 统计信息:');
  console.log(delivery.getStats());
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  delivery,
  exampleSendText,
  exampleSendMarkdown,
  exampleSendCard,
  exampleBatchSend,
  exampleStats
};