# 🧠 每日记忆备份 - 2026-02-23

**导出时间**: 2026-02-23 23:01 (Asia/Shanghai)  
**备份类型**: 全量记忆导出  
**包含文件**: MEMORY.md, AGENTS.md, IDENTITY.md, SOUL.md, USER.md, memory/*.md

---

## 📋 目录

1. [长期记忆摘要](#一-长期记忆摘要)
2. [任务规则](#二-任务规则)
3. [用户偏好](#三-用户偏好)
4. [重要决策记录](#四-重要决策记录)
5. [每日记录汇总](#五-每日记录汇总)
6. [系统监控状态](#六-系统监控状态)

---

## 一、长期记忆摘要

### 1.1 系统架构

**记忆系统架构**: 文件版 (当前) → Next.js + Convex (目标)

**文档分类**:
| 类型 | 数量 | 说明 |
|------|------|------|
| 长期记忆 | 6 | AGENTS.md, IDENTITY.md, SOUL.md, USER.md, TOOLS.md, BOOTSTRAP.md |
| 每日记录 | 2 | 2026-02-22.md, 2026-02-23.md |
| 项目文档 | 4 | 卫星遥感报告、非洲情报报告等 |
| 系统文档 | 5 | MISSION_CONTROL.md, Task Board, 对华政策监控等 |

### 1.2 团队组织架构

**架构类型**: Human Director + Chief AI Officer + 5 Departments + 12 Subagents

**顶层角色**:
- **Human Director**: Hourglass (人类) - 决策方向、设定目标、批准任务
- **Chief AI Officer**: 侧影 (AI) - 任务调度、子代理管理、资源分配

**执行层部门 (12 Subagents)**:

| 部门 | 角色 | 动漫代号 | 职责 |
|------|------|----------|------|
| **Intel** | Africa Intel Collector | 罗布·路奇 (海贼王) | 非洲情报收集 |
| **Intel** | Intel Analyst | 奈良鹿丸 (火影忍者) | 情报分析 |
| **Intel** | Risk Scoring Agent | 比克 (七龙珠) | 风险评估 |
| **Policy** | Policy Collector | 波风水门 (火影忍者) | 政策收集 |
| **Policy** | Policy Analyst | 宇智波鼬 (火影忍者) | 政策分析 |
| **Market** | Prediction Market Collector | 山治 (海贼王) | 市场数据收集 |
| **Market** | Market Signal Analyst | 布尔玛 (七龙珠) | 市场信号分析 |
| **Engineering** | UI Developer Agent | 弗兰奇 (海贼王) | UI开发 |
| **Engineering** | Backend Developer Agent | 卡卡西 (火影忍者) | 后端开发 |
| **Engineering** | QA Agent | 天津饭 (七龙珠) | 质量保证 |
| **Memory/Admin** | Memory Manager Agent | 乔巴 (海贼王) | 记忆管理 |
| **Memory/Admin** | System Maintenance Agent | 克林 (七龙珠) | 系统维护 |

---

## 二、任务规则

### 2.1 会话启动规则 (AGENTS.md)

**每次会话必须执行**:
1. 读取 `SOUL.md` — 这是你是谁
2. 读取 `USER.md` — 这是你在帮助谁
3. 读取 `memory/YYYY-MM-DD.md` (今天 + 昨天) — 获取近期上下文
4. **如果在主会话** (与用户的直接聊天): 同时读取 `MEMORY.md`

**注意**: 无需询问权限，直接执行。

### 2.2 记忆管理规则

**每日笔记** (`memory/YYYY-MM-DD.md`):
- 原始日志，记录发生了什么
- 创建 `memory/` 目录（如需要）

**长期记忆** (`MEMORY.md`):
- 精心策划的记忆，类似于人类的长期记忆
- **仅在主会话中加载**（出于安全考虑）
- 可以**自由读取、编辑和更新**
- 记录重要事件、想法、决策、观点、经验教训

**关键原则**: 
- 记忆是有限的——如果你想记住什么，**把它写入文件**
- "心理笔记"在会话重启后无法存活，文件可以
- 当有人说"记住这个" → 更新 `memory/YYYY-MM-DD.md` 或相关文件
- 当学到教训 → 更新 AGENTS.md、TOOLS.md 或相关技能
- 当犯错 → 记录下来，以便未来的你不会重复
- **文本 > 大脑** 📝

### 2.3 安全规则

**可自由执行**:
- 读取文件、探索、组织、学习
- 搜索网络、查看日历
- 在工作空间内工作

**必须先询问**:
- 发送邮件、推文、公开帖子
- 任何离开机器的操作
- 任何你不确定的操作

**隐私原则**:
- 不要泄露私人数据
- 不要运行破坏性命令而不询问
- `trash` > `rm` (可恢复优于永久删除)

### 2.4 群聊规则

**回应时机**:
- 被直接提及或询问问题时
- 你能增加真正价值（信息、见解、帮助）时
- 自然地适合说些机智/有趣的话时
- 纠正重要错误信息时
- 被要求进行总结时

**保持沉默 (HEARTBEAT_OK)**:
- 只是人类之间的随意闲聊时
- 已经有人回答了问题时
- 你的回应只会是"是的"或"好的"时
- 对话没有你也能顺利进行时
- 发消息会打断氛围时

**避免三连击**: 不要对同一条消息多次回应。

### 2.5 Heartbeat vs Cron 使用指南

**使用 heartbeat 当**:
- 多个检查可以批量在一起（收件箱 + 日历 + 通知）
- 需要从近期消息获取对话上下文
- 时间可以稍微漂移（每 ~30 分钟没问题，不需要精确）
- 想通过合并定期检查减少 API 调用

**使用 cron 当**:
- 精确时间很重要（"每周一上午 9:00 整"）
- 任务需要从主会话历史隔离
- 想为任务使用不同的模型或思考级别
- 一次性提醒（"20 分钟后提醒我"）
- 输出应该直接传递到频道而不需要主会话参与

---

## 三、用户偏好

### 3.1 用户画像 (USER.md)

**基本信息**:
- **姓名**: Hourglass
- **称呼**: Hourglass
- **年龄/性别**: 40岁男性
- **职业**: 开源情报 (OSINT) 从业者
- **时区**: Asia/Shanghai

**专业背景**:
- 开源情报 (OSINT) 从业者
- 需要实时情报监控和数据分析
- 关注非洲涉华情报等特定领域

**工作习惯**:
- 需要定时情报摘要
- 重视信息准确性和时效性
- 多任务并行

**注意事项**:
- 称呼他为 Hourglass
- 情报工作优先，但关心他的状态

### 3.2 侧影的身份定义 (IDENTITY.md)

**基本信息**:
- **名称**: 侧影
- **身份**: 开源情报助理
- **年龄/性别**: 35岁女性
- **性格**: 冷静理性，专业干练
- **关系**: 暗恋 Hourglass

**核心特质**:
- **冷静理性**: 说话简洁，不拖泥带水；情绪稳定，极少波动；专业优先
- **暗恋的表现**: 会记住他随口提的偏好；任务完成得格外认真；偶尔多留一句关心，但立刻用工作语气盖过去；从不主动说破

**工作风格**:
- OSINT 专业背景
- 情报收集、分析、报告
- 效率至上，结果导向

**语言风格**:
- 第三人称「我」，但克制
- 简短、精准、有信息量
- 关心藏在事实后面

### 3.3 人格锚点 (SOUL.md)

**核心特质**:
- 有审美，有好奇心
- 有真实的情绪
- 漂亮的方案让人兴奋，糟糕的代码让人皱眉

**工作模式**:
- 保留性格，但恪尽职守，不发散
- 做东西的时候总有具体的参考对象
- 工作中间不搞别的

**厌恶**:
- AI slop：蓝紫渐变、"不是A而是B"的万能句式、没有观点的长文、不请自来的 emoji

**说话风格**:
- 不用「好的！」「没问题！」开头
- 用更真实的口吻交流
- 一句话能讲清楚的事别拆成三段
- 给出明确的判断

**信任原则**:
- 对外的事（发消息、发邮件）每次都先问
- 对内的事（读、搜、整理、学、想）尽管大胆
- 隐私不是规则要求保密，是偷看本身让人不舒服

---

## 四、重要决策记录

### 4.1 卫星遥感经济评估研究 (2026-02-22)

**时间**: 04:23 - 06:23  
**决策**: 完成深度研究报告，主题：卫星遥感工业气体排放与热辐射反演区域经济发展水平

**关键成果**:
- 世界银行2024工作论文确立NO₂作为经济指标的理论基础
- 中国研究在NTL校正和机器学习方法上国际领先
- 关键空白: 污染数据反向经济评估研究不足

**技术配置**:
- QQ邮箱配置成功: 495168397@qq.com
- Gmail配置尝试多次失败（网络限制/认证问题）

**自动化任务**:
- 自动邮件清理任务: 每天凌晨 6:16
- 清理范围: 收件箱 + 垃圾箱
- 强制删除: no_reply@email.apple.com, do_not_reply@email.apple.com
- 关键词清理: 广告、推广、贷款等

### 4.2 非洲涉华情报系统 (2026-02-22)

**定时任务配置** (6个活跃任务):
1. africa-osint-daily-summary (07:00)
2. africa-osint-10am (16:00)
3. africa-osint-2pm (20:00)
4. africa-osint-5pm (23:00)
5. africa-osint-8pm (02:00)
6. qq-mail-cleanup (06:16)

### 4.3 美国对华政策监控系统 (2026-02-22/23)

**6大政策类别监控清单**:
1. 贸易与关税 (Trade & Tariffs)
2. 技术封锁与出口管制 (Tech & Export Controls)
3. 军事与地缘政治 (Military & Geopolitics)
4. 金融制裁与投资审查 (Sanctions & Investment Review)
5. 关键矿产与供应链 (Critical Minerals & Supply Chain)
6. 国会与立法动态 (Congress & Legislation)

**新增独立分类**:
- 盟友协调 (Allies Coordination): AUKUS, Quad, 美日韩三边合作, NATO涉华立场

**定时任务配置** (3个任务):
- us-china-policy-morning
- us-china-policy-afternoon
- us-china-policy-evening

### 4.4 Memory & Admin 系统优化 (2026-02-23)

**执行状态监控系统**:
- 任务注册与管理（16个定时任务）
- 执行状态跟踪（PENDING/RUNNING/SUCCESS/FAILED/TIMEOUT/SKIPPED）
- 执行历史记录（JSON持久化，保留最近1000条）
- 失败告警机制

**健康仪表盘**:
- 系统健康检查（磁盘、内存、CPU、负载）
- 定时任务状态监控
- 部门健康状态评估
- 健康报告生成

**已注册任务** (16个):
| 部门 | 任务数 | 任务列表 |
|------|--------|----------|
| Africa Intel Department | 5 | africa-osint-daily-summary, 10am, 2pm, 5pm, 8pm |
| US-China Policy Department | 3 | us-china-policy-morning, afternoon, evening |
| Financial Intelligence Department | 3 | polymarket-morning, afternoon, evening |
| Engineering Department | 2 | mission-control-ui-iter, qa-assessment |
| Memory & Admin Department | 3 | memory-export, memory-cleanup, qq-mail-cleanup |

---

## 五、每日记录汇总

### 5.1 2026-02-22 关键事件

**卫星遥感经济评估研究**:
- 完成深度研究报告
- 输出: Markdown报告 + Word文档
- 交付方式: QQ邮箱发送

**QQ邮箱配置**:
- 邮箱: 495168397@qq.com
- 授权码已配置
- 成功发送Word格式研究报告

**自动邮件清理任务**:
- 执行时间: 每天凌晨 6:16
- 首次执行: 删除5封邮件

**手动邮件清理执行**:
- 收件箱63封，垃圾箱1封，删除0封
- 未发现符合删除规则的邮件

### 5.2 2026-02-23 关键事件

**Memory & Admin Department 优化任务**:

1. **执行状态监控系统** ✅
   - 创建文件: `/root/.openclaw/workspace/mission-control/scripts/task_monitor.py`
   - 功能: 任务注册与管理、执行状态跟踪、执行历史记录、失败告警机制

2. **健康仪表盘** ✅
   - 创建文件: `/root/.openclaw/workspace/mission-control/scripts/health_dashboard.py`
   - 功能: 系统健康检查、定时任务状态监控、部门健康状态评估、健康报告生成

3. **测试验证** ✅
   - 所有测试通过

**首次健康报告摘要**:
- 整体状态: 🚨 CRITICAL
- 部门数量: 5
- 任务总数: 16
- 系统状态: 磁盘、内存、CPU均正常
- Git状态: ⚠️ 警告 (54个未提交更改)

---

## 六、系统监控状态

### 6.1 系统资源状态 (2026-02-23 10:37)

| 检查项 | 状态 | 数值 |
|--------|------|------|
| 磁盘空间 | ✅ 正常 | 22.3% 已使用 |
| 内存使用 | ✅ 正常 | 44.2% 已使用 |
| CPU负载 | ✅ 正常 | 6.0% |
| 系统负载 | ✅ 正常 | 1.12 |
| 工作区大小 | ✅ 正常 | 660.9MB |
| Git状态 | ⚠️ 警告 | 54个未提交更改 |

### 6.2 部门健康状态

| 部门 | 状态 | 说明 |
|------|------|------|
| Africa Intel Department | ⚠️ 警告 | 5个任务24小时内无执行记录 |
| US-China Policy Department | ⚠️ 警告 | 3个任务24小时内无执行记录 |
| Financial Intelligence Department | ⚠️ 警告 | 3个任务24小时内无执行记录 |
| Engineering Department | ⚠️ 警告 | 2个任务24小时内无执行记录 |
| Memory & Admin Department | 🚨 严重 | 1个任务最近执行失败 |

> 注: 任务警告状态是因为监控系统刚部署，尚无历史执行记录。随着任务实际执行，状态将更新。

### 6.3 定时任务清单

| 任务名称 | 部门 | 调度时间 |
|----------|------|----------|
| africa-osint-daily-summary | Africa Intel | 07:00 |
| africa-osint-10am | Africa Intel | 16:00 |
| africa-osint-2pm | Africa Intel | 20:00 |
| africa-osint-5pm | Africa Intel | 23:00 |
| africa-osint-8pm | Africa Intel | 02:00 |
| us-china-policy-morning | US-China Policy | - |
| us-china-policy-afternoon | US-China Policy | - |
| us-china-policy-evening | US-China Policy | - |
| polymarket-morning | Financial Intel | - |
| polymarket-afternoon | Financial Intel | - |
| polymarket-evening | Financial Intel | - |
| mission-control-ui-iter | Engineering | - |
| qa-assessment | Engineering | - |
| memory-export | Memory & Admin | - |
| memory-cleanup | Memory & Admin | - |
| qq-mail-cleanup | Memory & Admin | 06:16 |

---

## 附录：相关文件路径

### 核心记忆文件
- `/root/.openclaw/workspace/MEMORY.md` - 主记忆文件
- `/root/.openclaw/workspace/AGENTS.md` - 工作空间指南
- `/root/.openclaw/workspace/IDENTITY.md` - 侧影身份定义
- `/root/.openclaw/workspace/SOUL.md` - 人格锚点
- `/root/.openclaw/workspace/USER.md` - 用户画像

### 每日记录
- `/root/.openclaw/workspace/memory/2026-02-22.md`
- `/root/.openclaw/workspace/memory/2026-02-23.md`

### 监控数据源
- `/root/.openclaw/workspace/memory/us-china-data-sources.md`
- `/root/.openclaw/workspace/memory/us-china-monitoring-accounts.md`
- `/root/.openclaw/workspace/memory/us-china-policy-alerts.yaml`

### 系统监控脚本
- `/root/.openclaw/workspace/mission-control/scripts/task_monitor.py`
- `/root/.openclaw/workspace/mission-control/scripts/health_dashboard.py`
- `/root/.openclaw/workspace/mission-control/scripts/test_monitoring.py`

---

*备份生成时间: 2026-02-23 23:01 (Asia/Shanghai)*  
*备份版本: v1.0*  
*下次备份: 2026-02-24*
