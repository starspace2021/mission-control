# 数据源健康监控系统 - 集成指南

## 模块文件路径

```
/root/.openclaw/workspace/tools/data-source-health.js
```

## 功能概述

数据源健康监控系统用于每日检查所有数据源的可用性，包括：
- **新闻源**: Google News、Bing News、Reuters RSS、BBC News RSS、CNBC RSS
- **智库**: CSIS、RAND、Brookings、Carnegie Endowment、Chatham House
- **API**: arXiv、Polymarket、NewsAPI

## 检查指标

1. **HTTP 状态码** - 检测 200/301/302/4xx/5xx 等状态
2. **响应时间** - 记录每个请求的耗时
3. **内容有效性** - 验证返回内容是否包含关键字段

## 使用方法

### 1. 直接运行

```bash
cd /root/.openclaw/workspace/tools
node data-source-health.js
```

### 2. 环境变量配置

```bash
# 启用飞书告警（可选）
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx"

# NewsAPI 密钥（可选）
export NEWSAPI_KEY="your-api-key"

# 运行检查
node data-source-health.js
```

### 3. CLI 选项

```bash
# 显示帮助
node data-source-health.js --help

# 输出 JSON 格式结果
node data-source-health.js --json

# 测试告警发送
node data-source-health.js --test-alert
```

## 输出报告

运行后会生成以下报告文件：

```
/root/.openclaw/workspace/logs/data-source-health/
├── health-report-YYYY-MM-DD.txt   # 文本格式报告
├── health-report-YYYY-MM-DD.md    # Markdown 格式报告
├── health-report-YYYY-MM-DD.json  # JSON 格式完整数据
├── latest.txt                      # 最新报告（文本）
└── latest.md                       # 最新报告（Markdown）
```

状态文件：
```
/root/.openclaw/workspace/logs/data-source-state.json
```

## 集成到定时任务

### 方式一：使用 Node.js 定时器（推荐）

在现有定时任务系统中添加：

```javascript
// 在定时任务入口文件中添加
const { runHealthCheck } = require('./tools/data-source-health');

// 每日 06:00 执行
const schedule = require('node-schedule');
schedule.scheduleJob('0 6 * * *', async () => {
  console.log('[定时任务] 开始数据源健康检查...');
  await runHealthCheck();
});
```

### 方式二：使用 Cron

编辑 crontab：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每日 06:00 执行）
0 6 * * * cd /root/.openclaw/workspace/tools && /usr/bin/node data-source-health.js >> /var/log/data-source-health.log 2>&1

# 或者使用环境变量
0 6 * * * export FEISHU_WEBHOOK="your-webhook-url" && cd /root/.openclaw/workspace/tools && /usr/bin/node data-source-health.js >> /var/log/data-source-health.log 2>&1
```

### 方式三：使用 systemd Timer

创建服务文件 `/etc/systemd/system/data-source-health.service`：

```ini
[Unit]
Description=Data Source Health Check
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/root/.openclaw/workspace/tools
Environment="FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx"
ExecStart=/usr/bin/node data-source-health.js
```

创建定时器文件 `/etc/systemd/system/data-source-health.timer`：

```ini
[Unit]
Description=Run Data Source Health Check daily at 06:00

[Timer]
OnCalendar=*-*-* 06:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

启用定时器：

```bash
sudo systemctl daemon-reload
sudo systemctl enable data-source-health.timer
sudo systemctl start data-source-health.timer

# 查看状态
sudo systemctl list-timers --all
```

## 告警机制

### 告警触发条件

1. **警告告警** - 首次检测到数据源异常
2. **严重告警** - 连续 3 次检查失败（可配置）
3. **恢复通知** - 数据源从异常状态恢复正常

### 飞书告警配置

1. 在飞书群中添加自定义机器人
2. 复制 Webhook URL
3. 设置环境变量 `FEISHU_WEBHOOK`

告警卡片示例：
```
🔔 数据源健康告警 - CRITICAL

数据源不可用: Google News
连续 3 次检查失败，当前状态: error, 错误: Request timeout

类别: news
时间: 2026-02-25 08:00:00
```

## 健康报告示例

### 文本格式

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    数据源健康检查报告                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 生成时间: 2026-02-25 08:00:00                                                ║
║ 总计: 13   | 正常: 10  | 警告: 1   | 异常: 2                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

📰 新闻源
────────────────────────────────────────────────────────────────────────────────
数据源名称                    | 状态 | 响应时间 | 最后检查时间
────────────────────────────────────────────────────────────────────────────────
Google News                 | ✓ 正常  | 523ms     | 2026-02-25 08:00:00
Bing News                   | ✓ 正常  | 312ms     | 2026-02-25 08:00:01
...
```

### Markdown 格式

```markdown
# 数据源健康检查报告

**生成时间:** 2026-02-25 08:00:00

## 摘要

| 指标 | 数量 |
|------|------|
| 总计 | 13 |
| ✅ 正常 | 10 |
| ⚠️ 警告 | 1 |
| ❌ 异常 | 2 |

## 📰 新闻源

| 数据源 | 状态 | HTTP状态码 | 响应时间 | 内容有效 | 最后检查 |
|--------|------|-----------|---------|---------|---------|
| Google News | ✅ ok | 200 | 523ms | ✅ | 2026-02-25 08:00:00 |
| ...
```

## 配置项

可在代码中修改 `CONFIG` 对象：

```javascript
const CONFIG = {
  // 报告输出路径
  reportPath: path.join(__dirname, '../logs/data-source-health'),
  // 状态持久化文件
  stateFile: path.join(__dirname, '../logs/data-source-state.json'),
  // 连续失败阈值（触发严重告警）
  failureThreshold: 3,
  // 请求超时时间(ms)
  timeout: 10000,
  // 飞书webhook
  feishuWebhook: process.env.FEISHU_WEBHOOK || null,
};
```

## 扩展数据源

在 `DATA_SOURCES` 对象中添加新数据源：

```javascript
const DATA_SOURCES = {
  news: [
    // 添加新的新闻源
    {
      name: 'New Source',
      url: 'https://example.com/news',
      type: 'http',
      checkContent: (body) => body.includes('keyword'),
    },
  ],
  // ...
};
```

## 模块接口

```javascript
const healthMonitor = require('./tools/data-source-health');

// 运行完整检查
const result = await healthMonitor.runHealthCheck();

// 检查单个数据源
const result = await healthMonitor.checkDataSource({
  name: 'Example',
  url: 'https://example.com',
  type: 'http',
  checkContent: (body) => body.includes('OK'),
});

// 检查所有数据源
const results = await healthMonitor.checkAllDataSources();

// 访问配置和数据源定义
console.log(healthMonitor.CONFIG);
console.log(healthMonitor.DATA_SOURCES);
```

## 故障排查

### 检查日志

```bash
# 查看最新报告
cat /root/.openclaw/workspace/logs/data-source-health/latest.txt

# 查看状态文件
cat /root/.openclaw/workspace/logs/data-source-state.json
```

### 测试单个数据源

```bash
# 使用 curl 测试
curl -I https://www.csis.org

# 测试响应时间
curl -o /dev/null -s -w '%{time_total}\n' https://www.rand.org
```

### 常见问题

1. **请求超时** - 增加 `CONFIG.timeout` 值
2. **内容验证失败** - 检查 `checkContent` 函数逻辑
3. **飞书告警未发送** - 确认 `FEISHU_WEBHOOK` 环境变量已设置
