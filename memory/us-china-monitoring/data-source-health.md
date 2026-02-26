# 美国对华政策监控 - 数据源健康监控配置

## 数据源列表

| 数据源 | 类型 | 优先级 | 健康阈值 |
|--------|------|--------|----------|
| USTR 官网 | 官方 | P0 | 95% |
| BIS 实体清单 | 官方 | P0 | 95% |
| OFAC SDN | 官方 | P0 | 95% |
| 白宫新闻 | 官方 | P0 | 90% |
| 商务部新闻 | 官方 | P0 | 90% |
| 国会记录 | 官方 | P1 | 85% |
| CSIS | 智库 | P1 | 80% |
| RAND | 智库 | P1 | 80% |
| Brookings | 智库 | P1 | 80% |
| CFR | 智库 | P1 | 80% |

## 异常检测规则

### P0 告警（立即通知）
- 任一 P0 数据源可用性 < 90%
- 连续 3 次检测失败
- 响应时间 > 30 秒

### P1 告警（日报中标注）
- 任一 P1 数据源可用性 < 80%
- 连续 5 次检测失败

## 自动化监控脚本

```python
# 每日执行检查
def check_data_source_health():
    for source in data_sources:
        availability = check_availability(source.url)
        if source.priority == "P0" and availability < 90:
            alert(f"🚨 P0数据源异常: {source.name} 可用性 {availability}%")
        elif availability < source.threshold:
            log(f"⚠️ 数据源警告: {source.name} 可用性 {availability}%")
```

## 实施记录

- 创建时间：2026-02-26
- 状态：已启用
- 监控频率：每2小时
- 告警方式：飞书消息 + 日报标注
