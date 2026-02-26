/**
 * 数据源健康监控系统
 * Data Source Health Monitor
 * 
 * 功能：
 * 1. 每日检查所有数据源可用性
 * 2. 监控HTTP状态码、响应时间、内容有效性
 * 3. 生成健康报告
 * 4. 异常时发送飞书告警
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================

const CONFIG = {
  // 报告输出路径
  reportPath: path.join(__dirname, '../logs/data-source-health'),
  // 状态持久化文件
  stateFile: path.join(__dirname, '../logs/data-source-state.json'),
  // 连续失败阈值
  failureThreshold: 3,
  // 请求超时时间(ms)
  timeout: 10000,
  // 飞书webhook（可选，从环境变量读取）
  feishuWebhook: process.env.FEISHU_WEBHOOK || null,
};

// ==================== 数据源定义 ====================

const DATA_SOURCES = {
  // 新闻源
  news: [
    {
      name: 'Google News',
      url: 'https://news.google.com',
      type: 'http',
      checkContent: (body) => body.includes('Google') || body.includes('news'),
    },
    {
      name: 'Bing News',
      url: 'https://www.bing.com/news',
      type: 'http',
      checkContent: (body) => body.includes('Bing') || body.includes('news'),
    },
    {
      name: 'Reuters RSS',
      url: 'https://www.reutersagency.com/feed/?taxonomy=markets&post_type=reuters-best',
      type: 'rss',
      checkContent: (body) => body.includes('<rss') || body.includes('<feed') || body.includes('<item'),
    },
    {
      name: 'BBC News RSS',
      url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
      type: 'rss',
      checkContent: (body) => body.includes('<rss') || body.includes('<item'),
    },
    {
      name: 'CNBC RSS',
      url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      type: 'rss',
      checkContent: (body) => body.includes('<rss') || body.includes('<item'),
    },
  ],
  // 智库
  thinkTanks: [
    {
      name: 'CSIS',
      url: 'https://www.csis.org',
      type: 'http',
      checkContent: (body) => body.includes('CSIS') || body.includes('Center for Strategic'),
    },
    {
      name: 'RAND Corporation',
      url: 'https://www.rand.org',
      type: 'http',
      checkContent: (body) => body.includes('RAND') || body.includes('Research ANd Development'),
    },
    {
      name: 'Brookings Institution',
      url: 'https://www.brookings.edu',
      type: 'http',
      checkContent: (body) => body.includes('Brookings') || body.includes('Brookings Institution'),
    },
    {
      name: 'Carnegie Endowment',
      url: 'https://carnegieendowment.org',
      type: 'http',
      checkContent: (body) => body.includes('Carnegie') || body.includes('Endowment'),
    },
    {
      name: 'Chatham House',
      url: 'https://www.chathamhouse.org',
      type: 'http',
      checkContent: (body) => body.includes('Chatham House') || body.includes('Royal Institute'),
    },
  ],
  // API
  apis: [
    {
      name: 'arXiv API',
      url: 'http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=1',
      type: 'api',
      checkContent: (body) => body.includes('<feed') || body.includes('<entry') || body.includes('arxiv'),
    },
    {
      name: 'Polymarket API',
      url: 'https://api.polymarket.com/markets',
      type: 'api',
      checkContent: (body) => {
        try {
          const json = JSON.parse(body);
          return Array.isArray(json) || typeof json === 'object';
        } catch {
          return false;
        }
      },
    },
    {
      name: 'NewsAPI',
      url: 'https://newsapi.org/v2/top-headlines?country=us&pageSize=1',
      type: 'api',
      headers: { 'X-Api-Key': process.env.NEWSAPI_KEY || '' },
      checkContent: (body) => {
        try {
          const json = JSON.parse(body);
          return json.status === 'ok' || json.articles !== undefined;
        } catch {
          return body.includes('articles') || body.includes('status');
        }
      },
    },
  ],
};

// ==================== 工具函数 ====================

/**
 * 确保目录存在
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 加载状态文件
 */
function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
    }
  } catch (err) {
    console.error('加载状态文件失败:', err.message);
  }
  return {};
}

/**
 * 保存状态文件
 */
function saveState(state) {
  ensureDir(path.dirname(CONFIG.stateFile));
  fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

/**
 * 格式化日期时间
 */
function formatDateTime(date = new Date()) {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * 格式化日期（用于文件名）
 */
function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * HTTP/HTTPS 请求封装
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https:') ? https : http;
    
    const reqOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers,
      },
      timeout: CONFIG.timeout,
    };

    const req = client.get(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime,
        });
      });
    });

    req.on('error', (err) => {
      reject({ error: err.message, responseTime: Date.now() - startTime });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ error: 'Request timeout', responseTime: CONFIG.timeout });
    });

    req.setTimeout(CONFIG.timeout);
  });
}

// ==================== 健康检查核心 ====================

/**
 * 检查单个数据源
 */
async function checkDataSource(source) {
  const result = {
    name: source.name,
    url: source.url,
    type: source.type,
    status: 'unknown',
    statusCode: null,
    responseTime: 0,
    contentValid: false,
    error: null,
    checkedAt: formatDateTime(),
  };

  try {
    const response = await makeRequest(source.url, { headers: source.headers });
    result.statusCode = response.statusCode;
    result.responseTime = response.responseTime;

    // 检查HTTP状态
    if (response.statusCode >= 200 && response.statusCode < 300) {
      result.status = 'ok';
      
      // 检查内容有效性
      if (source.checkContent) {
        result.contentValid = source.checkContent(response.body);
        if (!result.contentValid) {
          result.status = 'content_invalid';
          result.error = 'Content validation failed';
        }
      }
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      result.status = 'redirect';
    } else if (response.statusCode >= 400 && response.statusCode < 500) {
      result.status = 'client_error';
      result.error = `HTTP ${response.statusCode}`;
    } else if (response.statusCode >= 500) {
      result.status = 'server_error';
      result.error = `HTTP ${response.statusCode}`;
    }
  } catch (err) {
    result.status = 'error';
    result.error = err.error || err.message || 'Unknown error';
    result.responseTime = err.responseTime || CONFIG.timeout;
  }

  return result;
}

/**
 * 检查所有数据源
 */
async function checkAllDataSources() {
  const results = {
    timestamp: formatDateTime(),
    summary: { total: 0, ok: 0, warning: 0, error: 0 },
    categories: {},
  };

  for (const [category, sources] of Object.entries(DATA_SOURCES)) {
    console.log(`\n[${category.toUpperCase()}] 检查 ${sources.length} 个数据源...`);
    results.categories[category] = [];

    for (const source of sources) {
      process.stdout.write(`  检查 ${source.name}... `);
      const result = await checkDataSource(source);
      results.categories[category].push(result);
      results.summary.total++;

      if (result.status === 'ok') {
        results.summary.ok++;
        console.log(`✓ ${result.responseTime}ms`);
      } else if (result.status === 'redirect' || result.status === 'content_invalid') {
        results.summary.warning++;
        console.log(`⚠ ${result.status}`);
      } else {
        results.summary.error++;
        console.log(`✗ ${result.status}: ${result.error}`);
      }

      // 延迟避免请求过快
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return results;
}

// ==================== 告警处理 ====================

/**
 * 处理告警逻辑
 */
function processAlerts(results, previousState) {
  const alerts = [];
  const newState = { ...previousState, lastCheck: formatDateTime() };

  for (const [category, sources] of Object.entries(results.categories)) {
    for (const result of sources) {
      const key = `${category}.${result.name}`;
      const prev = previousState[key] || { consecutiveFailures: 0, lastStatus: 'unknown' };

      // 更新失败计数
      if (result.status !== 'ok') {
        prev.consecutiveFailures = (prev.consecutiveFailures || 0) + 1;
      } else {
        // 恢复检测
        if (prev.consecutiveFailures >= CONFIG.failureThreshold) {
          alerts.push({
            type: 'recovery',
            severity: 'info',
            category,
            source: result.name,
            message: `数据源已恢复: ${result.name}`,
            details: `响应时间: ${result.responseTime}ms`,
          });
        }
        prev.consecutiveFailures = 0;
      }

      prev.lastStatus = result.status;
      newState[key] = prev;

      // 触发告警：连续失败达到阈值
      if (prev.consecutiveFailures === CONFIG.failureThreshold) {
        alerts.push({
          type: 'failure',
          severity: 'critical',
          category,
          source: result.name,
          message: `数据源不可用: ${result.name}`,
          details: `连续 ${CONFIG.failureThreshold} 次检查失败，当前状态: ${result.status}${result.error ? `, 错误: ${result.error}` : ''}`,
        });
      }
      // 首次失败警告
      else if (prev.consecutiveFailures === 1 && result.status !== 'ok') {
        alerts.push({
          type: 'warning',
          severity: 'warning',
          category,
          source: result.name,
          message: `数据源异常: ${result.name}`,
          details: `状态: ${result.status}${result.error ? `, 错误: ${result.error}` : ''}`,
        });
      }
    }
  }

  return { alerts, newState };
}

/**
 * 发送飞书告警
 */
async function sendFeishuAlert(alerts) {
  if (!CONFIG.feishuWebhook || alerts.length === 0) {
    return;
  }

  for (const alert of alerts) {
    const colorMap = {
      critical: 'red',
      warning: 'orange',
      info: 'green',
    };

    const payload = {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: {
            tag: 'plain_text',
            content: `🔔 数据源健康告警 - ${alert.severity.toUpperCase()}`,
          },
          template: colorMap[alert.severity] || 'blue',
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `**${alert.message}**\n\n${alert.details}\n\n类别: ${alert.category}\n时间: ${formatDateTime()}`,
            },
          },
        ],
      },
    };

    try {
      const response = await makeRequest(CONFIG.feishuWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(`  告警已发送: ${alert.message}`);
    } catch (err) {
      console.error(`  发送告警失败: ${err.message}`);
    }

    // 延迟避免请求过快
    await new Promise(r => setTimeout(r, 200));
  }
}

// ==================== 报告生成 ====================

/**
 * 生成文本报告
 */
function generateTextReport(results) {
  const lines = [
    '╔══════════════════════════════════════════════════════════════════════════════╗',
    '║                    数据源健康检查报告                                          ║',
    '╠══════════════════════════════════════════════════════════════════════════════╣',
    `║ 生成时间: ${results.timestamp.padEnd(58)} ║`,
    `║ 总计: ${results.summary.total.toString().padEnd(3)} | 正常: ${results.summary.ok.toString().padEnd(3)} | 警告: ${results.summary.warning.toString().padEnd(3)} | 异常: ${results.summary.error.toString().padEnd(3)}                    ║`,
    '╚══════════════════════════════════════════════════════════════════════════════╝',
    '',
  ];

  const statusIcons = {
    ok: '✓',
    error: '✗',
    redirect: '↳',
    content_invalid: '⚠',
    client_error: '✗',
    server_error: '✗',
    unknown: '?',
  };

  for (const [category, sources] of Object.entries(results.categories)) {
    const categoryNames = {
      news: '📰 新闻源',
      thinkTanks: '🏛️ 智库',
      apis: '🔌 API',
    };

    lines.push(`\n${categoryNames[category] || category}`);
    lines.push('─'.repeat(80));
    lines.push(`数据源名称                    | 状态 | 响应时间 | 最后检查时间`);
    lines.push('─'.repeat(80));

    for (const source of sources) {
      const icon = statusIcons[source.status] || '?';
      const statusStr = source.status === 'ok' ? '正常' : 
                       source.status === 'error' ? '错误' :
                       source.status === 'redirect' ? '重定向' :
                       source.status === 'content_invalid' ? '内容无效' :
                       source.status === 'client_error' ? '客户端错误' :
                       source.status === 'server_error' ? '服务端错误' : '未知';
      
      const name = source.name.padEnd(28);
      const status = `${icon} ${statusStr}`.padEnd(6);
      const time = `${source.responseTime}ms`.padEnd(10);
      const checked = source.checkedAt;
      
      lines.push(`${name}| ${status}| ${time}| ${checked}`);
      
      if (source.error) {
        lines.push(`  └─ 错误: ${source.error}`);
      }
    }
  }

  lines.push('\n' + '═'.repeat(80));
  lines.push('报告结束');

  return lines.join('\n');
}

/**
 * 生成Markdown报告
 */
function generateMarkdownReport(results) {
  const lines = [
    '# 数据源健康检查报告',
    '',
    `**生成时间:** ${results.timestamp}`,
    '',
    '## 摘要',
    '',
    '| 指标 | 数量 |',
    '|------|------|',
    `| 总计 | ${results.summary.total} |`,
    `| ✅ 正常 | ${results.summary.ok} |`,
    `| ⚠️ 警告 | ${results.summary.warning} |`,
    `| ❌ 异常 | ${results.summary.error} |`,
    '',
  ];

  const categoryNames = {
    news: '📰 新闻源',
    thinkTanks: '🏛️ 智库',
    apis: '🔌 API',
  };

  for (const [category, sources] of Object.entries(results.categories)) {
    lines.push(`## ${categoryNames[category] || category}`);
    lines.push('');
    lines.push('| 数据源 | 状态 | HTTP状态码 | 响应时间 | 内容有效 | 最后检查 |');
    lines.push('|--------|------|-----------|---------|---------|---------|');

    for (const source of sources) {
      const statusEmoji = source.status === 'ok' ? '✅' : 
                         source.status === 'error' ? '❌' :
                         source.status === 'redirect' ? '↳' :
                         source.status === 'content_invalid' ? '⚠️' : '❓';
      
      const contentValid = source.contentValid ? '✅' : source.status === 'ok' ? 'N/A' : '❌';
      const statusCode = source.statusCode || 'N/A';
      
      lines.push(`| ${source.name} | ${statusEmoji} ${source.status} | ${statusCode} | ${source.responseTime}ms | ${contentValid} | ${source.checkedAt} |`);
      
      if (source.error) {
        lines.push(`| | *错误: ${source.error}* | | | | |`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 生成JSON报告
 */
function generateJSONReport(results) {
  return JSON.stringify(results, null, 2);
}

/**
 * 保存报告
 */
function saveReports(results) {
  ensureDir(CONFIG.reportPath);
  
  const date = formatDate();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  // 文本报告
  const textReport = generateTextReport(results);
  fs.writeFileSync(path.join(CONFIG.reportPath, `health-report-${date}.txt`), textReport);
  
  // Markdown报告
  const mdReport = generateMarkdownReport(results);
  fs.writeFileSync(path.join(CONFIG.reportPath, `health-report-${date}.md`), mdReport);
  
  // JSON报告（完整数据）
  const jsonReport = generateJSONReport(results);
  fs.writeFileSync(path.join(CONFIG.reportPath, `health-report-${date}.json`), jsonReport);
  
  // 最新报告（覆盖）
  fs.writeFileSync(path.join(CONFIG.reportPath, 'latest.txt'), textReport);
  fs.writeFileSync(path.join(CONFIG.reportPath, 'latest.md'), mdReport);
  
  console.log(`\n报告已保存到: ${CONFIG.reportPath}`);
  console.log(`  - health-report-${date}.txt`);
  console.log(`  - health-report-${date}.md`);
  console.log(`  - health-report-${date}.json`);
  console.log(`  - latest.txt / latest.md`);
  
  return {
    textPath: path.join(CONFIG.reportPath, `health-report-${date}.txt`),
    mdPath: path.join(CONFIG.reportPath, `health-report-${date}.md`),
    jsonPath: path.join(CONFIG.reportPath, `health-report-${date}.json`),
  };
}

// ==================== 主函数 ====================

/**
 * 运行健康检查
 */
async function runHealthCheck(options = {}) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           数据源健康检查系统                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`开始时间: ${formatDateTime()}\n`);

  // 加载之前的状态
  const previousState = loadState();

  // 执行检查
  const results = await checkAllDataSources();

  // 处理告警
  const { alerts, newState } = processAlerts(results, previousState);

  // 保存状态
  saveState(newState);

  // 发送告警
  if (alerts.length > 0) {
    console.log(`\n[告警] 发现 ${alerts.length} 条告警:`);
    for (const alert of alerts) {
      const icon = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🟢';
      console.log(`  ${icon} [${alert.type.toUpperCase()}] ${alert.message}`);
    }
    
    if (CONFIG.feishuWebhook) {
      console.log('\n发送飞书告警...');
      await sendFeishuAlert(alerts);
    } else {
      console.log('\n⚠️ 未配置飞书Webhook，跳过告警发送');
      console.log('   设置环境变量 FEISHU_WEBHOOK 以启用告警');
    }
  } else {
    console.log('\n[告警] 无告警');
  }

  // 生成并保存报告
  const reportPaths = saveReports(results);

  // 输出报告摘要
  console.log('\n' + '═'.repeat(60));
  console.log(generateTextReport(results));

  console.log('\n✅ 健康检查完成');

  return {
    results,
    alerts,
    reportPaths,
  };
}

// ==================== CLI 入口 ====================

async function main() {
  const args = process.argv.slice(2);
  
  // 帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
数据源健康检查系统

用法:
  node data-source-health.js [选项]

选项:
  --help, -h       显示帮助信息
  --json           输出JSON格式结果到stdout
  --silent         静默模式，只输出错误
  --test-alert     测试告警发送

环境变量:
  FEISHU_WEBHOOK   飞书机器人Webhook URL
  NEWSAPI_KEY      NewsAPI密钥（可选）

示例:
  node data-source-health.js
  FEISHU_WEBHOOK=https://... node data-source-health.js
`);
    return;
  }

  // 测试告警
  if (args.includes('--test-alert')) {
    if (!CONFIG.feishuWebhook) {
      console.error('错误: 未设置 FEISHU_WEBHOOK 环境变量');
      process.exit(1);
    }
    console.log('发送测试告警...');
    await sendFeishuAlert([{
      type: 'test',
      severity: 'info',
      category: 'test',
      source: 'Test',
      message: '测试告警',
      details: '这是一条测试消息，用于验证告警配置是否正确。',
    }]);
    console.log('测试告警已发送');
    return;
  }

  try {
    const result = await runHealthCheck();
    
    if (args.includes('--json')) {
      console.log(JSON.stringify(result, null, 2));
    }

    // 如果有严重错误，返回非零退出码
    const hasCriticalErrors = result.results.summary.error > 0;
    if (hasCriticalErrors && !args.includes('--json')) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('健康检查失败:', err);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

// 导出模块接口
module.exports = {
  runHealthCheck,
  checkDataSource,
  checkAllDataSources,
  DATA_SOURCES,
  CONFIG,
};
