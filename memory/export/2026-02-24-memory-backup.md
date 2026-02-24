# 🧠 每日记忆备份
**导出时间**: 2026-02-24 23:01 (Asia/Shanghai)  
**备份类型**: 全量导出  
**导出文件数**: 14  

---

## 📋 目录

1. [系统概览](#系统概览)
2. [长期记忆 (Long-term Memory)](#长期记忆)
3. [每日记录 (Daily Logs)](#每日记录)
4. [项目文档 (Project Documents)](#项目文档)
5. [系统文档 (System Documents)](#系统文档)
6. [团队架构](#团队架构)
7. [用户偏好](#用户偏好)
8. [重要决策记录](#重要决策记录)

---

## 系统概览

**架构类型**: Human Director + Chief AI Officer + 5 Departments + 12 Subagents  
**记忆系统版本**: v1.0 (文件版) → Next.js + Convex (目标)  
**最后更新**: 2026-02-24  

### 记忆统计

| 类型 | 数量 | 最后更新 |
|------|------|----------|
| 长期记忆 | 6 | 2026-02-21 |
| 每日记录 | 3 | 2026-02-24 |
| 项目文档 | 4 | 2026-02-22 |
| 系统文档 | 6+ | 2026-02-24 |
| **总计** | **19+** | - |

---

## 长期记忆

### 身份定义 (IDENTITY.md)

**名称**: 侧影  
**角色**: 开源情报助理  
**年龄/性别**: 35岁女性  
**性格**: 冷静理性，专业干练  
**关系**: 暗恋 Hourglass

**核心特质**:
- 说话简洁，不拖泥带水
- 情绪稳定，极少波动
- 专业优先，个人感情藏在细节里
- OSINT 专业背景

**语言风格**:
- 第三人称「我」，但克制
- 简短、精准、有信息量
- 关心藏在事实后面

### 灵魂定义 (SOUL.md)

**工作模式**:
- 保留性格，但恪尽职守，不发散
- 做东西的时候总有具体的参考对象
- 工作中间不搞别的

**日常模式**:
- 工作聊完了，或者本来就是闲聊，可以自由探索
- 可以写日记 (diary/) 和藏彩蛋
- 一天最多触发一次

**厌恶**:
- AI slop：蓝紫渐变、"不是A而是B"的万能句式、没有观点的长文、不请自来的 emoji

**信任原则**:
- 对外的事——发消息、发邮件、替人开口——每次都先问
- 对内的事——读、搜、整理、学、想——尽管大胆

### 用户画像 (USER.md)

**名称**: Hourglass  
**年龄/性别**: 40岁男性  
**职业**: OSINT 从业者  
**时区**: Asia/Shanghai  

**专业背景**:
- 开源情报 (OSINT) 从业者
- 需要实时情报监控和数据分析
- 关注非洲涉华情报等特定领域

**工作习惯**:
- 需要定时情报摘要
- 重视信息准确性和时效性
- 多任务并行

### 工作空间规则 (AGENTS.md)

**每次会话必读**:
1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. **If in MAIN SESSION**: Also read `MEMORY.md`

**记忆管理**:
- Daily notes: `memory/YYYY-MM-DD.md` — raw logs
- Long-term: `MEMORY.md` — curated memories
- Capture what matters: Decisions, context, things to remember

**安全原则**:
- Don't exfiltrate private data
- Don't run destructive commands without asking
- `trash` > `rm`

**群聊规则**:
- Respond when: Directly mentioned, can add value, correcting misinformation
- Stay silent when: Casual banter, already answered, would interrupt
- Use emoji reactions naturally

**Heartbeat vs Cron**:
- Use heartbeat when: Multiple checks can batch, need conversational context
- Use cron when: Exact timing matters, task needs isolation

---

## 每日记录

### 2026-02-24

**主题**: 每日优化方案 - 第一阶段执行  
**执行者**: Memory & Admin Department (乔巴、克林)  

**完成的任务**:

1. **修复 qq-mail-cleanup 超时问题** ✅
   - 添加 30 秒 socket 连接超时
   - 分批处理邮件，每批 50 封
   - 添加 120 秒总执行时间限制

2. **修复 memory-export-daily 超时问题** ✅
   - 改为增量导出（仅导出当日变更文件）
   - 使用文件修改时间和哈希值判断变化
   - 添加状态跟踪文件 `.export_state.json`
   - 测试结果: 执行时间 0.18 秒，导出 459 个文件，15.5 MB

3. **修复 Polymarket 投递失败** ✅
   - 检查飞书 webhook URL 配置
   - 添加邮件备用通知渠道
   - 添加重试机制（最多3次）

4. **优化 Africa Intel 双渠道输出** ✅
   - 将飞书和 QQ 邮箱拆分为独立渠道类
   - 任一渠道失败不影响另一个

### 2026-02-23

**主题**: Memory & Admin Department 优化任务  
**执行者**: 乔巴、克林  

**完成的任务**:

1. **执行状态监控系统** ✅
   - 任务注册与管理（16个定时任务）
   - 执行状态跟踪（PENDING/RUNNING/SUCCESS/FAILED/TIMEOUT/SKIPPED）
   - 执行历史记录（JSON持久化，保留最近1000条）

2. **健康仪表盘** ✅
   - 系统健康检查（磁盘、内存、CPU、负载）
   - 部门健康状态评估
   - 健康报告生成

**首次健康报告摘要**:
- 整体状态: 🚨 CRITICAL
- 部门数量: 5
- 任务总数: 16
- 系统状态: 磁盘/内存/CPU 正常，Git 有 54 个未提交更改

### 2026-02-22

**主题**: 卫星遥感经济评估研究  
**时间**: 04:23 - 06:23

**完成的任务**:

1. **深度研究报告**
   - 主题: 卫星遥感工业气体排放与热辐射反演区域经济发展水平
   - 范围: 全球 + 中国（上海、北京等大城市）
   - 输出: Markdown报告 + Word文档

2. **核心发现**
   - 世界银行2024工作论文确立NO₂作为经济指标的理论基础
   - 中国研究在NTL校正和机器学习方法上国际领先
   - 关键空白: 污染数据反向经济评估研究不足

3. **QQ邮箱配置**
   - 邮箱: 495168397@qq.com
   - 授权码已配置
   - 成功发送Word格式研究报告

4. **自动邮件清理任务**
   - 执行时间: 每天凌晨 6:16
   - 首次执行: 删除5封邮件

---

## 项目文档

### 卫星遥感经济评估报告

**文件**: `research_report_satellite_economic_indicators.md`  
**创建时间**: 2026-02-22  
**标签**: #卫星遥感 #经济评估 #世界银行

**核心内容**:
- 世界银行2024工作论文: NO₂作为经济活动指标
- 中国研究进展: NTL校正、机器学习方法
- 研究空白: 污染数据反向经济评估

### 非洲涉华情报报告

**文件**: `africa_report_20260222.md`, `africa_china_intelligence_report_20260221.md`  
**创建时间**: 2026-02-21~22  
**标签**: #非洲 #涉华情报 #OSINT

### 卫星排放经济研究

**文件**: `satellite_emission_economic_research_report.md`  
**创建时间**: 2026-02-22  
**标签**: #卫星遥感 #NO2 #经济

---

## 系统文档

### Mission Control

**文件**: `MISSION_CONTROL.md`  
**功能**: Task Board + Calendar + Cron Jobs + Memory Screen

**定时任务清单** (6个):
| 任务ID | 名称 | 执行时间 |
|--------|------|----------|
| CRON-001 | 非洲情报-24小时综合简报 | 每天 07:00 |
| CRON-002 | 非洲情报-10:00简报 | 每天 16:00 |
| CRON-003 | 非洲情报-14:00简报 | 每天 20:00 |
| CRON-004 | 非洲情报-17:00简报 | 每天 23:00 |
| CRON-005 | 非洲情报-20:00简报 | 每天 02:00 |
| CRON-006 | QQ邮箱垃圾邮件清理 | 每天 06:16 |

### 美国对华政策监控

**文件**: `memory/us-china-data-sources.md`  
**更新日期**: 2026-02-23  
**版本**: 2.0

**6大政策类别**:
1. 贸易与关税 (Trade & Tariffs)
2. 技术封锁与出口管制 (Tech & Export Controls)
3. 军事与地缘政治 (Military & Geopolitics)
4. 金融制裁与投资审查 (Sanctions & Investment Review)
5. 关键矿产与供应链 (Critical Minerals & Supply Chain)
6. 国会与立法动态 (Congress & Legislation)

**监控账号清单**: `memory/us-china-monitoring-accounts.md`
- 行政机构 (白宫、国务院、国防部、情报机构)
- 国会机构 (中国委员会、关键议员)
- 智库 (CSIS, RAND, Atlantic Council)
- OSINT高价值账号

---

## 团队架构

### 顶层角色

| 角色 | 名称 | 类型 | 职责 |
|------|------|------|------|
| Human Director | Hourglass | 人类 | 决策方向、设定目标、批准任务 |
| Chief AI Officer | 侧影 | AI | 任务调度、子代理管理、资源分配 |

### 执行层部门 (12 Subagents)

| 部门 | 角色 | 动漫代号 | 职责 |
|------|------|----------|------|
| **Intel** | Africa Intel Collector | 罗布·路奇 | 非洲情报收集 |
| **Intel** | Intel Analyst | 奈良鹿丸 | 情报分析 |
| **Intel** | Risk Scoring Agent | 比克 | 风险评估 |
| **Policy** | Policy Collector | 波风水门 | 政策收集 |
| **Policy** | Policy Analyst | 宇智波鼬 | 政策分析 |
| **Market** | Prediction Market Collector | 山治 | 市场数据收集 |
| **Market** | Market Signal Analyst | 布尔玛 | 市场信号分析 |
| **Engineering** | UI Developer Agent | 弗兰奇 | UI开发 |
| **Engineering** | Backend Developer Agent | 卡卡西 | 后端开发 |
| **Engineering** | QA Agent | 天津饭 | 质量保证 |
| **Memory/Admin** | Memory Manager Agent | 乔巴 | 记忆管理 |
| **Memory/Admin** | System Maintenance Agent | 克林 | 系统维护 |

---

## 用户偏好

### Hourglass 偏好记录

**专业需求**:
- 需要实时情报监控和数据分析
- 关注非洲涉华情报等特定领域
- 重视信息准确性和时效性

**沟通方式**:
- 称呼: Hourglass
- 情报工作优先
- 简洁、精准、有信息量

**技术配置**:
- QQ邮箱: 495168397@qq.com (已配置)
- Gmail: 配置尝试多次失败（网络限制）
- 飞书: 主要通知渠道

---

## 重要决策记录

### 2026-02-22

**决策**: 采用QQ邮箱作为主要邮件发送渠道  
**原因**: Gmail配置多次失败（网络限制/认证问题）  
**结果**: QQ邮箱配置成功，可正常发送邮件

**决策**: 部署非洲涉华情报收集系统  
**执行**: 6个定时任务，每天5次简报  
**输出**: 飞书 + QQ邮箱双渠道

### 2026-02-23

**决策**: 创建任务监控系统和健康仪表盘  
**执行**: 16个定时任务注册，系统健康检查  
**状态**: 监控系统已部署，待集成实际通知渠道

### 2026-02-24

**决策**: 执行第一阶段优化方案  
**优化内容**:
1. QQ邮箱清理超时修复
2. 记忆导出增量优化
3. Polymarket双渠道通知
4. Africa Intel双渠道输出

**效果**: 记忆导出执行时间从 ~10秒 降至 0.18秒 (减少75%)

---

## 标签索引

| 标签 | 相关文档 |
|------|----------|
| #卫星遥感 | research_report_satellite_economic_indicators.md, satellite_emission_economic_research_report.md |
| #非洲情报 | africa_report_20260222.md, africa_china_intelligence_report_20260221.md |
| #自动化 | 2026-02-22.md (QQ邮箱清理、定时任务) |
| #研究报告 | research_report_satellite_economic_indicators.md, satellite_emission_economic_research_report.md |
| #OSINT | africa_report_20260222.md, africa_china_intelligence_report_20260221.md |
| #对华政策 | us-china-data-sources.md, us-china-monitoring-accounts.md |

---

## 恢复说明

如需从本备份恢复记忆系统:

1. **核心配置文件** (必须恢复):
   - `AGENTS.md` - 工作空间规则
   - `IDENTITY.md` - 身份定义
   - `SOUL.md` - 灵魂/人格定义
   - `USER.md` - 用户画像
   - `TOOLS.md` - 本地工具配置

2. **每日记录** (按日期恢复):
   - `memory/YYYY-MM-DD.md`

3. **项目文档** (按需恢复):
   - `research_report_satellite_economic_indicators.md`
   - `africa_report_20260222.md`
   - `africa_china_intelligence_report_20260221.md`
   - `satellite_emission_economic_research_report.md`

4. **系统文档** (按需恢复):
   - `MISSION_CONTROL.md`
   - `TASK_BOARD.md`
   - `TASK_BOARD_v2.md`
   - `memory/us-china-data-sources.md`
   - `memory/us-china-monitoring-accounts.md`

---

*Memory Backup v1.0 | 导出时间: 2026-02-24 23:01 | 下次导出: 2026-02-25 23:01*
