# quantum-intel-monitor Skill v2.0

**名称**: quantum-intel-monitor  
**版本**: 2.0.0  
**更新**: 2026-02-24 - 优化数据处理流程，解决 token 超限问题

---

## 核心改进

### 1. 分批处理架构

```
数据收集阶段
    │
    ├─ 批次1: 政策源 (3个源)
    ├─ 批次2: 学术源 (3个源)
    ├─ 批次3: 企业源 (3个源)
    └─ 批次4: 其他源 (3个源)
         │
         ▼
数据筛选阶段 (每批次独立处理)
    │
    ├─ 去重
    ├─ 评分 (intel_score)
    └─ 取 TOP 5 (每批次)
         │
         ▼
汇总生成阶段
    │
    ├─ 合并所有批次 TOP 5
    ├─ 全局排序
    └─ 生成报告
```

### 2. 数据限制策略

| 参数 | 旧版 | 新版 |
|------|------|------|
| 每源搜索条数 | 10 | 5 |
| 每批次源数 | 8 | 3 |
| 单次处理条数 | 80 | 15 |
| 保留摘要长度 | 全文 | 200字 |
| 每批次 TOP | 无限制 | 5条 |

### 3. 分批搜索策略

**批次1 - 政策动态 (3个源)**
```yaml
sources:
  - quantum.gov
  - European Commission Quantum
  - DARPA
keywords: "quantum policy export controls sanctions 2025 2026"
limit: 5
section: policy_dynamics
```

**批次2 - 学术动态 (3个源)**
```yaml
sources:
  - arXiv quant-ph
  - Nature Quantum Information
  - PRX Quantum
keywords: "fault-tolerant error correction logical qubit 2025 2026"
limit: 5
section: academic_dynamics
```

**批次3 - 企业动态 (3个源)**
```yaml
sources:
  - IBM Quantum
  - Google Quantum AI
  - IonQ
keywords: "quantum computing roadmap funding partnership 2025 2026"
limit: 5
section: company_dynamics
```

**批次4 - 中国动态 (3个源)**
```yaml
sources:
  - 本源量子
  - 国盾量子
  - 中国量子信息
keywords: "本源量子 国盾量子 量子计算 量子通信 2025 2026"
limit: 5
section: competitive_landscape
```

### 4. 数据处理流程

```python
# 步骤1: 分批搜索 (每批独立执行)
def batch_search(batch_config):
    results = []
    for source in batch_config.sources:
        # 限制返回内容长度
        data = search(source, batch_config.keywords, limit=5)
        # 只保留关键字段，截断长文本
        for item in data:
            results.append({
                'title': item.title[:100],
                'summary': item.summary[:200],  # 限制200字
                'url': item.url,
                'date': item.date,
                'source': source
            })
    return results

# 步骤2: 评分筛选 (每批独立)
def score_and_filter(items, section):
    for item in items:
        item['intel_score'] = calculate_score(item, section)
    # 只保留 TOP 5
    return sorted(items, key=lambda x: x['intel_score'], reverse=True)[:5]

# 步骤3: 汇总生成
def generate_report(all_batches):
    # 合并所有批次
    all_items = []
    for batch in all_batches:
        all_items.extend(batch)
    
    # 按板块分组
    sections = group_by_section(all_items)
    
    # 每板块取 TOP 10
    for section in sections:
        section['items'] = sorted(section['items'], 
                                  key=lambda x: x['intel_score'], 
                                  reverse=True)[:10]
    
    return generate_word_doc(sections)
```

### 5. 报告生成优化

**旧版问题**:
- 一次性搜索所有源 (30个)
- 返回大量完整内容
- token 迅速超限

**新版优化**:
- 分批搜索 (每批3个源)
- 截断摘要 (200字以内)
- 每批只保留 TOP 5
- 最终报告每板块 TOP 10

### 6. 执行流程

```bash
# 日报生成流程 (约10-15分钟)
1. 批次1搜索 (2分钟) → 评分 → TOP 5
2. 批次2搜索 (2分钟) → 评分 → TOP 5  
3. 批次3搜索 (2分钟) → 评分 → TOP 5
4. 批次4搜索 (2分钟) → 评分 → TOP 5
5. 汇总生成 (3分钟) → Word → 邮件发送
```

### 7. 容错机制

```yaml
retry_policy:
  max_retries: 3
  backoff: exponential
  
error_handling:
  - 某批次失败: 跳过该批次，继续其他批次
  - 搜索无结果: 记录日志，继续下一源
  - 评分失败: 使用默认评分(3.0)
  - 邮件失败: 重试3次，失败则保存到本地
```

### 8. 存储结构

```
outputs/quantum_intel/
├── daily/
│   ├── quantum_daily_2026-02-24.jsonl      # 原始数据
│   ├── quantum_daily_2026-02-24_top5.jsonl # 筛选后
│   └── quantum_daily_2026-02-24.docx       # 报告
├── weekly/
│   └── quantum_weekly_2026-W08.docx
└── monthly/
    └── quantum_monthly_2026-02.docx
```

---

## 更新记录

- **v2.0** (2026-02-24): 重新设计数据处理流程，解决 token 超限问题
  - 分批搜索架构
  - 数据截断策略
  - TOP N 筛选机制
  - 容错重试机制

---

*配置生成时间: 2026-02-24*
