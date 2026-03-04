# 情报看板运维手册

**创建时间**: 2026-03-04  
**维护者**: 侧影  
**适用范围**: 非洲/日本/伊朗等所有情报看板系统

---

## 1. 定时任务管理

### 1.1 配置文件化

所有定时任务必须写入配置文件，禁止仅使用 `crontab -e` 临时添加：

```bash
# /root/.openclaw/workspace/config/crontab.conf
# 非洲情报
0 0,10,14,17,20 * * * cd /workspace && python3 africa-intelligence/api.py
5 0,10,14,17,20 * * * cd /workspace && python3 africa-intelligence/qa.py

# 日本情报
0 0,6,12,18 * * * cd /workspace && python3 japan-intelligence/api.py
5 0,6,12,18 * * * cd /workspace && python3 japan-intelligence/qa.py

# 伊朗情报
0 * * * * cd /workspace && python3 iran-intelligence/api.py
5 * * * * cd /workspace && python3 iran-intelligence/qa.py
```

### 1.2 安装脚本

```bash
#!/bin/bash
# install-cron.sh

cat /root/.openclaw/workspace/config/crontab.conf | crontab -
echo "定时任务已安装"
crontab -l
```

### 1.3 定期检查

QA 任务必须包含定时任务状态检查：

```python
def check_cron_status():
    import subprocess
    result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
    
    required_tasks = [
        'africa-intelligence',
        'japan-intelligence', 
        'iran-intelligence'
    ]
    
    missing = []
    for task in required_tasks:
        if task not in result.stdout:
            missing.append(task)
    
    if missing:
        alert(f"定时任务缺失: {missing}")
```

---

## 2. 数据接口规范

### 2.1 统一 API 设计

所有看板必须提供标准化 API：

```python
# api.py 标准接口

class IntelAPI:
    def add_report(self, report: dict) -> dict:
        """添加报告，自动备份和验证"""
        pass
    
    def get_reports(self, limit: int = 100) -> list:
        """获取报告列表"""
        pass
    
    def get_stats(self) -> dict:
        """获取统计信息"""
        pass
    
    def validate(self) -> dict:
        """验证数据完整性"""
        pass
    
    def sync_to_dashboard(self) -> bool:
        """同步到看板目录"""
        pass
```

### 2.2 禁止直接操作文件

```python
# ❌ 错误方式
with open('data/reports.json', 'w') as f:
    json.dump(data, f)

# ✅ 正确方式
from api import api
api.add_report(report)
```

---

## 3. 类型安全规范

### 3.1 TypeScript 类型定义

```typescript
// types/report.ts
export interface Report {
  id: string;
  type: string;
  category: string;
  contentType: string;
  title: string;
  time: string;
  summary: string;
  content: string;
  tags?: string[];
}

export interface ReportsData {
  reports: Report[];
}

// 数据格式兼容处理
function normalizeData(data: any): ReportsData {
  if (Array.isArray(data)) {
    return { reports: data };
  }
  return data as ReportsData;
}
```

### 3.2 所有页面统一处理

```typescript
// page.tsx
import reportsData from "../data/reports.json";
import { normalizeData } from "../lib/utils";

const typedData = normalizeData(reportsData);
```

---

## 4. 监控告警体系

### 4.1 QA 检查清单

每个 QA 任务必须检查：

| 检查项 | 频率 | 阈值 | 告警方式 |
|--------|------|------|---------|
| 定时任务存在性 | 每次QA | 100% | 飞书 |
| 数据更新延迟 | 每次QA | <2小时 | 飞书 |
| 报告数量异常 | 每次QA | <5条/天 | 飞书 |
| 构建状态 | 每次部署 | 成功 | 飞书 |
| 看板可访问性 | 每小时 | HTTP 200 | 飞书 |

### 4.2 自动修复机制

```python
def auto_fix():
    """自动修复常见问题"""
    
    # 1. 检查并修复定时任务
    if not check_cron_status():
        reinstall_cron()
    
    # 2. 检查并修复数据同步
    if not check_data_sync():
        sync_data()
    
    # 3. 检查并重新部署
    if not check_deployment():
        rebuild_and_deploy()
```

---

## 5. 文档维护

### 5.1 MISSION_CONTROL.md 更新规范

每次修改必须更新：
- 定时任务列表
- 依赖版本
- 负责人变更
- 已知问题

### 5.2 变更日志

```markdown
## 2026-03-04
- 修复日本看板类型错误
- 添加非洲/日本定时任务
- 创建运维手册

## 2026-03-03
- 伊朗看板上线
- 添加 QA 自动检查
```

---

## 6. 紧急处理流程

### 6.1 看板停止更新

```bash
# 1. 检查定时任务
crontab -l | grep intelligence

# 2. 检查数据
python3 -c "from api import api; print(api.get_stats())"

# 3. 手动同步数据
cp africa-intelligence/data/reports.json \
   africa-intelligence-dashboard/data/

# 4. 重新构建部署
cd africa-intelligence-dashboard
npm run build
npx vercel deploy --prod
```

### 6.2 构建失败

```bash
# 1. 查看错误日志
npm run build 2>&1 | grep error

# 2. 修复类型错误
# 检查所有 page.tsx 中的类型定义

# 3. 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

---

## 附录：检查清单

### 每日检查
- [ ] 看板数据是否更新
- [ ] 定时任务是否正常
- [ ] 飞书简报是否发送

### 每周检查
- [ ] 备份文件完整性
- [ ] Vercel 部署状态
- [ ] 依赖版本更新

### 每月检查
- [ ] 运维手册更新
- [ ] 性能优化评估
- [ ] 安全漏洞扫描

---

*最后更新: 2026-03-04*  
*维护者: 侧影*
