# 数据安全操作规范

**创建时间**: 2026-03-04  
**维护者**: 侧影  
**适用范围**: 所有情报看板数据操作

---

## 核心原则

**未经用户明确同意，禁止：**
- ❌ 删除任何数据
- ❌ 覆盖/清空数据文件
- ❌ 创建新文件替代旧文件
- ❌ 修改历史记录

---

## 数据操作前必须执行的检查清单

### 1. 查找现有数据

```bash
# 必须执行的查找命令
find /workspace -name "*.json" -path "*/data/*" | grep -E "africa|japan|iran"
find /workspace -name "*report*.md" | grep -E "africa|japan|iran"
ls -la /workspace/*/data/
```

### 2. 检查备份

```bash
# 检查备份目录
ls -la /workspace/*/backups/
ls -la /workspace/memory/backups/
```

### 3. 确认数据状态

```python
# 读取前必须验证
import json
import os

file_path = "data/reports.json"

if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    print(f"现有数据: {len(data)} 条")
    print(f"最新记录: {data[0]['time'] if data else '无'}")
else:
    print("⚠️ 数据文件不存在，需要查找历史数据")
    # 必须执行查找，不能直接创建
```

---

## 数据操作流程

### 正确流程（✅）

```
1. 询问用户意图
   ↓
2. 查找现有数据文件
   ↓
3. 查找历史备份
   ↓
4. 读取现有数据
   ↓
5. 展示数据摘要给用户确认
   ↓
6. 用户确认后执行操作
   ↓
7. 备份原数据
   ↓
8. 追加/更新数据
   ↓
9. 验证数据完整性
   ↓
10. 部署更新
```

### 错误流程（❌）

```
1. 直接创建新文件 ← 错误！
   ↓
2. 只写入新数据 ← 错误！
   ↓
3. 历史数据丢失 ← 严重后果！
```

---

## 强制确认场景

以下操作**必须**先询问用户：

| 操作 | 确认话术 |
|------|---------|
| 创建新数据文件 | "数据文件不存在，是否创建新文件？建议先查找历史数据。" |
| 覆盖现有文件 | "发现现有数据文件（X条记录），是否覆盖？建议先备份。" |
| 删除数据 | "将删除 X 条历史记录，是否确认？" |
| 清空重置 | "将清空所有数据，此操作不可恢复，是否确认？" |
| 迁移数据 | "将迁移 X 条记录到新格式，是否确认？" |

---

## 数据备份规范

### 自动备份

```python
def backup_data(file_path):
    """操作前自动备份"""
    import shutil
    from datetime import datetime
    
    if os.path.exists(file_path):
        backup_path = f"{file_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy2(file_path, backup_path)
        print(f"✓ 已备份: {backup_path}")
        return backup_path
    return None
```

### 备份位置

- 原目录: `data/reports.json`
- 备份: `data/reports.json.backup.20260304_235000`
- 备份目录: `data/backups/`

---

## 历史数据恢复流程

### 发现数据丢失时

1. **立即停止操作**
2. **查找历史文件**
   ```bash
   find /workspace -name "*japan*" -type f \( -name "*.json" -o -name "*.md" \)
   ```
3. **查找备份**
   ```bash
   ls -la /workspace/japan-intelligence/data/backups/
   ```
4. **询问用户**
   > "发现历史数据文件 `japan_report_20260302.md`，是否恢复到看板？"
5. **恢复并验证**
6. **部署更新**

---

## 教训总结

### 2026-03-04 日本看板数据丢失事件

**问题**: 日本看板历史数据被清空，只剩2条今天报告

**原因**:
1. 未先查找现有数据文件
2. 直接创建了新空文件
3. 未询问用户确认

**后果**: 3月1-2日的历史报告丢失

**恢复**: 从 `japan_report_20260302.md` 恢复数据

**改进**: 建立本操作规范

---

## 检查清单（每次数据操作前）

- [ ] 是否查找了现有数据文件？
- [ ] 是否检查了备份？
- [ ] 是否读取了现有数据？
- [ ] 是否向用户展示了数据摘要？
- [ ] 是否获得了用户明确确认？
- [ ] 是否备份了原数据？
- [ ] 操作后是否验证了数据完整性？

---

*最后更新: 2026-03-04*  
*维护者: 侧影*
