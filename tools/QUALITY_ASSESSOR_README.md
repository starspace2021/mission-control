# 日报质量评估系统集成指南

## 模块文件路径

```
/root/.openclaw/workspace/tools/quality-assessor.js
```

## 质量报告存储路径

```
/root/.openclaw/workspace/memory/quality-reports/YYYY-MM-DD.json
/root/.openclaw/workspace/memory/quality-reports/weekly-YYYY-MM-DD.json
```

---

## 评分报告示例

### 单份日报质量报告

```
================================
📊 日报质量评估报告
================================

任务名称: 非洲涉华情报
报告日期: 2026-02-25
评估时间: 2026/2/25 08:16:32

--------------------------------
📈 评分概览
--------------------------------

  覆盖率    7/10  ███████░░░
  准确性    10/10  ██████████
  时效性    7/10  ███████░░░
  可读性    10/10  ██████████
  完整性    10/10  ██████████

  ──────────────────────────────
  总评分    9/10  [等级: A+]

--------------------------------
🔍 详细分析
--------------------------------

[覆盖率]
  • 信息来源: 2个 (路透社, 新华社)
  • 主题覆盖: 5/5 类别
  • 内容长度: 3114字符

[准确性]
  • 引用来源: 10处
  • 数据点: 34个
  • 日期引用: 6个

[时效性]
  • 时效标识: 2个
  • 平均时效: 6天前

[可读性]
  • 标题结构: 25个层级
  • 列表项: 50个
  • 段落数: 36
  • 包含数据表格
  • 使用视觉标记

[完整性]
  • 必填字段: 4/4
  • 关键章节: 5/5
  • 元数据项: 3/3
  • 包含结论/建议

--------------------------------
💡 改进建议
--------------------------------

1. 可适当增加更多权威来源引用

================================
```

### 周度趋势报告

```
================================
📊 周度质量趋势报告
================================

统计周期: 2026-02-24 至 2026-03-02
生成时间: 2026/2/25 08:16:26

--------------------------------
📈 整体概览
--------------------------------

  总报告数: 3份
  平均得分: 8.7/10

  质量分布:
    A+ (9-10): 2份 ██
    A (8-8.9): 1份 █
    B+ (7-7.9): 0份 
    B (6-6.9): 0份 
    C (5-5.9): 0份 
    D (<5): 0份 

--------------------------------
📋 任务质量排行
--------------------------------

  ➡️ 非洲涉华情报
     平均分: 9/10 | 报告数: 1
     趋势: 稳定
     得分记录: 9

  ➡️ 量子技术情报
     平均分: 9/10 | 报告数: 1
     趋势: 稳定
     得分记录: 9

  ➡️ 美国对华政策监控
     平均分: 8/10 | 报告数: 1
     趋势: 稳定
     得分记录: 8

================================
```

---

## 如何集成到现有日报生成流程

### 方法一：在日报生成脚本中添加评估步骤

在现有的日报生成脚本（如 `generate_africa_report.py`）末尾添加：

```python
import subprocess
import os

def assess_report_quality(report_path, task_name, report_date):
    """调用质量评估器评估日报质量"""
    assessor_path = os.path.join(os.getcwd(), 'tools', 'quality-assessor.js')
    
    result = subprocess.run([
        'node', assessor_path, 'assess',
        report_path,
        task_name,
        report_date
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ 质量评估完成: {task_name}")
        return True
    else:
        print(f"❌ 质量评估失败: {result.stderr}")
        return False

# 在日报生成完成后调用
if __name__ == "__main__":
    # ... 生成日报的代码 ...
    
    # 评估质量
    report_path = "./africa_report_20260225.md"
    assess_report_quality(report_path, "非洲涉华情报", "2026-02-25")
```

### 方法二：作为独立的定时任务

在 `MISSION_CONTROL.md` 中添加定时任务：

```yaml
# 质量评估任务
cron_jobs:
  - name: quality-assess-daily
    schedule: "0 9 * * *"  # 每天上午9点评估昨日日报
    command: |
      # 评估非洲情报报告
      node tools/quality-assessor.js assess \
        ./africa_report_$(date -d "yesterday" +%Y%m%d)_2000.md \
        "非洲涉华情报" \
        $(date -d "yesterday" +%Y-%m-%d)
      
      # 评估美国对华政策报告
      node tools/quality-assessor.js assess \
        ./us_china_policy_report_$(date -d "yesterday" +%Y%m%d).md \
        "美国对华政策监控" \
        $(date -d "yesterday" +%Y-%m-%d)
      
      # 每周一生成周度趋势报告
      if [ $(date +%u) -eq 1 ]; then
        node tools/quality-assessor.js weekly $(date -d "7 days ago" +%Y-%m-%d)
      fi
```

### 方法三：在飞书投递后触发

在 `feishu-delivery.js` 中添加质量评估钩子：

```javascript
// 在 deliverReport 函数中添加
async function deliverReport(reportPath, taskName, reportDate) {
  // ... 现有投递代码 ...
  
  // 评估质量
  const { assessReport, generateTextReport } = require('./quality-assessor.js');
  const content = fs.readFileSync(reportPath, 'utf-8');
  const qualityReport = assessReport(content, taskName, reportDate);
  
  // 如果质量低于阈值，发送警告
  if (qualityReport.scores.total < 7) {
    await sendQualityAlert(taskName, qualityReport);
  }
  
  return deliveryResult;
}
```

### 方法四：Mission Control Dashboard 集成

在 Mission Control UI 中添加质量监控面板：

```javascript
// 读取质量报告数据
const loadQualityData = () => {
  const qualityDir = './memory/quality-reports';
  const files = fs.readdirSync(qualityDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('weekly'))
    .sort()
    .reverse()
    .slice(0, 7); // 最近7天
  
  const reports = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(qualityDir, f), 'utf-8'));
    return { date: f.replace('.json', ''), reports: data };
  });
  
  return reports;
};

// 渲染质量仪表板
const renderQualityDashboard = () => {
  const data = loadQualityData();
  // ... 渲染图表 ...
};
```

---

## CLI 使用说明

### 评估单份日报

```bash
node tools/quality-assessor.js assess <报告文件路径> <任务名> <日期>

# 示例
node tools/quality-assessor.js assess \
  ./africa_report_20260225_2000.md \
  "非洲涉华情报" \
  2026-02-25
```

### 生成周度趋势报告

```bash
node tools/quality-assessor.js weekly <周开始日期>

# 示例
node tools/quality-assessor.js weekly 2026-02-24
```

### 列出质量报告

```bash
# 列出今日报告
node tools/quality-assessor.js list

# 列出指定日期报告
node tools/quality-assessor.js list 2026-02-25
```

### 显示帮助

```bash
node tools/quality-assessor.js help
```

---

## 评分维度说明

| 维度 | 权重 | 评估方法 | 高分标准 |
|------|------|----------|----------|
| 覆盖率 | 25% | 统计来源数量、关键词类别、内容长度 | ≥5个来源，覆盖≥4个主题类别 |
| 准确性 | 25% | 检查来源引用、数据点、模糊表述 | ≥5处引用，≥10个数据点，无模糊表述 |
| 时效性 | 20% | 检查时效标识、内容日期分布 | 包含时效标识，平均日期≤3天 |
| 可读性 | 15% | 检查标题结构、列表使用、段落长度 | ≥5个标题，≥10个列表项，有表格 |
| 完整性 | 15% | 检查必填字段、关键章节 | 所有必填字段齐全，≥4个关键章节 |

---

## 质量等级

| 等级 | 分数范围 | 说明 |
|------|----------|------|
| A+ | 9-10 | 优秀，可作为模板 |
| A | 8-8.9 | 良好，少量改进空间 |
| B+ | 7-7.9 | 合格，需要优化 |
| B | 6-6.9 | 及格，需要较大改进 |
| C | 5-5.9 | 不合格，需重新评估 |
| D | <5 | 严重问题，需立即整改 |

---

## 注意事项

1. **自动评估的局限性**：准确性/可读性维度基于规则评估，建议结合人工复核
2. **阈值设置**：建议设置质量分数低于7分时触发告警
3. **历史趋势**：关注周度趋势报告，识别质量退化任务
4. **持续优化**：根据实际使用情况调整评分权重和规则
