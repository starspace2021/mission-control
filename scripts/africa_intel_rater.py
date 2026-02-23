#!/usr/bin/env python3
"""
Africa Intel Department - 情报重要性自动评级算法
功能：根据多维度指标自动评估情报重要性
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum

class IntelLevel(Enum):
    CRITICAL = 5    # 紧急 - 需要立即关注
    HIGH = 4        # 高 - 重要情报
    MEDIUM = 3      # 中 - 值得关注
    LOW = 2         # 低 - 一般情报
    MINIMAL = 1     # 最低 - 参考信息

@dataclass
class IntelRatingCriteria:
    """评级标准权重配置"""
    # 内容相关权重
    keyword_match_weight: float = 0.25
    entity_count_weight: float = 0.15
    sentiment_weight: float = 0.10
    
    # 来源相关权重
    source_reliability_weight: float = 0.20
    source_influence_weight: float = 0.10
    
    # 时效性权重
    freshness_weight: float = 0.10
    
    # 传播权重
    engagement_weight: float = 0.10

@dataclass
class IntelItem:
    """情报项"""
    id: str
    title: str
    content: str
    source: str
    source_reliability: float  # 0-1
    source_influence: float    # 0-1
    published_at: datetime
    keywords: List[str]
    entities: List[str]
    sentiment: float  # -1 到 1
    engagement_score: float  # 0-1
    url: Optional[str] = None
    
    # 评级结果
    importance_level: Optional[IntelLevel] = None
    importance_score: Optional[float] = None
    rating_factors: Optional[Dict[str, float]] = None

class AfricaIntelRater:
    """非洲情报自动评级器"""
    
    # 高优先级关键词（涉华、地缘政治、经济等）
    HIGH_PRIORITY_KEYWORDS = [
        # 涉华关键词
        "中国", "china", "chinese", "beijing", "belt and road", "一带一路",
        "investment", "投资", "trade", "贸易", "cooperation", "合作",
        "mining", "矿产", "infrastructure", "基础设施", "loan", "贷款",
        "debt", "债务", "bri", "forum", "论坛", "summit", "峰会",
        
        # 地缘政治
        "security", "安全", "military", "军事", "base", "基地",
        "conflict", "冲突", "war", "战争", "terrorism", "恐怖主义",
        "coup", "政变", "election", "选举", "political", "政治",
        "diplomatic", "外交", "bilateral", "双边", "multilateral", "多边",
        
        # 经济金融
        "economy", "经济", "finance", "金融", "currency", "货币",
        "inflation", "通胀", "recession", "衰退", "growth", "增长",
        "oil", "石油", "gas", "天然气", "energy", "能源",
        "commodity", "大宗商品", "price", "价格", "market", "市场",
        
        # 关键国家
        "nigeria", "尼日利亚", "south africa", "南非", "egypt", "埃及",
        "kenya", "肯尼亚", "ethiopia", "埃塞俄比亚", "ghana", "加纳",
        "angola", "安哥拉", "tanzania", "坦桑尼亚", "drc", "刚果",
        "morocco", "摩洛哥", "algeria", "阿尔及利亚", "libya", "利比亚",
        
        # 区域组织
        "au", "非盟", "african union", "ecowas", "西非经共体",
        "eac", "东非共同体", "sadc", "南共体", "afcfta", "非洲自贸区"
    ]
    
    # 中等优先级关键词
    MEDIUM_PRIORITY_KEYWORDS = [
        "africa", "african", "sub-saharan", "撒哈拉以南",
        "development", "发展", "aid", "援助", "humanitarian", "人道主义",
        "climate", "气候", "environment", "环境", "agriculture", "农业",
        "health", "健康", "disease", "疾病", "covid", "pandemic", "疫情",
        "technology", "科技", "digital", "数字", "innovation", "创新",
        "transport", "交通", "port", "港口", "railway", "铁路"
    ]
    
    # 实体类型权重
    ENTITY_WEIGHTS = {
        "PERSON": 0.8,      # 人物
        "ORG": 0.9,         # 组织
        "GPE": 1.0,         # 地缘政治实体（国家、城市）
        "LOC": 0.6,         # 地点
        "EVENT": 0.85,      # 事件
        "MONEY": 0.7,       # 金额
        "PRODUCT": 0.5,     # 产品
    }
    
    def __init__(self, criteria: Optional[IntelRatingCriteria] = None):
        self.criteria = criteria or IntelRatingCriteria()
    
    def calculate_keyword_score(self, item: IntelItem) -> float:
        """计算关键词匹配分数"""
        content_lower = (item.title + " " + item.content).lower()
        
        high_matches = sum(1 for kw in self.HIGH_PRIORITY_KEYWORDS if kw.lower() in content_lower)
        medium_matches = sum(1 for kw in self.MEDIUM_PRIORITY_KEYWORDS if kw.lower() in content_lower)
        
        # 归一化分数 (0-1)
        score = min(1.0, (high_matches * 0.15 + medium_matches * 0.05))
        
        return score
    
    def calculate_entity_score(self, item: IntelItem) -> float:
        """计算实体丰富度分数"""
        if not item.entities:
            return 0.3
        
        # 基于实体数量和质量
        entity_count = len(item.entities)
        base_score = min(1.0, entity_count / 10)  # 最多10个实体得满分
        
        return base_score
    
    def calculate_sentiment_score(self, item: IntelItem) -> float:
        """计算情感强度分数"""
        # 极端情感（正面或负面）表示重要性更高
        sentiment_abs = abs(item.sentiment)
        
        # 负面情感通常更重要
        if item.sentiment < 0:
            sentiment_abs = min(1.0, sentiment_abs * 1.2)
        
        return sentiment_abs
    
    def calculate_freshness_score(self, item: IntelItem) -> float:
        """计算时效性分数"""
        hours_old = (datetime.now() - item.published_at).total_seconds() / 3600
        
        if hours_old < 1:
            return 1.0
        elif hours_old < 6:
            return 0.9
        elif hours_old < 24:
            return 0.8
        elif hours_old < 72:
            return 0.6
        elif hours_old < 168:  # 1周
            return 0.4
        else:
            return 0.2
    
    def calculate_engagement_score(self, item: IntelItem) -> float:
        """计算传播热度分数"""
        return item.engagement_score
    
    def rate_intelligence(self, item: IntelItem) -> Tuple[IntelLevel, float, Dict[str, float]]:
        """
        评估情报重要性
        返回: (重要性级别, 综合分数, 各因子分数)
        """
        # 计算各维度分数
        keyword_score = self.calculate_keyword_score(item)
        entity_score = self.calculate_entity_score(item)
        sentiment_score = self.calculate_sentiment_score(item)
        freshness_score = self.calculate_freshness_score(item)
        engagement_score = self.calculate_engagement_score(item)
        
        # 来源分数
        source_reliability_score = item.source_reliability
        source_influence_score = item.source_influence
        
        # 计算加权总分
        total_score = (
            keyword_score * self.criteria.keyword_match_weight +
            entity_score * self.criteria.entity_count_weight +
            sentiment_score * self.criteria.sentiment_weight +
            source_reliability_score * self.criteria.source_reliability_weight +
            source_influence_score * self.criteria.source_influence_weight +
            freshness_score * self.criteria.freshness_weight +
            engagement_score * self.criteria.engagement_weight
        )
        
        # 确定级别
        if total_score >= 0.85:
            level = IntelLevel.CRITICAL
        elif total_score >= 0.70:
            level = IntelLevel.HIGH
        elif total_score >= 0.55:
            level = IntelLevel.MEDIUM
        elif total_score >= 0.40:
            level = IntelLevel.LOW
        else:
            level = IntelLevel.MINIMAL
        
        factors = {
            "keyword_score": round(keyword_score, 3),
            "entity_score": round(entity_score, 3),
            "sentiment_score": round(sentiment_score, 3),
            "freshness_score": round(freshness_score, 3),
            "engagement_score": round(engagement_score, 3),
            "source_reliability": round(source_reliability_score, 3),
            "source_influence": round(source_influence_score, 3)
        }
        
        return level, round(total_score, 3), factors
    
    def process_item(self, item: IntelItem) -> IntelItem:
        """处理单个情报项"""
        level, score, factors = self.rate_intelligence(item)
        
        item.importance_level = level
        item.importance_score = score
        item.rating_factors = factors
        
        return item
    
    def batch_process(self, items: List[IntelItem]) -> List[IntelItem]:
        """批量处理情报"""
        return [self.process_item(item) for item in items]
    
    def get_rating_summary(self, items: List[IntelItem]) -> Dict[str, Any]:
        """获取评级汇总统计"""
        if not items:
            return {"total": 0, "distribution": {}}
        
        distribution = {level.name: 0 for level in IntelLevel}
        total_score = 0
        
        for item in items:
            if item.importance_level:
                distribution[item.importance_level.name] += 1
                total_score += item.importance_score or 0
        
        return {
            "total": len(items),
            "distribution": distribution,
            "average_score": round(total_score / len(items), 3) if items else 0,
            "critical_count": distribution.get("CRITICAL", 0),
            "high_count": distribution.get("HIGH", 0)
        }

def main():
    """测试评级算法"""
    rater = AfricaIntelRater()
    
    # 测试数据
    test_items = [
        IntelItem(
            id="test_001",
            title="China and Nigeria Sign $5 Billion Infrastructure Deal",
            content="China and Nigeria have signed a major infrastructure agreement worth $5 billion...",
            source="Reuters Africa",
            source_reliability=0.95,
            source_influence=0.90,
            published_at=datetime.now(),
            keywords=["China", "Nigeria", "infrastructure", "investment"],
            entities=["China", "Nigeria", "$5 Billion"],
            sentiment=0.3,
            engagement_score=0.85
        ),
        IntelItem(
            id="test_002",
            title="Local Market Update",
            content="Daily market report from regional exchanges...",
            source="Local News",
            source_reliability=0.60,
            source_influence=0.40,
            published_at=datetime.now(),
            keywords=["market"],
            entities=["Market"],
            sentiment=0.0,
            engagement_score=0.20
        ),
        IntelItem(
            id="test_003",
            title="Coup Attempt Reported in West African Nation",
            content="Military forces have reportedly attempted to seize power...",
            source="BBC Africa",
            source_reliability=0.95,
            source_influence=0.95,
            published_at=datetime.now(),
            keywords=["coup", "military", "political"],
            entities=["West Africa", "Military"],
            sentiment=-0.8,
            engagement_score=0.95
        )
    ]
    
    print("="*60)
    print("Africa Intel Department - 情报重要性评级测试")
    print("="*60)
    
    for item in test_items:
        rated = rater.process_item(item)
        print(f"\n📰 {rated.title}")
        print(f"   级别: {rated.importance_level.name} (分数: {rated.importance_score})")
        print(f"   因子: {rated.rating_factors}")
    
    summary = rater.get_rating_summary(test_items)
    print(f"\n【评级汇总】")
    print(f"   总计: {summary['total']}")
    print(f"   分布: {summary['distribution']}")
    print(f"   平均分: {summary['average_score']}")
    print(f"   紧急/高优先级: {summary['critical_count'] + summary['high_count']}")
    
    print("\n" + "="*60)
    print("评级算法测试完成")
    print("="*60)

if __name__ == "__main__":
    main()
