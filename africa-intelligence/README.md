# 非洲情报管理规范

## 目录结构

```
/workspace/africa-intelligence/
├── api.py              # 数据管理API（唯一入口）
├── deploy.sh           # 部署脚本
├── data/
│   ├── reports.json    # 主数据文件（禁止直接修改）
│   └── backups/        # 自动备份
├── reports/            # 原始报告文件
│   ├── 2026-02/
│   └── 2026-03/
└── dashboard/          # 看板前端代码
```

## 禁止事项

❌ **严禁直接操作以下文件：**
- `/workspace/africa-intelligence/data/reports.json`
- `/workspace/intelligence-dashboard/data/reports.json`

❌ **严禁跨看板操作数据**

## 正确操作方式

### 添加新报告
```python
from api import api

report = {
    "id": "africa-intel-20260302-2000",
    "type": "africa",
    "category": "intel",
    "contentType": "brief",
    "title": "非洲政经情报 20:00 简报",
    "time": "2026-03-02 20:00",
    "summary": "...",
    "content": "...",
    "tags": ["合作", "投资"]
}

result = api.add_report(report)
```

### 部署看板
```bash
/workspace/africa-intelligence/deploy.sh
```

### 查询统计
```bash
python3 /workspace/africa-intelligence/api.py stats
python3 /workspace/africa-intelligence/api.py validate
```

## 报告文件命名规范

```
africa-{category}-{YYYYMMDD}-{HHMM}.md

例如：
- africa-intel-20260302-2000.md    # 政经情报
- africa-risk-20260302-1405.md     # 风险情报
```

## 自动化任务

| 任务 | 频率 | 功能 |
|-----|------|------|
| 数据备份 | 每日01:00 | 自动备份reports.json |
| 完整性检查 | 每6小时 | 验证数据完整性 |
| 看板部署 | 每次更新后 | 自动构建部署 |