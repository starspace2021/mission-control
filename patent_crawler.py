#!/usr/bin/env python3
"""
Google Patents 稀土专利爬虫
爬取中/美/欧/澳四国稀土相关专利
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any

class GooglePatentsCrawler:
    def __init__(self):
        self.base_url = "https://patents.google.com/api/patents"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def search_patents(self, query: str, country: str, date_range: str, max_results: int = 100) -> List[Dict]:
        """
        搜索专利
        query: 搜索关键词
        country: 国家代码 (CN/US/EP/AU)
        date_range: 日期范围 (如 20240101-20251231)
        """
        patents = []
        
        # Google Patents 搜索URL构造
        search_query = f"{query} country:{country} before:priority:{date_range}"
        
        # 构造搜索参数
        params = {
            'q': search_query,
            'type': 'patent',
            'language': 'ENGLISH',
            'num': min(max_results, 100)
        }
        
        try:
            # 注意：Google Patents 实际使用前端渲染，需要模拟浏览器或使用替代API
            # 这里使用公开可用的专利数据API
            url = f"https://api.patentsview.org/patents/query"
            
            # 构建查询
            query_body = {
                "q": {
                    "_and": [
                        {"_text_any": {"patent_title": query.split()}},
                        {"patent_date": {"_gte": date_range.split('-')[0]}},
                        {"patent_date": {"_lte": date_range.split('-')[1]}}
                    ]
                },
                "f": [
                    "patent_number",
                    "patent_title",
                    "patent_abstract",
                    "patent_date",
                    "patent_kind",
                    "assignee_organization",
                    "inventor_first_name",
                    "inventor_last_name",
                    "cpc_group_id",
                    "patent_citation_count"
                ],
                "o": {"per_page": max_results}
            }
            
            response = requests.post(url, json=query_body, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                patents_list = data.get('patents', [])
                
                for patent in patents_list:
                    patents.append({
                        'patent_number': patent.get('patent_number', ''),
                        'title': patent.get('patent_title', ''),
                        'abstract': patent.get('patent_abstract', ''),
                        'date': patent.get('patent_date', ''),
                        'assignee': patent.get('assignee_organization', 'Unknown'),
                        'inventors': self._format_inventors(patent),
                        'cpc': patent.get('cpc_group_id', ''),
                        'citations': patent.get('patent_citation_count', 0)
                    })
                    
        except Exception as e:
            print(f"搜索出错: {e}")
            
        return patents
    
    def _format_inventors(self, patent: Dict) -> str:
        """格式化发明人信息"""
        inventors = []
        if 'inventors' in patent:
            for inv in patent['inventors']:
                first = inv.get('inventor_first_name', '')
                last = inv.get('inventor_last_name', '')
                inventors.append(f"{first} {last}".strip())
        return ', '.join(inventors) if inventors else 'Unknown'
    
    def search_rare_earth_patents(self) -> Dict[str, List[Dict]]:
        """
        搜索稀土相关专利
        覆盖中/美/欧/澳四个地区
        """
        # 计算日期范围：过去两年
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)
        
        date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
        
        # 搜索关键词
        keywords = [
            "rare earth",
            "rare earth magnet",
            "rare earth separation",
            "rare earth extraction",
            "neodymium",
            "dysprosium",
            "terbium"
        ]
        
        # 国家代码映射
        countries = {
            'US': '美国',
            'CN': '中国', 
            'EP': '欧洲',
            'AU': '澳大利亚'
        }
        
        results = {}
        
        print(f"开始爬取稀土专利数据...")
        print(f"时间范围: {date_range}")
        print(f"关键词: {', '.join(keywords)}")
        print("-" * 60)
        
        for country_code, country_name in countries.items():
            print(f"\n正在搜索 {country_name}({country_code}) 的专利...")
            
            country_patents = []
            for keyword in keywords:
                patents = self.search_patents(keyword, country_code, date_range, max_results=50)
                country_patents.extend(patents)
                print(f"  - 关键词 '{keyword}': 找到 {len(patents)} 条专利")
                time.sleep(1)  # 避免请求过快
            
            # 去重
            seen = set()
            unique_patents = []
            for p in country_patents:
                if p['patent_number'] not in seen:
                    seen.add(p['patent_number'])
                    unique_patents.append(p)
            
            results[country_name] = unique_patents
            print(f"  {country_name} 总计: {len(unique_patents)} 条唯一专利")
        
        return results
    
    def export_to_json(self, results: Dict[str, List[Dict]], filename: str = None):
        """导出结果为JSON"""
        if filename is None:
            filename = f"rare_earth_patents_{datetime.now().strftime('%Y%m%d')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n数据已导出到: {filename}")
        return filename
    
    def generate_report(self, results: Dict[str, List[Dict]]) -> str:
        """生成分析报告"""
        report = []
        report.append("# 稀土专利技术分析报告")
        report.append(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        report.append(f"数据范围: 过去两年 (2024-2025)")
        report.append("")
        
        # 统计概览
        report.append("## 统计概览")
        total = 0
        for country, patents in results.items():
            count = len(patents)
            total += count
            report.append(f"- {country}: {count} 条专利")
        report.append(f"- **总计: {total} 条专利**")
        report.append("")
        
        # 各国详情
        for country, patents in results.items():
            report.append(f"## {country} 专利详情")
            report.append("")
            
            if not patents:
                report.append("暂无数据")
                report.append("")
                continue
            
            # 按引用次数排序
            sorted_patents = sorted(patents, key=lambda x: x.get('citations', 0), reverse=True)
            
            # 取前10条
            for i, p in enumerate(sorted_patents[:10], 1):
                report.append(f"### {i}. {p['title']}")
                report.append(f"- 专利号: {p['patent_number']}")
                report.append(f"- 申请日期: {p['date']}")
                report.append(f"- 申请人: {p['assignee']}")
                report.append(f"- 发明人: {p['inventors']}")
                report.append(f"- 引用次数: {p['citations']}")
                report.append(f"- 摘要: {p['abstract'][:200]}..." if len(p['abstract']) > 200 else f"- 摘要: {p['abstract']}")
                report.append("")
        
        return "\n".join(report)


def main():
    """主函数"""
    crawler = GooglePatentsCrawler()
    
    # 搜索稀土专利
    results = crawler.search_rare_earth_patents()
    
    # 导出JSON
    json_file = crawler.export_to_json(results)
    
    # 生成报告
    report = crawler.generate_report(results)
    
    # 保存报告
    report_file = f"rare_earth_patent_report_{datetime.now().strftime('%Y%m%d')}.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n报告已保存到: {report_file}")
    print("\n报告预览:")
    print("=" * 60)
    print(report[:2000])
    print("...")


if __name__ == "__main__":
    main()
