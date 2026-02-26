# arXiv RSS 订阅配置

## 订阅分类

### quant-ph (量子物理)
- URL: http://arxiv.org/rss/quant-ph
- 更新频率: 每日
- 关键词: quantum computing, quantum error correction, quantum algorithms

### cs.AI (人工智能)
- URL: http://arxiv.org/rss/cs.AI
- 更新频率: 每日
- 关键词: machine learning, deep learning, neural networks

### cs.CV (计算机视觉)
- URL: http://arxiv.org/rss/cs.CV
- 更新频率: 每日
- 关键词: remote sensing, satellite imagery, change detection

### q-fin.TR (量化金融 - 交易)
- URL: http://arxiv.org/rss/q-fin.TR
- 更新频率: 每日
- 关键词: algorithmic trading, high-frequency trading, market microstructure

### q-fin.PM (量化金融 - 投资组合管理)
- URL: http://arxiv.org/rss/q-fin.PM
- 更新频率: 每日
- 关键词: portfolio optimization, risk management, asset allocation

### q-fin.ST (量化金融 - 统计金融)
- URL: http://arxiv.org/rss/q-fin.ST
- 更新频率: 每日
- 关键词: volatility modeling, time series, econometrics

## RSS 处理流程

### 每日 06:00 执行
1. 抓取所有 RSS 源
2. 提取过去 24 小时新论文
3. 关键词匹配和分类
4. 生成论文列表

### 分类规则
- 量子计算: quant-ph + (computing OR algorithm)
- 量子测量: quant-ph + (sensing OR metrology)
- 量子通信: quant-ph + (communication OR QKD)
- 金融工程: q-fin.* + (trading OR risk OR portfolio)
- 遥感应用: cs.CV + (remote sensing OR satellite)

### 输出格式
```
## 量子计算动态
1. **论文标题** (arXiv:XXXX.XXXXX)
   - 作者: XXX
   - 摘要: XXX
   - 关键词匹配: quantum error correction

2. ...
```

## 实施记录

- 创建时间：2026-02-26
- 状态：已启用
- 抓取频率：每日 06:00
- 下次抓取：2026-02-27 06:00
