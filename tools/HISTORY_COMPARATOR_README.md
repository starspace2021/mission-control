# 历史对比模块使用文档

## 概述

`history-comparator.js` 是一个用于日报历史对比的 Node.js 模块，帮助用户快速掌握每日变化情况。

## 功能特性

- 📊 **事件数量对比** - 对比今日与昨日的事件总数、优先级分布
- 🔴 **新增事件识别** - 自动识别今日新增的重要事件
- 🟢 **消失事件追踪** - 追踪已解决或消失的事件
- 📈 **关键指标变化** - 监控关税、概率、指数等关键指标变化
- 📡 **数据源变化** - 追踪新增/移除的数据来源
- 📊 **趋势分析** - 支持7日、30日趋势查询

## 安装

模块无需额外安装，直接复制到 `workspace/tools/` 目录即可使用。

```bash
# 确保目录存在
mkdir -p /root/.openclaw/workspace/memory/daily-snapshots

# 初始化示例数据（可选）
node tools/history-comparator.js init
```

## 使用方法

### 1. 命令行使用

```bash
# 对比指定日报文件与昨日数据
node tools/history-comparator.js compare <文件路径> [主题]

# 查看趋势数据
node tools/history-comparator.js trend [主题] [天数]

# 仅保存快照，不对比
node tools/history-comparator.js snapshot <文件路径> [主题]

# 清理过期快照
node tools/history-comparator.js cleanup [保留天数]

# 初始化示例数据
node tools/history-comparator.js init
```

### 2. 编程使用

```javascript
const {
  compareDailyReport,
  compareFromFile,
  getTrendData,
  saveSnapshot,
  DailySnapshot
} = require('./tools/history-comparator');

// 直接对比日报内容
const result = compareDailyReport({
  topic: 'us-china',
  todayReport: reportContent,
  todayDate: '2026-02-25',
  saveSnapshot: true,
  includeTrend: true
});

if (result.success) {
  console.log(result.reports.full);   // 完整对比报告
  console.log(result.reports.brief);  // 简要摘要
}

// 从文件对比
const result2 = compareFromFile('./reports/2026-02-25.md', 'us-china');

// 获取趋势数据
const trend = getTrendData('us-china', 7);  // 7日趋势
```

## 集成到日报生成流程

### 方案一：在日报开头添加对比模块

```javascript
async function generateDailyReportWithComparison(topic, date) {
  // 1. 生成日报内容
  const report = await generateReport(topic, date);
  
  // 2. 执行历史对比
  const comparison = compareDailyReport({
    topic,
    todayReport: report.content,
    todayDate: date,
    saveSnapshot: true,
    includeTrend: true
  });
  
  // 3. 组装最终报告
  let finalReport = report.content;
  
  if (comparison.success) {
    // 在报告开头添加对比模块
    finalReport = comparison.reports.full + '\n---\n\n' + report.content;
  }
  
  return finalReport;
}
```

### 方案二：在日报末尾添加对比模块

```javascript
if (comparison.success) {
  finalReport = report.content + '\n\n---\n\n' + comparison.reports.full;
}
```

### 方案三：仅添加简要摘要

```javascript
if (comparison.success) {
  const header = `> 📊 今日变化：${comparison.reports.brief}\n\n`;
  finalReport = header + report.content;
}
```

## 输出格式示例

```
【与昨日对比】

📊 整体变化
- 情报总数：昨日 27 条 → 今日 25 条 (-2)
- P0级事件：昨日 2 条 → 今日 2 条 (持平)
- P1级事件：昨日 6 条 → 今日 5 条 (-1)

🔴 新增重要事件
1. 🔴 美国宣布对中国新能源汽车加征25%关税
2. 🔴 中国商务部宣布反制措施

🟢 已解决/消失
1. 昨日临时关税措施已取消

📈 关键指标变化
- 关税税率：昨日 20% → 今日 25%
- 谈判成功概率：昨日 55% → 今日 45%

📡 数据源变化
- 新增来源：白宫官网
- 移除来源：临时数据源A

📊 7日趋势
📈 情报数量呈上升趋势（近7日平均 19.3 条/日），P0级事件平均 1.1 条/日
```

## 数据存储

### 快照文件结构

快照文件存储在 `memory/daily-snapshots/` 目录，命名格式：
```
YYYY-MM-DD_主题.json
```

例如：
```
2026-02-25_us-china.json
2026-02-25_africa.json
```

### 快照数据结构

```json
{
  "date": "2026-02-25",
  "topic": "us-china",
  "summary": {
    "totalEvents": 25,
    "p0Count": 2,
    "p1Count": 5,
    "p2Count": 18,
    "dataSources": ["白宫官网", "商务部", "华尔街日报"],
    "keyMetrics": {
      "关税": "25%",
      "概率": "45%"
    }
  },
  "events": [
    {
      "id": "event_unique_id",
      "title": "事件标题",
      "priority": "P0",
      "fullText": "完整事件描述"
    }
  ],
  "metadata": {
    "createdAt": "2026-02-25T08:00:00.000Z",
    "version": "1.0"
  }
}
```

## API 参考

### compareDailyReport(options)

执行日报对比的主函数。

**参数：**
- `options.topic` (string): 日报主题，默认 'default'
- `options.todayReport` (string): 今日日报内容
- `options.todayDate` (string): 今日日期，格式 YYYY-MM-DD
- `options.saveSnapshot` (boolean): 是否保存快照，默认 true
- `options.includeTrend` (boolean): 是否包含趋势分析，默认 true

**返回值：**
```javascript
{
  success: true,
  topic: 'us-china',
  todayDate: '2026-02-25',
  yesterdayDate: '2026-02-24',
  comparison: { /* 对比结果 */ },
  trendAnalysis: '趋势描述',
  reports: {
    full: '完整对比报告',
    brief: '简要摘要'
  }
}
```

### compareFromFile(filePath, topic)

从日报文件执行对比。

**参数：**
- `filePath` (string): 日报文件路径
- `topic` (string): 日报主题

### getTrendData(topic, days)

获取指定主题的趋势数据。

**参数：**
- `topic` (string): 日报主题
- `days` (number): 天数，默认 7

**返回值：**
```javascript
{
  success: true,
  topic: 'us-china',
  days: 7,
  data: {
    dates: ['2026-02-19', ...],
    totalEvents: [16, 22, ...],
    p0Counts: [1, 1, ...],
    p1Counts: [...],
    p2Counts: [...]
  },
  statistics: {
    avgTotal: 19.3,
    maxTotal: 27,
    minTotal: 11,
    avgP0: 1.1,
    totalP0: 8
  },
  trendDescription: '趋势描述文本'
}
```

### DailySnapshot.parseFromReport(content, topic, date)

从日报内容解析快照。

**参数：**
- `content` (string): 日报内容
- `topic` (string): 日报主题
- `date` (string): 日期

## 注意事项

1. **首次使用**：需要先创建至少两天的快照数据才能进行对比
2. **事件识别**：事件通过标题前5个词生成唯一ID，相同标题的事件会被视为同一事件
3. **指标提取**：自动提取包含"关税"、"概率"、"指数"、"价格"等关键词的数值
4. **数据清理**：建议定期运行 `cleanup` 命令清理过期快照

## 示例代码

参见 `tools/history-comparator-examples.js` 获取完整示例。

运行示例：
```bash
node tools/history-comparator-examples.js
```
