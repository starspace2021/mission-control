# 量子情报周报 v2.0 - 数据处理与报告生成
# 生成日期: 2026-02-24

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from datetime import datetime
import json

# 原始数据收集
# ==================== 批次1: 政策动态 ====================
policy_data = [
    {
        "title": "U.S. Commerce Department Revises License Review Policy for Exports",
        "date": "2026-01-20",
        "source": "quantum.gov/BIS",
        "summary": "美国商务部工业安全局发布最终规则，修订对华和澳门出口某些先进计算商品的许可审查政策，加强量子技术出口管制。",
        "url": "https://www.globalpolicywatch.com/2026/01/u-s-commerce-department-revises-license-review-policy/",
        "intel_score": 9.2
    },
    {
        "title": "EU Updates Dual-Use Export Control List 2025",
        "date": "2025-09-08",
        "source": "European Commission",
        "summary": "欧盟委员会通过授权法规更新欧盟两用物项出口管制清单，将量子系统、半导体和高性能电子产品纳入管制范围。",
        "url": "https://policy.trade.ec.europa.eu/news/2025-update-eu-control-list-dual-use-items",
        "intel_score": 8.8
    },
    {
        "title": "DARPA Quantum Benchmarking Initiative Stage B",
        "date": "2025-11-06",
        "source": "DARPA",
        "summary": "DARPA选定11家公司进入量子基准测试计划第二阶段，目标是在十年内建造容错量子计算机。",
        "url": "https://www.darpa.mil/research/programs/quantum-benchmarking-initiative",
        "intel_score": 8.5
    },
    {
        "title": "DARPA FY2026 Funding Allocations",
        "date": "2026-01-20",
        "source": "DARPA",
        "summary": "DARPA发布2026财年资金分配，预算49亿美元，较2025年增长12%，重点支持量子计算研究。",
        "url": "https://www.quantum-australia.com/news/darpas-2026-funding-opportunities",
        "intel_score": 8.0
    },
    {
        "title": "2025 US National Security Strategy Policy Reset",
        "date": "2026-01-12",
        "source": "U.S. Government",
        "summary": "2025年美国国家安全战略以'美国优先'和现实主义原则为中心，加强对量子技术等新兴技术的出口管制。",
        "url": "https://www.alvarezandmarsal.com/thought-leadership/what-the-2025-us-national-security-strategy-means",
        "intel_score": 7.5
    }
]

# ==================== 批次2: 学术动态 ====================
academic_data = [
    {
        "title": "Fault-tolerant preparation of arbitrary logical states in four-legged cat code",
        "date": "2026-02-20",
        "source": "arXiv",
        "summary": "研究人员提出了在四腿猫编码中制备任意逻辑态的完整容错框架，为容错量子计算提供新途径。",
        "url": "https://arxiv.org/html/2602.17438v1",
        "intel_score": 9.0
    },
    {
        "title": "A fault-tolerant neutral-atom architecture for universal quantum computing",
        "date": "2026-01",
        "source": "Nature",
        "summary": "Nature发表中性原子容错架构研究，实现对逻辑量子比特块的并行控制，支持通用量子计算。",
        "url": "https://www.nature.com/articles/s41586-025-09848-5",
        "intel_score": 9.5
    },
    {
        "title": "IBM lays out clear path to fault-tolerant quantum computing",
        "date": "2026-02",
        "source": "IBM Research",
        "summary": "IBM发布实现大规模容错量子计算机的清晰、严格、全面的框架，目标2029年实现。",
        "url": "https://www.ibm.com/quantum/blog/large-scale-ftqc",
        "intel_score": 9.0
    },
    {
        "title": "Fault-tolerant quantum computation with polylogarithmic overhead",
        "date": "2026-02",
        "source": "Nature Physics",
        "summary": "研究提出多对数开销的容错量子计算方法，显著降低容错量子计算的资源需求。",
        "url": "https://www.nature.com/articles/s41567-025-03102-5",
        "intel_score": 8.5
    },
    {
        "title": "Developments in superconducting erasure qubits for fault-tolerant computing",
        "date": "2026-01-06",
        "source": "arXiv",
        "summary": "超导擦除量子比特研究进展，探讨了纠错与阈值定理对容错量子计算的重要性。",
        "url": "https://arxiv.org/html/2601.02183v2",
        "intel_score": 8.0
    }
]

# ==================== 批次3: 企业动态 ====================
company_data = [
    {
        "title": "Google Quantum AI Shows 13000× Speedup Over Supercomputer",
        "date": "2025-10-22",
        "source": "Google Quantum AI",
        "summary": "Google 65量子比特处理器在复杂物理模拟中比Frontier超级计算机快13000倍，展示可验证量子优势。",
        "url": "https://thequantuminsider.com/2025/10/22/google-quantum-ai-shows-13000x-speedup",
        "intel_score": 9.5
    },
    {
        "title": "IBM Quantum Roadmap 2026: 360 Qubits, 7500 Gates",
        "date": "2026",
        "source": "IBM Quantum",
        "summary": "IBM量子路线图2026年目标：实现360量子比特、7500门操作，为容错量子计算铺平道路。",
        "url": "https://www.ibm.com/roadmaps/quantum/2026/",
        "intel_score": 9.0
    },
    {
        "title": "IonQ Only Quantum Company in 2025 Deloitte Technology Fast 500",
        "date": "2025-11-19",
        "source": "IonQ",
        "summary": "IonQ入选2025德勤科技高成长500强唯一量子计算公司，计划实现200万量子比特系统。",
        "url": "https://www.ionq.com/news/ionq-only-quantum-company-in-2025-deloitte-technology-fast-500",
        "intel_score": 8.5
    },
    {
        "title": "IonQ Acquires Oxford Ionics Trap-on-Chip Technology",
        "date": "2025-06",
        "source": "IonQ",
        "summary": "IonQ整合Oxford Ionics芯片离子阱技术，将单阱量子比特数量大幅提升，加速容错计算路径。",
        "url": "https://s28.q4cdn.com/828571518/files/doc_presentation/2025/25-06-09-Webinar-Presentation.pdf",
        "intel_score": 8.0
    },
    {
        "title": "Quantum Computing Funding Explosive Growth in 2025",
        "date": "2025-10-31",
        "source": "Industry Report",
        "summary": "2025年前5个月量子计算融资已达2024年全年的70%，显示投资者对量子技术的强烈信心。",
        "url": "https://www.spinquanta.com/news-detail/quantum-computing-funding-explosive-growth-strategic-investment-2025",
        "intel_score": 7.5
    }
]

# ==================== 批次4: 中国动态 ====================
china_data = [
    {
        "title": "本源司南量子操作系统开放线上下载",
        "date": "2026-02-24",
        "source": "本源量子",
        "summary": "我国首款自主研发量子计算机操作系统'本源司南'正式开放线上下载，成为全球首个开放下载的量子操作系统。",
        "url": "https://www.iyiou.com/briefing/202602241880791",
        "intel_score": 9.5
    },
    {
        "title": "国盾量子预计2025年扭亏为盈",
        "date": "2026-01-27",
        "source": "国盾量子",
        "summary": "国盾量子预计2025年营收3.1亿元，同比增长22.34%，Q4净利润创近五年单季度新高，量子计算领域收入增长显著。",
        "url": "https://www.cls.cn/detail/2292570",
        "intel_score": 9.0
    },
    {
        "title": "中国量子科技赛道融资超25亿元",
        "date": "2026-02-22",
        "source": "财联社",
        "summary": "2025年初至2026年2月，中国量子科技赛道融资金额达25.16亿元，融资事件25起，赛道加速升温。",
        "url": "https://finance.sina.cn/stock/jdts/2026-02-22/detail-inhnsyqe0743507.d.html",
        "intel_score": 8.5
    },
    {
        "title": "潘建伟院士：祖冲之三号刷新超导体系纪录",
        "date": "2026-01-04",
        "source": "中国科大",
        "summary": "2025年'祖冲之三号'与'祖冲之3.2号'两代产品接连突破，刷新超导体系量子计算纪录。",
        "url": "https://news.ustc.edu.cn/info/1056/93692.htm",
        "intel_score": 9.0
    },
    {
        "title": "量超融合项目在成都启动",
        "date": "2026-01-26",
        "source": "中国量子信息",
        "summary": "国内量超融合项目取得重要进展，2026年1月26日成都启动相关项目，推动量子计算与超算融合。",
        "url": "https://www.c114.com.cn/quantum/5285/a1305557.html",
        "intel_score": 8.0
    }
]

# 合并所有数据
all_data = {
    "policy": policy_data,
    "academic": academic_data,
    "company": company_data,
    "competitive": china_data
}

# 生成执行摘要 (取所有数据中评分最高的10条)
all_items = policy_data + academic_data + company_data + china_data
top_10 = sorted(all_items, key=lambda x: x["intel_score"], reverse=True)[:10]

print("=" * 60)
print("量子情报周报 v2.0 - 数据处理完成")
print("=" * 60)
print(f"\n政策动态: {len(policy_data)} 条")
print(f"学术动态: {len(academic_data)} 条")
print(f"企业动态: {len(company_data)} 条")
print(f"中国动态: {len(china_data)} 条")
print(f"\n执行摘要 TOP 10:")
for i, item in enumerate(top_10, 1):
    print(f"  {i}. [{item['intel_score']}] {item['title'][:50]}...")

# 保存JSON数据
with open('quantum_weekly_2026-02-17_2026-02-24.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print("\n数据已保存至: quantum_weekly_2026-02-17_2026-02-24.json")
