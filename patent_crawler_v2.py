#!/usr/bin/env python3
"""
Google Patents 网页爬虫 - 使用 requests + 正则解析
"""

import requests
import re
import json
import time
from datetime import datetime
from urllib.parse import quote

class GooglePatentsWebCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
    
    def search_google_patents(self, query: str, country: str = None, after: str = None, before: str = None, num: int = 20):
        """
        搜索 Google Patents
        """
        # 构造搜索查询
        search_terms = [query]
        if country:
            search_terms.append(f"country:{country}")
        if after:
            search_terms.append(f"after:priority:{after}")
        if before:
            search_terms.append(f"before:priority:{before}")
        
        q = " ".join(search_terms)
        url = f"https://patents.google.com/?q={quote(q)}&type=PATENT&num={num}"
        
        print(f"搜索URL: {url[:100]}...")
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code == 200:
                return self._parse_results(response.text)
            else:
                print(f"请求失败: {response.status_code}")
                return []
        except Exception as e:
            print(f"请求出错: {e}")
            return []
    
    def _parse_results(self, html: str):
        """
        解析搜索结果HTML
        Google Patents 使用 JavaScript 动态加载，这里使用简化解析
        """
        patents = []
        
        # 尝试提取专利标题和ID
        # 格式通常在 window._initData 中
        init_data_match = re.search(r'window\._initData\s*=\s*({.+?});', html, re.DOTALL)
        
        if init_data_match:
            try:
                data = json.loads(init_data_match.group(1))
                results = data.get('results', {}).get('cluster', [])
                
                for result in results:
                    patent = result.get('patent', {})
                    if patent:
                        patents.append({
                            'patent_number': patent.get('publication_number', ''),
                            'title': patent.get('title', ''),
                            'abstract': patent.get('abstract', ''),
                            'assignee': patent.get('assignee', 'Unknown'),
                            'date': patent.get('filing_date', ''),
                            'url': f"https://patents.google.com/patent/{patent.get('publication_number', '')}"
                        })
            except json.JSONDecodeError:
                pass
        
        # 备用：正则提取
        if not patents:
            # 提取专利标题
            titles = re.findall(r'"title":"([^"]+)"', html)
            # 提取专利号
            numbers = re.findall(r'"publication_number":"([^"]+)"', html)
            
            for i, (title, number) in enumerate(zip(titles[:20], numbers[:20])):
                patents.append({
                    'patent_number': number,
                    'title': title,
                    'abstract': '',
                    'assignee': 'Unknown',
                    'date': '',
                    'url': f"https://patents.google.com/patent/{number}"
                })
        
        return patents
    
    def search_rare_earth_comprehensive(self):
        """
        综合搜索稀土相关专利
        """
        # 日期范围：2024-01-01 至今
        after_date = "2024-01-01"
        before_date = "2025-12-31"
        
        # 搜索关键词组合
        queries = [
            "rare earth",
            "rare earth magnet",
            "rare earth separation",
            "neodymium iron boron",
            "rare earth extraction",
            "稀土",
            "永磁材料"
        ]
        
        # 国家代码
        countries = {
            'CN': '中国',
            'US': '美国',
            'EP': '欧洲',
            'AU': '澳大利亚'
        }
        
        all_results = {}
        
        print("=" * 60)
        print("Google Patents 稀土专利爬虫")
        print(f"时间范围: {after_date} 至 {before_date}")
        print("=" * 60)
        
        for country_code, country_name in countries.items():
            print(f"\n【{country_name} ({country_code})】")
            country_patents = []
            
            for query in queries[:3]:  # 每个国家取前3个关键词，避免请求过多
                print(f"  搜索: {query}...", end=" ")
                patents = self.search_google_patents(
                    query=query,
                    country=country_code,
                    after=after_date,
                    before=before_date,
                    num=20
                )
                print(f"找到 {len(patents)} 条")
                country_patents.extend(patents)
                time.sleep(2)  # 避免请求过快
            
            # 去重
            seen = set()
            unique = []
            for p in country_patents:
                pn = p.get('patent_number', '')
                if pn and pn not in seen:
                    seen.add(pn)
                    unique.append(p)
            
            all_results[country_name] = unique
            print(f"  {country_name} 去重后: {len(unique)} 条")
        
        return all_results
    
    def save_results(self, results: dict, filename: str = None):
        """保存结果"""
        if not filename:
            filename = f"rare_earth_patents_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 结果已保存: {filename}")
        return filename
    
    def generate_summary(self, results: dict) -> str:
        """生成摘要报告"""
        lines = []
        lines.append("# 稀土专利搜索报告")
        lines.append(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        lines.append("")
        
        total = 0
        for country, patents in results.items():
            count = len(patents)
            total += count
            lines.append(f"- {country}: {count} 条专利")
        
        lines.append(f"- **总计: {total} 条**")
        lines.append("")
        
        # 各国详情
        for country, patents in results.items():
            lines.append(f"## {country}")
            if patents:
                for i, p in enumerate(patents[:5], 1):
                    lines.append(f"{i}. {p.get('title', 'N/A')}")
                    lines.append(f"   - 专利号: {p.get('patent_number', 'N/A')}")
                    lines.append(f"   - 链接: {p.get('url', '')}")
                    lines.append("")
            else:
                lines.append("未找到相关专利")
                lines.append("")
        
        return "\n".join(lines)


def main():
    crawler = GooglePatentsWebCrawler()
    
    # 执行搜索
    results = crawler.search_rare_earth_comprehensive()
    
    # 保存JSON
    json_file = crawler.save_results(results)
    
    # 生成并保存报告
    report = crawler.generate_summary(results)
    report_file = f"rare_earth_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ 报告已保存: {report_file}")
    print("\n" + "=" * 60)
    print("报告预览:")
    print("=" * 60)
    print(report[:1500])
    print("...")


if __name__ == "__main__":
    main()
