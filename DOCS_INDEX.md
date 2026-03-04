# 📚 文档索引中心

**作用**: 防止记忆碎片化，统一文档入口  
**维护者**: 侧影  
**更新频率**: 每次新增/修改文档时更新  

---

## 核心文档 (必须读取)

| 文档 | 路径 | 说明 |
|------|------|------|
| **IDENTITY.md** | `/workspace/IDENTITY.md` | 我是谁 |
| **SOUL.md** | `/workspace/SOUL.md` | 我的灵魂 |
| **USER.md** | `/workspace/USER.md` | 我在帮助谁 |
| **AGENTS.md** | `/workspace/AGENTS.md` | 工作空间指南 |
| **MEMORY.md** | `/workspace/MEMORY.md` | 长期记忆 |

---

## 运维文档 (docs/)

| 文档 | 路径 | 说明 | 最后更新 |
|------|------|------|----------|
| **情报看板运维手册** | `docs/intelligence-dashboard-ops.md` | 非洲/日本/伊朗看板运维规范 | 2026-03-04 |
| **数据安全操作规范** | `docs/data-safety-protocol.md` | 数据操作强制规范 | 2026-03-04 |
| **Vercel 迁移指南** | `docs/VERCEL_TRANSFER_GUIDE.md` | Vercel 账号迁移步骤 | - |

---

## 技能文档 (skills/)

| 技能 | 路径 | 说明 |
|------|------|------|
| **qa-monitor** | `skills/qa-monitor/SKILL.md` | QA监控技能 |
| **intelligence-dashboard** | `skills/intelligence-dashboard/SKILL.md` | 情报看板技能 |
| **news-crawler** | `skills/news-crawler/SKILL.md` | 新闻爬虫技能 |
| **polymarket-downloader** | `skills/polymarket-downloader/SKILL.md` | Polymarket数据下载 |
| **iran-intelligence-dashboard** | `skills/iran-intelligence-dashboard/SKILL.md` | 伊朗情报看板 |

---

## 脚本工具 (scripts/)

| 脚本 | 路径 | 说明 |
|------|------|------|
| **install-cron.sh** | `scripts/install-cron.sh` | 安装所有定时任务 |
| **memory-init.sh** | `scripts/memory-init.sh` | 启动时初始化记忆 |

---

## 记忆文档 (memory/)

| 日期 | 文档 | 关键内容 |
|------|------|----------|
| 2026-03-04 | `memory/2026-03-04.md` | 非洲/日本看板修复 |
| 2026-03-03 | `memory/2026-03-03.md` | - |
| 2026-03-02 | `memory/2026-03-02.md` | - |
| 2026-03-01 | `memory/2026-03-01.md` | - |
| 2026-02-23 | `memory/2026-02-23.md` | 任务监控系统创建 |

---

## 项目看板

| 项目 | 看板地址 | 数据位置 |
|------|----------|----------|
| **非洲情报** | https://intelligence-dashboard-mu.vercel.app | `africa-intelligence/data/` |
| **日本情报** | https://japan-intelligence-dashboard.vercel.app | `japan-intelligence/data/` |
| **伊朗情报** | https://iran-intel-dashboard.vercel.app | `iran-intelligence-dashboard/data/` |
| **地缘热点** | https://geopolitical-dashboard.vercel.app | `geopolitical-dashboard/data/` |

---

## 定时任务清单

```bash
# 查看所有定时任务
crontab -l

# 重新安装定时任务
./scripts/install-cron.sh
```

| 任务 | 执行时间 | 负责人 |
|------|----------|--------|
| 非洲政经简报 | 0 0,10,14,17,20 * * * | 孙悟空 |
| 非洲风险简报 | 0 0,10,14,17,20 * * * | 比克 |
| 非洲QA检查 | 5 0,10,14,17,20 * * * | 天津饭 |
| 日本情报简报 | 0 0,6,12,18 * * * | - |
| 日本QA检查 | 5 0,6,12,18 * * * | - |
| 伊朗情报简报 | 0 * * * * | - |
| 伊朗QA检查 | 5 * * * * | - |

---

## 更新记录

| 时间 | 更新内容 |
|------|----------|
| 2026-03-04 | 创建文档索引中心，整合分散的运维文档 |

---

*提示: 每次启动时，先读取此索引，再根据需要读取具体文档。*
