/**
 * 历史对比模块集成示例
 * 
 * 演示如何将 history-comparator 集成到日报生成流程中
 */

const path = require('path');
const {
  compareDailyReport,
  compareFromFile,
  getTrendData,
  saveSnapshot,
  DailySnapshot,
  getDateString
} = require('./history-comparator');

// ============================================
// 示例 1: 直接对比日报内容
// ============================================
function example1_DirectComparison() {
  console.log('=== 示例 1: 直接对比日报内容 ===\n');
  
  // 模拟今日日报内容
  const todayReport = `
# 中美政策日报 - 2026-02-25

## 概览
- 情报总数：25 条
- P0级事件：2 条
- P1级事件：5 条

## 重要事件
1. 🔴 美国宣布对中国新能源汽车加征25%关税
2. 🔴 中国商务部宣布反制措施
3. 🟡 美联储暗示可能推迟降息
4. 🟡 中美贸易谈判代表将举行视频会议

## 关键指标
- 关税税率：25%
- 谈判成功概率：45%
- 贸易摩擦指数：78

## 数据源
- 白宫官网
- 商务部新闻发布会
- 华尔街日报
- 路透社
`;

  const result = compareDailyReport({
    topic: 'us-china',
    todayReport: todayReport,
    todayDate: '2026-02-25',
    saveSnapshot: true,
    includeTrend: true
  });

  if (result.success) {
    console.log('✅ 对比成功！\n');
    console.log('=== 完整对比报告 ===');
    console.log(result.reports.full);
    console.log('\n=== 简要摘要 ===');
    console.log(result.reports.brief);
  } else {
    console.error('❌ 对比失败:', result.error);
  }
}

// ============================================
// 示例 2: 从文件对比
// ============================================
function example2_CompareFromFile() {
  console.log('\n=== 示例 2: 从文件对比 ===\n');
  
  const reportPath = path.join(__dirname, 'example-report-today.md');
  const result = compareFromFile(reportPath, 'us-china');
  
  if (result.success) {
    console.log('✅ 文件对比成功！');
    console.log('主题:', result.topic);
    console.log('对比日期:', result.yesterdayDate, 'vs', result.todayDate);
    console.log('\n事件变化:');
    console.log('  总数:', result.comparison.changes.totalEvents);
    console.log('  P0:', result.comparison.changes.p0Count);
    console.log('  新增事件:', result.comparison.newEvents.length);
    console.log('  消失事件:', result.comparison.removedEvents.length);
  } else {
    console.error('❌ 对比失败:', result.error);
  }
}

// ============================================
// 示例 3: 获取趋势数据
// ============================================
function example3_GetTrendData() {
  console.log('\n=== 示例 3: 获取趋势数据 ===\n');
  
  const result = getTrendData('us-china', 7);
  
  if (result.success) {
    console.log('📊 趋势分析结果:');
    console.log(result.trendDescription);
    console.log('\n统计数据:');
    console.log(JSON.stringify(result.statistics, null, 2));
  } else {
    console.error('❌ 获取趋势失败:', result.error);
  }
}

// ============================================
// 示例 4: 集成到日报生成流程
// ============================================
async function example4_IntegrationWithReportGeneration() {
  console.log('\n=== 示例 4: 集成到日报生成流程 ===\n');
  
  /**
   * 这是集成到日报生成系统的示例代码
   * 假设你有一个 generateDailyReport() 函数来生成日报
   */
  
  // 模拟日报生成
  async function generateDailyReport(topic, date) {
    // ... 实际的日报生成逻辑 ...
    return {
      content: `# ${topic} 日报 - ${date}\n\n## 概览\n- 情报总数：30 条\n- P0级事件：3 条\n`,
      metadata: { topic, date }
    };
  }
  
  // 集成对比功能的日报生成
  async function generateReportWithComparison(topic, date) {
    // 1. 生成日报
    const report = await generateDailyReport(topic, date);
    
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
      
      // 或者在报告末尾添加
      // finalReport = report.content + '\n\n---\n\n' + comparison.reports.full;
    }
    
    return {
      content: finalReport,
      comparison: comparison.success ? comparison : null,
      metadata: {
        ...report.metadata,
        hasComparison: comparison.success
      }
    };
  }
  
  // 执行
  const result = await generateReportWithComparison('us-china', '2026-02-25');
  console.log('✅ 集成报告生成成功！');
  console.log('包含对比模块:', result.metadata.hasComparison);
  if (result.comparison) {
    console.log('简要摘要:', result.comparison.reports.brief);
  }
}

// ============================================
// 示例 5: 批量处理多主题日报
// ============================================
async function example5_BatchProcessing() {
  console.log('\n=== 示例 5: 批量处理多主题日报 ===\n');
  
  const topics = ['us-china', 'africa', 'europe', 'tech'];
  const date = getDateString();
  
  const results = [];
  
  for (const topic of topics) {
    // 模拟生成各主题日报
    const mockReport = `
# ${topic.toUpperCase()} 日报 - ${date}

## 概览
- 情报总数：${Math.floor(Math.random() * 30) + 10} 条
- P0级事件：${Math.floor(Math.random() * 3)} 条
- P1级事件：${Math.floor(Math.random() * 5) + 1} 条
`;
    
    const comparison = compareDailyReport({
      topic,
      todayReport: mockReport,
      todayDate: date,
      saveSnapshot: true,
      includeTrend: false // 批量处理时可禁用趋势以提升性能
    });
    
    results.push({
      topic,
      success: comparison.success,
      brief: comparison.success ? comparison.reports.brief : comparison.error
    });
  }
  
  console.log('批量处理结果:');
  results.forEach(r => {
    console.log(`  ${r.topic}: ${r.success ? '✅' : '❌'} ${r.brief}`);
  });
}

// ============================================
// 运行示例
// ============================================
async function runExamples() {
  console.log('历史对比模块集成示例\n');
  console.log('====================\n');
  
  // 初始化示例数据（如果还没有）
  const fs = require('fs');
  const snapshotDir = path.join(__dirname, '..', 'memory', 'daily-snapshots');
  
  if (!fs.existsSync(snapshotDir) || fs.readdirSync(snapshotDir).length === 0) {
    console.log('正在初始化示例数据...\n');
    const { execSync } = require('child_process');
    execSync('node tools/history-comparator.js init', { cwd: path.join(__dirname, '..') });
  }
  
  // 运行示例
  example1_DirectComparison();
  example2_CompareFromFile();
  example3_GetTrendData();
  await example4_IntegrationWithReportGeneration();
  await example5_BatchProcessing();
  
  console.log('\n====================');
  console.log('所有示例执行完成！');
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  example1_DirectComparison,
  example2_CompareFromFile,
  example3_GetTrendData,
  example4_IntegrationWithReportGeneration,
  example5_BatchProcessing
};
