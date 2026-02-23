#!/usr/bin/env python3
"""
Africa Intel Department - 关键词权重动态调整系统
功能：根据情报效果和历史数据动态调整关键词权重
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict
import math

@dataclass
class KeywordWeight:
    """关键词权重记录"""
    keyword: str
    base_weight: float  # 基础权重
    dynamic_weight: float  # 动态调整后的权重
    category: str  # 分类
    
    # 统计指标
    hit_count: int = 0  # 命中次数
    intel_generated: int = 0  # 产生的情报数
    high_value_count: int = 0  # 高价值情报数
    
    # 时间衰减
    last_hit: Optional[datetime] = None
    
    # 效果评分
    effectiveness_score: float = 0.5  # 0-1
    
    def to_dict(self) -> Dict:
        return {
            "keyword": self.keyword,
            "base_weight": self.base_weight,
            "dynamic_weight": self.dynamic_weight,
            "category": self.category,
            "hit_count": self.hit_count,
            "intel_generated": self.intel_generated,
            "high_value_count": self.high_value_count,
            "last_hit": self.last_hit.isoformat() if self.last_hit else None,
            "effectiveness_score": self.effectiveness_score
        }

class KeywordWeightAdjuster:
    """关键词权重动态调整器"""
    
    # 默认关键词配置
    DEFAULT_KEYWORDS = {
        # 涉华关键词 - 高基础权重
        "中国": {"base": 1.0, "category": "china"},
        "china": {"base": 1.0, "category": "china"},
        "chinese": {"base": 0.95, "category": "china"},
        "beijing": {"base": 0.95, "category": "china"},
        "belt and road": {"base": 0.95, "category": "china"},
        "一带一路": {"base": 0.95, "category": "china"},
        "investment": {"base": 0.85, "category": "china"},
        "投资": {"base": 0.85, "category": "china"},
        "trade": {"base": 0.80, "category": "china"},
        "贸易": {"base": 0.80, "category": "china"},
        "cooperation": {"base": 0.75, "category": "china"},
        "合作": {"base": 0.75, "category": "china"},
        "mining": {"base": 0.80, "category": "china"},
        "矿产": {"base": 0.80, "category": "china"},
        "infrastructure": {"base": 0.80, "category": "china"},
        "基础设施": {"base": 0.80, "category": "china"},
        "loan": {"base": 0.75, "category": "china"},
        "贷款": {"base": 0.75, "category": "china"},
        "debt": {"base": 0.75, "category": "china"},
        "债务": {"base": 0.75, "category": "china"},
        
        # 地缘政治 - 高基础权重
        "security": {"base": 0.90, "category": "geopolitics"},
        "安全": {"base": 0.90, "category": "geopolitics"},
        "military": {"base": 0.90, "category": "geopolitics"},
        "军事": {"base": 0.90, "category": "geopolitics"},
        "base": {"base": 0.85, "category": "geopolitics"},
        "基地": {"base": 0.85, "category": "geopolitics"},
        "conflict": {"base": 0.90, "category": "geopolitics"},
        "冲突": {"base": 0.90, "category": "geopolitics"},
        "war": {"base": 0.95, "category": "geopolitics"},
        "战争": {"base": 0.95, "category": "geopolitics"},
        "terrorism": {"base": 0.90, "category": "geopolitics"},
        "恐怖主义": {"base": 0.90, "category": "geopolitics"},
        "coup": {"base": 0.95, "category": "geopolitics"},
        "政变": {"base": 0.95, "category": "geopolitics"},
        "election": {"base": 0.75, "category": "geopolitics"},
        "选举": {"base": 0.75, "category": "geopolitics"},
        "diplomatic": {"base": 0.75, "category": "geopolitics"},
        "外交": {"base": 0.75, "category": "geopolitics"},
        "sanctions": {"base": 0.90, "category": "geopolitics"},
        "制裁": {"base": 0.90, "category": "geopolitics"},
        
        # 经济金融
        "economy": {"base": 0.70, "category": "economy"},
        "经济": {"base": 0.70, "category": "economy"},
        "finance": {"base": 0.70, "category": "economy"},
        "金融": {"base": 0.70, "category": "economy"},
        "inflation": {"base": 0.75, "category": "economy"},
        "通胀": {"base": 0.75, "category": "economy"},
        "recession": {"base": 0.80, "category": "economy"},
        "衰退": {"base": 0.80, "category": "economy"},
        "growth": {"base": 0.65, "category": "economy"},
        "增长": {"base": 0.65, "category": "economy"},
        "oil": {"base": 0.80, "category": "economy"},
        "石油": {"base": 0.80, "category": "economy"},
        "gas": {"base": 0.75, "category": "economy"},
        "天然气": {"base": 0.75, "category": "economy"},
        "energy": {"base": 0.75, "category": "economy"},
        "能源": {"base": 0.75, "category": "economy"},
        "commodity": {"base": 0.70, "category": "economy"},
        "大宗商品": {"base": 0.70, "category": "economy"},
        
        # 关键国家
        "nigeria": {"base": 0.85, "category": "country"},
        "尼日利亚": {"base": 0.85, "category": "country"},
        "south africa": {"base": 0.85, "category": "country"},
        "南非": {"base": 0.85, "category": "country"},
        "egypt": {"base": 0.80, "category": "country"},
        "埃及": {"base": 0.80, "category": "country"},
        "kenya": {"base": 0.80, "category": "country"},
        "肯尼亚": {"base": 0.80, "category": "country"},
        "ethiopia": {"base": 0.80, "category": "country"},
        "埃塞俄比亚": {"base": 0.80, "category": "country"},
        "ghana": {"base": 0.75, "category": "country"},
        "加纳": {"base": 0.75, "category": "country"},
        "angola": {"base": 0.75, "category": "country"},
        "安哥拉": {"base": 0.75, "category": "country"},
        "tanzania": {"base": 0.75, "category": "country"},
        "坦桑尼亚": {"base": 0.75, "category": "country"},
        "drc": {"base": 0.75, "category": "country"},
        "刚果": {"base": 0.75, "category": "country"},
        
        # 区域组织
        "au": {"base": 0.80, "category": "organization"},
        "african union": {"base": 0.80, "category": "organization"},
        "非盟": {"base": 0.80, "category": "organization"},
        "ecowas": {"base": 0.75, "category": "organization"},
        "西非经共体": {"base": 0.75, "category": "organization"},
        "afcfta": {"base": 0.75, "category": "organization"},
        "非洲自贸区": {"base": 0.75, "category": "organization"},
        
        # 其他重要
        "climate": {"base": 0.65, "category": "other"},
        "气候": {"base": 0.65, "category": "other"},
        "health": {"base": 0.70, "category": "other"},
        "健康": {"base": 0.70, "category": "other"},
        "pandemic": {"base": 0.80, "category": "other"},
        "疫情": {"base": 0.80, "category": "other"},
    }
    
    def __init__(self, workspace_dir: str = None):
        self.workspace_dir = Path(workspace_dir or "/root/.openclaw/workspace")
        self.config_dir = self.workspace_dir / "mission-control" / "config" / "africa"
        self.weights_file = self.config_dir / "keyword_weights.json"
        self.history_file = self.config_dir / "keyword_history.json"
        
        # 创建目录
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # 关键词权重表
        self.keywords: Dict[str, KeywordWeight] = {}
        
        # 历史反馈数据
        self.feedback_history: List[Dict] = []
        
        # 加载配置
        self._load_weights()
        self._load_history()
    
    def _load_weights(self):
        """加载关键词权重"""
        if self.weights_file.exists():
            try:
                with open(self.weights_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data.get('keywords', []):
                        kw = KeywordWeight(
                            keyword=item['keyword'],
                            base_weight=item['base_weight'],
                            dynamic_weight=item['dynamic_weight'],
                            category=item['category'],
                            hit_count=item.get('hit_count', 0),
                            intel_generated=item.get('intel_generated', 0),
                            high_value_count=item.get('high_value_count', 0),
                            last_hit=datetime.fromisoformat(item['last_hit']) if item.get('last_hit') else None,
                            effectiveness_score=item.get('effectiveness_score', 0.5)
                        )
                        self.keywords[kw.keyword] = kw
            except Exception as e:
                print(f"加载权重失败: {e}")
        
        # 初始化默认关键词
        if not self.keywords:
            self._init_default_keywords()
    
    def _init_default_keywords(self):
        """初始化默认关键词"""
        for keyword, config in self.DEFAULT_KEYWORDS.items():
            self.keywords[keyword] = KeywordWeight(
                keyword=keyword,
                base_weight=config["base"],
                dynamic_weight=config["base"],
                category=config["category"]
            )
        self._save_weights()
    
    def _save_weights(self):
        """保存关键词权重"""
        try:
            data = {
                "last_updated": datetime.now().isoformat(),
                "keyword_count": len(self.keywords),
                "keywords": [kw.to_dict() for kw in self.keywords.values()]
            }
            with open(self.weights_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存权重失败: {e}")
    
    def _load_history(self):
        """加载历史反馈"""
        if self.history_file.exists():
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.feedback_history = data.get('feedback', [])
            except Exception as e:
                print(f"加载历史失败: {e}")
    
    def _save_history(self):
        """保存历史反馈"""
        try:
            data = {
                "last_updated": datetime.now().isoformat(),
                "feedback_count": len(self.feedback_history),
                "feedback": self.feedback_history[-1000:]  # 保留最近1000条
            }
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存历史失败: {e}")
    
    def record_hit(self, keyword: str, intel_value: float = 0.5):
        """
        记录关键词命中
        intel_value: 情报价值 (0-1)
        """
        if keyword not in self.keywords:
            return
        
        kw = self.keywords[keyword]
        kw.hit_count += 1
        kw.intel_generated += 1
        kw.last_hit = datetime.now()
        
        if intel_value >= 0.7:  # 高价值情报
            kw.high_value_count += 1
        
        # 更新效果评分（移动平均）
        kw.effectiveness_score = 0.9 * kw.effectiveness_score + 0.1 * intel_value
        
        self._save_weights()
    
    def calculate_dynamic_weight(self, keyword: str) -> float:
        """计算动态权重"""
        if keyword not in self.keywords:
            return 0.5
        
        kw = self.keywords[keyword]
        
        # 基础权重
        weight = kw.base_weight
        
        # 效果调整
        effectiveness_factor = 0.5 + kw.effectiveness_score  # 0.5 - 1.5
        weight *= effectiveness_factor
        
        # 热度调整（近期命中次数）
        if kw.last_hit:
            hours_since_hit = (datetime.now() - kw.last_hit).total_seconds() / 3600
            if hours_since_hit < 24:
                recency_boost = 1.0 + (0.2 * (1 - hours_since_hit / 24))
                weight *= recency_boost
        
        # 高价值情报比例调整
        if kw.intel_generated > 0:
            high_value_ratio = kw.high_value_count / kw.intel_generated
            weight *= (0.8 + 0.4 * high_value_ratio)  # 0.8 - 1.2
        
        # 归一化到 0-1
        return min(1.0, max(0.1, weight))
    
    def update_all_weights(self):
        """更新所有关键词的动态权重"""
        for keyword in self.keywords:
            self.keywords[keyword].dynamic_weight = self.calculate_dynamic_weight(keyword)
        
        self._save_weights()
        return {k: v.dynamic_weight for k, v in self.keywords.items()}
    
    def get_top_keywords(self, category: str = None, limit: int = 20) -> List[Tuple[str, float]]:
        """获取高权重关键词"""
        keywords = self.keywords.values()
        
        if category:
            keywords = [k for k in keywords if k.category == category]
        
        sorted_keywords = sorted(
            keywords,
            key=lambda k: k.dynamic_weight,
            reverse=True
        )
        
        return [(k.keyword, k.dynamic_weight) for k in sorted_keywords[:limit]]
    
    def add_feedback(self, keywords: List[str], intel_quality: float, user_rating: float = None):
        """
        添加反馈用于权重调整
        intel_quality: 情报质量 (0-1)
        user_rating: 用户评分 (0-1), 可选
        """
        feedback = {
            "timestamp": datetime.now().isoformat(),
            "keywords": keywords,
            "intel_quality": intel_quality,
            "user_rating": user_rating,
            "combined_score": (intel_quality + (user_rating or intel_quality)) / 2
        }
        
        self.feedback_history.append(feedback)
        
        # 更新相关关键词权重
        for keyword in keywords:
            if keyword in self.keywords:
                self.record_hit(keyword, feedback["combined_score"])
        
        self._save_history()
        self.update_all_weights()
    
    def get_category_weights(self) -> Dict[str, float]:
        """获取各类别平均权重"""
        category_weights = defaultdict(list)
        
        for kw in self.keywords.values():
            category_weights[kw.category].append(kw.dynamic_weight)
        
        return {
            cat: sum(weights) / len(weights)
            for cat, weights in category_weights.items()
        }
    
    def export_config(self) -> Dict:
        """导出配置用于情报收集"""
        self.update_all_weights()
        
        return {
            "version": "1.0",
            "generated_at": datetime.now().isoformat(),
            "keywords": {
                kw.keyword: {
                    "weight": kw.dynamic_weight,
                    "category": kw.category
                }
                for kw in self.keywords.values()
            },
            "category_weights": self.get_category_weights(),
            "top_20": self.get_top_keywords(limit=20)
        }

def main():
    """测试关键词权重系统"""
    adjuster = KeywordWeightAdjuster()
    
    print("="*60)
    print("Africa Intel Department - 关键词权重动态调整系统")
    print("="*60)
    
    print(f"\n【关键词统计】")
    print(f"  总计: {len(adjuster.keywords)} 个关键词")
    
    # 显示各类别数量
    categories = defaultdict(int)
    for kw in adjuster.keywords.values():
        categories[kw.category] += 1
    print(f"  分类: {dict(categories)}")
    
    # 显示Top 10关键词
    print(f"\n【Top 10 高权重关键词】")
    for i, (kw, weight) in enumerate(adjuster.get_top_keywords(limit=10), 1):
        print(f"  {i}. {kw}: {weight:.3f}")
    
    # 显示各类别平均权重
    print(f"\n【各类别平均权重】")
    for cat, weight in adjuster.get_category_weights().items():
        print(f"  {cat}: {weight:.3f}")
    
    # 模拟反馈
    print(f"\n【模拟反馈测试】")
    adjuster.add_feedback(
        keywords=["china", "nigeria", "investment"],
        intel_quality=0.9,
        user_rating=0.85
    )
    print("  ✓ 已添加反馈并更新权重")
    
    # 导出配置
    config = adjuster.export_config()
    print(f"\n【导出配置】")
    print(f"  版本: {config['version']}")
    print(f"  生成时间: {config['generated_at']}")
    
    print("\n" + "="*60)
    print("关键词权重系统运行正常")
    print("="*60)

if __name__ == "__main__":
    main()
