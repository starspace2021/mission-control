# quantum-intel-monitor Skill

**名称**: quantum-intel-monitor  
**版本**: 1.0.0  
**所有者**: yang  
**语言**: zh-CN  
**时区**: America/Chicago

---

## 目的

自动化监控量子领域情报，覆盖：
- 政策动态
- 学术动态
- 企业动态
- 技术突破
- 竞争态势

输出日报、周报、月报，结构化入库，支持后续 RAG 与看板。

---

## 报告时间表

| 类型 | 时间 | 规则 |
|------|------|------|
| 日报 | 07:00 | FREQ=DAILY;BYHOUR=7;BYMINUTE=0 |
| 周报 | 20:00 (周日) | FREQ=WEEKLY;BYDAY=SU;BYHOUR=20 |
| 月报 | 08:00 (1日) | FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=8 |

---

## 监控范围

### 领域 (domains)
- quantum_computing (量子计算)
- quantum_sensing (量子测量)
- quantum_communication (量子通信)

### 板块 (sections)
- policy_dynamics (政策动态)
- academic_dynamics (学术动态)
- company_dynamics (企业动态)
- tech_breakthroughs (技术突破)
- competitive_landscape (竞争态势)

---

## 数据源 (30个)

### 行业媒体
- The Quantum Insider
- Quantum Computing Report
- Quantum World

### 科学媒体
- Quanta Magazine
- Physics World
- APS Physics

### 学术期刊
- Nature Quantum Information
- PRX Quantum
- Quantum Science and Technology (IOP)

### 预印本
- arXiv quant-ph new
- arXiv cs.ET new
- arXiv physics.ins-det new

### 出版门户
- IEEE Xplore Quantum
- ACM Digital Library

### 公司官方
- IBM Quantum
- Google Quantum AI
- Microsoft Quantum
- Amazon Braket
- Quantinuum
- IonQ
- Rigetti
- D-Wave
- PsiQuantum
- Xanadu
- Pasqal
- ID Quantique

### 联盟/政策
- Quantum Internet Alliance
- quantum.gov (美国)
- DARPA
- European Commission Quantum

---

## 关键词

### 政策动态
National Quantum Initiative, export controls, sanctions, funding program, Chips and Science, EU Quantum Flagship, Horizon Europe quantum, DARPA quantum, NIST quantum

### 学术动态
fault-tolerant, error correction, surface code, logical qubit, neutral atom, trapped ion, superconducting qubit, photonic, spin qubit, quantum metrology, NV center, atomic clock, quantum networking, QKD, entanglement distribution, quantum repeater

### 企业动态
Series A, Series B, seed round, strategic partnership, acquisition, IPO, earnings, roadmap, product launch

### 技术突破
record fidelity, coherence time, two-qubit gate, magic state, lattice surgery, hardware-efficient, benchmark, quantum advantage, quantum error mitigation

### 竞争态势
US vs China, EU vs US, technology leadership, patent, standardization, ecosystem

---

## 提取字段

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 标题 |
| url | string | 链接 |
| source_id | string | 来源ID |
| published_at | datetime | 发布时间 |
| domain | enum | 领域 (quantum_computing/sensing/communication) |
| section | enum | 板块 (policy/academic/company/tech/competitive) |
| entities | list | 实体列表 |
| summary_bullets | list | 摘要要点 |
| signals | object | 评分信号 |
| intel_score | number | 情报评分 |
| evidence_snippets | list | 证据片段 |

### 评分信号 (signals)
- novelty: 0-5 (新颖性)
- credibility: 0-5 (可信度)
- impact: 0-5 (影响力)
- urgency: 0-5 (紧迫性)
- relevance_to_china_policy: 0-5 (对华政策相关性)

### 情报评分公式
```
intel_score = 0.25*impact + 0.20*credibility + 0.20*novelty + 0.20*relevance_to_china_policy + 0.15*urgency
```

---

## 处理配置

### 获取 (fetch)
- mode: rss_or_html
- user_agent: OpenClaw/quantum-intel-monitor
- timeout: 25秒
- max_pages_per_source: 3

### 时效窗口
- daily: 30小时
- weekly: 10天
- monthly: 45天

### 去重 (dedup)
- normalize_url
- title_simhash (阈值: 3)

### 分类 (classify)
- policy_official → policy_dynamics
- journal/preprint/publisher_portal → academic_dynamics
- company_official → company_dynamics
- fallback: 启用模型分类

### 评分启发式
**可信度加成:**
- policy_official: 5
- journal: 5
- preprint: 4
- company_official: 4
- industry_analysis: 4
- industry_media: 3
- science_media: 4

**影响力加成词:**
- fault-tolerant: +1
- logical qubit: +1
- error correction: +1
- export controls: +2
- sanctions: +2
- Series: +1
- acquisition: +2

---

## 输出配置

### 存储
- format: jsonl
- path: ./outputs/quantum_intel/
- naming:
  - daily: quantum_daily_{YYYY}-{MM}-{DD}.jsonl
  - weekly: quantum_weekly_{YYYY}-W{WW}.jsonl
  - monthly: quantum_monthly_{YYYY}-{MM}.jsonl

### 报告模板
- daily_markdown: 量子情报日报
- sections_order: policy → academic → company → tech → competitive

---

*配置生成时间: 2026-02-24*
