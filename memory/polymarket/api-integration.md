# Polymarket API 接入配置

## API 接入方案

### 方案A: Polymarket 官方 API (推荐)
- 状态: 需要申请访问权限
- 文档: https://docs.polymarket.com/
- 功能: 实时市场数据、交易历史、盘口信息
- 限制: 需要 API Key，有速率限制

### 方案B: The Graph 子图查询
- 状态: 公开可用
- 端点: https://api.thegraph.com/subgraphs/name/polymarket/matic-markets
- 功能: 市场数据、交易量、价格历史
- 优势: 无需 API Key，GraphQL 查询

### 方案C: 第三方数据聚合
- 备选: Dune Analytics, DefiLlama
- 功能: 聚合数据、分析图表
- 限制: 数据有延迟

## 当前实施方案: The Graph

### 查询示例
```graphql
query {
  markets(first: 10, orderBy: volume, orderDirection: desc) {
    id
    question
    volume
    outcomes {
      name
      price
    }
  }
}
```

### 实时数据获取
- TOP 10 盘口: 按交易量排序
- 价格变化: 24小时变化率
- 地缘政治盘口: 关键词过滤

## 自动化流程

```python
def fetch_polymarket_data():
    # 获取 TOP 10 盘口
    top_markets = query_graph("markets", orderBy="volume", first=10)
    
    # 获取地缘政治相关盘口
    geo_markets = filter_by_keywords(top_markets, ["Ukraine", "Taiwan", "Israel", "Iran"])
    
    # 获取金融市场盘口
    finance_markets = filter_by_keywords(top_markets, ["Bitcoin", "Fed", "S&P", "Gold"])
    
    return {
        "top10": top_markets,
        "geopolitical": geo_markets,
        "financial": finance_markets
    }
```

## 数据更新频率

- TOP 10 盘口: 每小时更新
- 价格数据: 每15分钟更新
- 日报生成: 每日 07:00

## 实施记录

- 创建时间：2026-02-26
- 实施方案：The Graph 子图查询
- 状态：已启用
- 下次优化：申请官方 API 提升数据精度
