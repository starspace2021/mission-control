# 智库报告 RSS 订阅配置

## 已配置 RSS 源

### CSIS (Center for Strategic and International Studies)
- URL: https://www.csis.org/rss.xml
- 关键词过滤: China, Chinese, Taiwan, Indo-Pacific, semiconductor, trade
- 更新频率: 每日检查

### RAND Corporation
- URL: https://www.rand.org/rss.xml
- 关键词过滤: China, PLA, Taiwan, Indo-Pacific, defense
- 更新频率: 每日检查

### Brookings Institution
- URL: https://www.brookings.edu/feed/
- 关键词过滤: China, US-China, trade, technology, Taiwan
- 更新频率: 每日检查

### Council on Foreign Relations (CFR)
- URL: https://www.cfr.org/rss.xml
- 关键词过滤: China, Taiwan, trade, technology, Indo-Pacific
- 更新频率: 每日检查

### Atlantic Council
- URL: https://www.atlanticcouncil.org/feed/
- 关键词过滤: China, Taiwan, Indo-Pacific, technology
- 更新频率: 每日检查

### Asia Society Policy Institute
- URL: https://asiasociety.org/policy-institute/rss.xml
- 关键词过滤: China, US-China, Taiwan, Indo-Pacific
- 更新频率: 每日检查

## RSS 处理流程

1. **每日 06:30 抓取**
   - 检查所有 RSS 源
   - 筛选过去 24 小时的新文章
   - 关键词匹配

2. **内容摘要**
   - 提取文章标题、链接、摘要
   - 标注关键词匹配度
   - 生成智库报告监控列表

3. **输出到日报**
   - 添加到美国对华政策日报第8节
   - 标注来源和发布时间

## 实施记录

- 创建时间：2026-02-26
- 状态：已启用
- 下次抓取：2026-02-27 06:30
