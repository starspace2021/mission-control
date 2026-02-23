#!/usr/bin/env python3
"""
专利爬取 - 使用 requests 直接请求
"""

import requests
import re
import json
import time
from datetime import datetime
from urllib.parse import quote

def search_patents_simple(query, country, num=20):
    """简单搜索专利"""
    url = f"https://patents.google.com/xhr/query?url=q%3D{quote(query)}%26country%3D{country}%26type%3DPATENT%26num%3D{num}&exp=&download=true"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', {}).get('cluster', [])
            
            patents = []
            for result in results[:num]:
                patent = result.get('patent', {})
                if patent:
                    patents.append({
                        'patent_number': patent.get('publication_number', ''),
                        'title': patent.get('title', ''),
                        'abstract': patent.get('abstract', '')[:200] + '...' if len(patent.get('abstract', '')) > 200 else patent.get('abstract', ''),
                        'assignee': patent.get('assignee', 'Unknown'),
                        'date': patent.get('filing_date', ''),
                        'url': f"https://patents.google.com/patent/{patent.get('publication_number', '')}"
                    })
            return patents
    except Exception as e:
        print(f"请求出错: {e}")
    
    return []

# 执行爬取
print("开始爬取稀土专利...")
print("=" * 60)

countries = {
    'CN': '中国',
    'US': '美国', 
    'EP': '欧洲',
    'AU': '澳大利亚'
}

queries = ['rare earth', 'rare earth magnet', 'neodymium']

all_results = {}

for country_code, country_name in countries.items():
    print(f"\n【{country_name}】")
    country_patents = []
    
    for query in queries:
        print(f"  搜索 '{query}'...", end=" ")
        patents = search_patents_simple(query, country_code, num=15)
        print(f"找到 {len(patents)} 条")
        country_patents.extend(patents)
        time.sleep(1)
    
    # 去重
    seen = set()
    unique = []
    for p in country_patents:
        pn = p['patent_number']
        if pn and pn not in seen:
            seen.add(pn)
            unique.append(p)
    
    all_results[country_name] = unique
    print(f"  去重后: {len(unique)} 条")

# 保存结果
filename = f"rare_earth_patents_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
with open(filename, 'w', encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)

# 生成报告
total = sum(len(v) for v in all_results.values())
print(f"\n{'=' * 60}")
print(f"爬取完成！总计: {total} 条专利")
print(f"结果已保存: {filename}")

# 生成Markdown报告
report_lines = ["# 稀土专利分析报告", f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ""]

for country, patents in all_results.items():
    report_lines.append(f"## {country} ({len(patents)} 条)")
    report_lines.append("")
    for i, p in enumerate(patents[:10], 1):
        report_lines.append(f"{i}. **{p['title']}**")
        report_lines.append(f"   - 专利号: {p['patent_number']}")
        report_lines.append(f"   - 申请人: {p['assignee']}")
        report_lines.append(f"   - 链接: {p['url']}")
        report_lines.append("")
    report_lines.append("")

report_file = f"rare_earth_patent_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
with open(report_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f"报告已保存: {report_file}")
