# 日报反馈收集功能 - 集成指南

## 模块文件路径

```
/root/.openclaw/workspace/tools/feedback-collector.js
```

## 功能概述

反馈收集模块为日报系统提供完整的用户反馈闭环：

1. **飞书交互卡片** - 为日报消息添加「有用/无用/缺内容」按钮
2. **数据持久化** - 反馈数据保存到 `memory/feedback/YYYY-MM-DD.json`
3. **月度分析** - 自动生成满意度统计和改进建议报告
4. **告警机制** - 负面反馈达到阈值时自动告警

---

## 快速集成示例

### 1. 基础用法

```javascript
const { FeedbackCollector, FeishuFeedbackCard } = require('./tools/feedback-collector');

// 创建收集器实例
const collector = new FeedbackCollector();

// 生成带反馈按钮的飞书卡片
const card = FeishuFeedbackCard.generateDailyReportCard(
  'Africa Intel Daily',      // 任务名
  '2026-02-25'               // 日报日期
);

// 发送卡片到飞书（使用你的飞书发送函数）
sendFeishuCard(card);
```

### 2. 记录反馈

```javascript
// 当用户点击反馈按钮时
const feedback = collector.recordFeedback({
  taskName: 'Africa Intel Daily',
  reportDate: '2026-02-25',
  feedbackType: 'useful',  // useful | not_useful | missing | comment
  detail: '内容很详细',     // 详细建议（可选）
  userId: 'ou_xxx',        // 飞书用户ID
  userName: '张三',
  channel: 'feishu'
});

console.log('反馈已记录:', feedback.id);
```

### 3. 查看统计

```javascript
// 获取任务统计
const stats = collector.getTaskStats(
  'Africa Intel Daily',
  '2026-02-01',  // 开始日期
  '2026-02-25'   // 结束日期
);

console.log(`满意度: ${stats.satisfactionRate}%`);
console.log(`总反馈: ${stats.totalCount}`);
```

---

## 完整集成示例：Africa Intel 日报

假设你现有的日报投递代码如下：

```javascript
// africa_intel_delivery.js (现有代码)
async function deliverDailyReport(reportData) {
  const message = formatReport(reportData);
  await sendFeishuMessage(message);
}
```

集成反馈收集后的版本：

```javascript
// africa_intel_delivery_with_feedback.js
const { FeedbackCollector, FeishuFeedbackCard } = require('../tools/feedback-collector');

const collector = new FeedbackCollector();

async function deliverDailyReport(reportData) {
  const taskName = 'Africa Intel Daily';
  const reportDate = new Date().toISOString().split('T')[0];
  
  // 1. 生成带反馈按钮的卡片
  const card = FeishuFeedbackCard.generateDailyReportCard(taskName, reportDate);
  
  // 2. 将日报内容添加到卡片中
  card.elements.splice(2, 0, {
    tag: 'div',
    text: {
      content: formatReportForCard(reportData),
      tag: 'lark_md'
    }
  });
  
  // 3. 发送卡片
  const messageId = await sendFeishuCard(card);
  
  // 4. （可选）记录消息ID用于后续回复关联
  recordMessageMapping(messageId, taskName, reportDate);
  
  console.log(`[${taskName}] 日报已投递，等待用户反馈...`);
}

// 处理飞书回调
function handleFeishuCallback(event) {
  const responder = new (require('../tools/feedback-collector').FeedbackResponder)(collector);
  const feedback = responder.handleFeishuCallback(event);
  
  if (feedback) {
    // 发送确认消息
    const confirmCard = FeishuFeedbackCard.generateConfirmationCard(feedback);
    sendFeishuCard(confirmCard, { replyTo: event.message_id });
    
    // 如果触发告警，通知管理员
    if (feedback.alertTriggered) {
      notifyAdmin(`任务 "${feedback.taskName}" 触发负面反馈告警`);
    }
  }
}
```

---

## 月度分析报告

### 生成月度报告

```javascript
const { MonthlyFeedbackAnalyzer } = require('./tools/feedback-collector');

const analyzer = new MonthlyFeedbackAnalyzer(collector);

// 生成2026年2月的报告
const report = analyzer.generateMonthlyReport('2026-02');

// 保存报告到文件
const paths = analyzer.saveMonthlyReport('2026-02', report);
console.log('报告已保存:', paths.mdPath);
```

### 报告内容示例

```markdown
# 月度反馈分析报告 - 2026-02

> 生成时间: 2026/2/25 08:15:30

## 📊 整体概况

- **统计周期**: 2026-02
- **覆盖任务**: 5 个
- **总反馈数**: 127 条
- **整体满意度**: 78%

### 反馈分布

| 类型 | 数量 | 占比 |
|------|------|------|
| ✅ 有用 | 99 | 78% |
| ❌ 无用 | 18 | 14% |
| 📝 缺内容 | 10 | 8% |

## 📈 各任务满意度

| 任务名称 | 总反馈 | 满意度 | 有用 | 无用 | 缺内容 |
|----------|--------|--------|------|------|--------|
| Africa Intel Daily | 45 | 82% | 37 | 5 | 3 |
| US-China Policy | 38 | 71% | 27 | 8 | 3 |
| Polymarket Intel | 44 | 80% | 35 | 6 | 3 |

## ⚠️ 高频改进建议

1. 深度分析(8次)
2. 数据来源(6次)
3. 实时性(5次)
4. 图表展示(4次)
5. 政策原文(3次)

## 💡 改进建议

- 整体满意度较高 (78%)，保持当前质量水平
- 建议定期回顾用户反馈，持续优化内容质量
- 对于高频提及的问题，制定改进计划并跟踪效果
```

---

## CLI 命令参考

```bash
# 记录反馈
node tools/feedback-collector.js record "Africa Intel Daily" 2026-02-25 useful "内容很详细"

# 查看任务统计
node tools/feedback-collector.js stats "Africa Intel Daily" 2026-02-01 2026-02-25

# 生成月度报告
node tools/feedback-collector.js monthly 2026-02

# 生成飞书卡片结构
node tools/feedback-collector.js card "Africa Intel Daily" 2026-02-25
```

---

## 数据存储结构

### 单条反馈记录格式

```json
{
  "id": "fb_1771978427756_f2zlc10zx",
  "taskName": "Africa Intel Daily",
  "reportDate": "2026-02-25",
  "feedbackType": "useful",
  "detail": "内容详实，数据准确",
  "userId": "ou_xxx",
  "userName": "张三",
  "timestamp": 1771978427756,
  "channel": "feishu",
  "replyTo": null,
  "status": "pending",
  "alertTriggered": false
}
```

### 文件组织

```
memory/feedback/
├── 2026-02-25.json          # 每日反馈数据
├── 2026-02-24.json
├── alerts/
│   └── 2026-02-25_alerts.json  # 告警记录
└── reports/
    ├── 2026-02_report.json     # 月度报告(JSON)
    └── 2026-02_report.md       # 月度报告(Markdown)
```

---

## 告警配置

在代码中修改告警阈值：

```javascript
const CONFIG = {
  ALERT_THRESHOLD: {
    // 负面反馈连续次数触发告警
    CONSECUTIVE_NEGATIVE: 3,
    // 单日负面反馈数量触发告警
    DAILY_NEGATIVE_COUNT: 5,
    // 高频问题提及次数
    ISSUE_MENTION_THRESHOLD: 3
  }
};
```

---

## 注意事项

1. **飞书回调配置** - 需要在飞书开放平台配置回调URL，处理用户点击按钮的事件
2. **消息ID映射** - 如需支持回复消息关联，需要维护消息ID与日报的映射关系
3. **权限控制** - 反馈数据包含用户信息，注意访问权限控制
4. **定期清理** - 建议定期归档历史反馈数据，避免文件过大

---

## 扩展建议

1. **Web 仪表盘** - 可以基于反馈数据生成可视化仪表盘
2. **自动改进** - 结合高频问题，自动生成内容优化建议
3. **用户画像** - 分析不同用户的反馈偏好，个性化内容推送
4. **A/B 测试** - 对比不同内容格式的用户满意度
