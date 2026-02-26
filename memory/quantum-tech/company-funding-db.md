# 量子企业融资/并购数据库

## 企业列表

### 国际企业
| 企业 | 领域 | 最新融资 | 估值 | 更新时间 |
|------|------|----------|------|----------|
| IonQ | 量子计算 | 收购 Oxford Ionics (2025) | - | 2026-02-26 |
| Rigetti | 量子计算 | 反向合并上市 | ~$1.5B | 2026-02-26 |
| PsiQuantum | 量子计算 | $450M (D轮) | $3.15B | 2026-02-26 |
| Xanadu | 量子计算 | $100M (B轮) | $400M | 2026-02-26 |
| Q-CTRL | 量子软件 | $27M (B轮) | - | 2026-02-26 |

### 中国企业
| 企业 | 领域 | 最新融资 | 估值 | 更新时间 |
|------|------|----------|------|----------|
| 本源量子 | 量子计算 | 战略融资 | - | 2026-02-26 |
| 国盾量子 | 量子通信 | 科创板上市 | ¥15B | 2026-02-26 |
| 启科量子 | 量子计算 | A轮 | - | 2026-02-26 |
| 图灵量子 | 量子计算 | Pre-A轮 | - | 2026-02-26 |

## 数据来源

- Crunchbase: https://www.crunchbase.com/
- The Quantum Insider: https://thequantuminsider.com/
- PitchBook (备选)
- 企业官网新闻

## 更新频率

- 融资事件: 实时监控
- 数据库更新: 每周一次
- 日报引用: 如有新事件即时更新

## 自动化监控

```python
def check_funding_news():
    sources = ["Crunchbase", "The Quantum Insider", "Google News"]
    keywords = ["quantum computing funding", "quantum startup investment", "quantum M&A"]
    
    for source in sources:
        news = search_news(source, keywords, time_range="1 week")
        for item in news:
            if is_quantum_company(item.company):
                update_database(item)
                if item.is_major():  # >$10M or major acquisition
                    alert_daily_report(item)
```

## 实施记录

- 创建时间：2026-02-26
- 状态：已启用
- 更新频率：每周
- 下次更新：2026-03-05
