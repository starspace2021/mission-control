# 大模型、多智能体与OpenClaw在审计中的应用

**面向审计人员的AI技术培训**

培训时长：60分钟  
制作日期：2026年2月23日

---

## 目录

1. 第一部分：什么是大模型（15分钟）
2. 第二部分：多智能体系统（15分钟）
3. 第三部分：OpenClaw实战（25分钟）
4. 第四部分：如何上手（5分钟）
5. Q&A互动（5分钟）

---

## 第一部分：什么是大模型

### 1.1 大模型基本概念

**定义**：基于海量数据训练的深度学习模型

**特点**：
- 参数规模大（数十亿至数千亿）
- 能力强、通用性好
- 代表：GPT、DeepSeek、Kimi等

**通俗理解**：像一个读过海量书籍的"超级大脑"

---

### 1.2 大模型 vs 传统AI

| 对比维度 | 传统AI | 大模型 |
|---------|--------|--------|
| 训练数据 | 少量标注数据 | 海量文本数据 |
| 能力范围 | 单一任务 | 多任务通用 |
| 理解能力 | 模式匹配 | 语义理解 |
| 使用门槛 | 需要专业开发 | 自然语言交互 |

---

### 1.3 审计场景应用示例

**文档分析**：
- 自动读取审计材料
- 提取关键信息

**风险识别**：
- 基于规则+模型识别异常

**报告生成**：
- 自动撰写审计发现
- 自动匹配法规条款

---

## 第二部分：多智能体系统

### 2.1 多智能体概念

**定义**：多个AI智能体协作完成复杂任务

**核心思想**：
- 分工协作
- 专业分工
- 结果汇总

**类比**：像一个审计团队，每个人负责不同领域

---

### 2.2 审计代码中的多智能体

```python
AGENTS = [
    Agent(name="A1_会议与重大事项决策程序", ...),
    Agent(name="A2_重大项目与预算支付链条", ...),
    Agent(name="A3_财务真实性与凭证完整性", ...),
    Agent(name="A4_国有资产形成与计价证据", ...),
    Agent(name="A5_内控执行与自评一致性", ...),
    Agent(name="A6_审计整改闭环证据", ...),
]
```

**6个专业审计Agent**：
- A1：会议与重大事项决策程序
- A2：重大项目与预算支付链条
- A3：财务真实性与凭证完整性
- A4：国有资产形成与计价证据
- A5：内控执行与自评一致性
- A6：审计整改闭环证据

---

### 2.3 多智能体工作流程

```
1. 任务分解
   将审计任务拆分为6个子任务

2. 并行执行
   6个Agent同时分析不同领域

3. 结果汇总
   ReportAgent整合所有发现

4. 报告生成
   输出结构化审计报告
```

---

### 2.4 多智能体优势

✅ **专业化**  
每个Agent专注特定领域

✅ **并行化**  
多任务同时执行，提升效率

✅ **可扩展**  
新增Agent即可扩展能力

✅ **可维护**  
单个Agent更新不影响其他

---

## 第三部分：OpenClaw实战

### 3.1 OpenClaw架构

```
Human Director (Hourglass)
    ↓
Chief AI Officer (侧影)
    ↓
├─ Africa Intel Dept (3人)
├─ US-China Policy Dept (2人)
├─ Financial Intel Dept (2人)
├─ Engineering Dept (3人)
└─ Memory & Admin Dept (2人)
```

---

### 3.2 OpenClaw vs 审计代码

| 维度 | 审计Python脚本 | OpenClaw |
|------|---------------|----------|
| Agent数量 | 6个审计Agent | 12个业务Agent |
| 调度方式 | 代码硬编码 | 动态任务调度 |
| 交互方式 | 命令行运行 | 飞书+Web界面 |
| 部署方式 | 本地运行 | 云端自动部署 |

---

### 3.3 OpenClaw核心特性

🕐 **定时任务**  
自动执行日报/简报

📱 **多渠道输出**  
飞书、邮件、Web

📊 **实时监控**  
任务状态、团队看板

🔄 **自动迭代**  
每日优化方案生成

---

### 3.4 演示1：情报收集

**非洲情报**：
- 07:00 日报
- 16:00 / 20:00 / 23:00 简报

**美国对华政策**：
- 07:00 日报
- 20:00 / 00:00 简报

**Polymarket市场**：
- 06:00 日报
- 12:00 / 17:00 / 20:00 / 22:00 简报

---

### 3.5 演示2：报告生成

**自动汇总**：
- 多源信息整合
- 结构化分析

**报告输出**：
- Markdown格式
- Word文档
- 自动发送邮箱

**质量评估**：
- 覆盖率检查
- 准确性评分

---

### 3.6 演示3：团队协作

**14个Agent实时状态**：
- 在线/工作中/待命

**任务分配**：
- 自动调度
- 负载均衡

**质量监控**：
- 执行成功率
- 输出质量评分

---

## 第四部分：如何上手

### 4.1 审计人员入门路径

**第1步：理解概念**  
大模型、多智能体基本原理

**第2步：体验工具**  
使用OpenClaw完成简单任务

**第3步：定制需求**  
根据审计场景调整Agent

**第4步：持续优化**  
基于反馈迭代改进

---

### 4.2 关键技能

📝 **提示词工程**  
Prompt Engineering

🎯 **任务分解**  
Agent设计与分工

✅ **结果评估**  
质量控制与验证

📚 **法规知识**  
业务理解与应用

---

### 4.3 资源推荐

📖 **OpenClaw文档**  
https://docs.openclaw.ai

💻 **示例代码**  
经济责任审计1.3.py

🌐 **实践平台**  
https://mission-control-sigma-six.vercel.app

📧 **联系方式**  
Hourglass / 侧影

---

## Q&A 互动环节

### 常见问题

**Q1：大模型输出不准确怎么办？**  
A：多模型交叉验证 + 人工复核

**Q2：多智能体如何协调避免冲突？**  
A：明确分工边界 + 统一输出格式

**Q3：审计数据安全如何保障？**  
A：本地部署 + 数据脱敏 + 权限控制

**Q4：如何评估AI审计结果质量？**  
A：设定评估指标 + 抽样验证

---

## 附录：代码详解

### A.1 Agent定义代码

```python
@dataclass
class Agent:
    name: str
    scope: List[str]
    system_prompt: str
    
    def run(self, client: OpenAI, case: Dict[str, Any]) -> List[Finding]:
        # 1. 选择相关上下文
        ctx = select_context(case, self.scope)
        
        # 2. 调用DeepSeek
        raw = call_deepseek_chat(
            client, 
            system=self.system_prompt,
            user=user_prompt
        )
        
        # 3. 解析JSON结果
        arr = try_parse_json_array(raw)
        
        # 4. 返回Finding列表
        return findings
```

---

### A.2 6个审计Agent定义

```python
AGENTS = [
    Agent(
        name="A1_会议与重大事项决策程序",
        scope=["01_会议纪要", "02_重大项目台账"],
        system_prompt="审计任期内会议纪要与重大事项决策程序..."
    ),
    Agent(
        name="A2_重大项目与预算支付链条",
        scope=["02_重大项目台账", "03_财务账_凭证"],
        system_prompt="审计重大项目台账与支付链条是否匹配..."
    ),
    # ... A3-A6 类似
]
```

---

### A.3 主流程代码

```python
def main():
    # 1. 加载材料
    case = load_case(case_dir)
    
    # 2. 多智能体审计
    all_findings = []
    for agent in AGENTS:
        findings = agent.run(client, case)
        all_findings.extend(findings)
    
    # 3. 汇总报告
    report = synthesize(client, case["meta"], all_findings)
    
    # 4. 输出结果
    export_word(case_dir, case["meta"], all_findings, report)
```

---

## 感谢聆听

**大模型、多智能体与OpenClaw在审计中的应用**

---

*培训材料制作：侧影*  
*日期：2026年2月23日*
