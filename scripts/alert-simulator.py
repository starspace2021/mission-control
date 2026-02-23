#!/usr/bin/env python3
"""
US-China Policy Alert Simulator
美中政策告警模拟测试脚本
用于验证告警系统各组件功能
"""

import json
import sys
import time
from datetime import datetime
from pathlib import Path

# 添加脚本目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from us_china_policy_alert_monitor import Alert, FeishuNotifier, AlertEngine


class AlertSimulator:
    """告警模拟器"""
    
    def __init__(self, config: dict):
        self.config = config
        self.notifier = self._init_notifier()
        self.templates = config.get('notification_templates', {})
        
    def _init_notifier(self):
        """初始化通知器"""
        import os
        feishu_config = self.config.get('feishu_config', {})
        webhook_url = feishu_config.get('webhook_url', '')
        
        # 从环境变量获取
        if webhook_url.startswith('${') and webhook_url.endswith('}'):
            env_var = webhook_url[2:-1]
            webhook_url = os.getenv(env_var, '')
        
        secret = feishu_config.get('secret', '')
        if secret.startswith('${') and secret.endswith('}'):
            env_var = secret[2:-1]
            secret = os.getenv(env_var, '')
        
        if webhook_url:
            return FeishuNotifier(webhook_url, secret)
        return None
    
    def simulate_supreme_court_alert(self) -> Alert:
        """模拟最高法院裁决告警"""
        return Alert(
            id=f"supreme_court_test_{int(time.time())}",
            rule_id="supreme_court_ruling",
            title="最高法院就涉华贸易案件作出裁决",
            severity="critical",
            source="美国最高法院",
            content="最高法院今日就某涉华贸易案件作出重要裁决，可能影响未来中美贸易政策走向...",
            timestamp=datetime.now(),
            url="https://www.supremecourt.gov/opinions/test-case",
            metadata={
                'case_name': 'Test Case v. China Trade Commission',
                'date': datetime.now().isoformat(),
                'summary': '最高法院以5:4的投票结果裁定，维持对某中国产品的关税措施，但要求行政部门在征收额外关税前必须提供更充分的经济影响评估...',
                'china_related_points': 'tariff, trade, China',
                'url': 'https://www.supremecourt.gov/opinions/test-case',
                'source_name': '美国最高法院'
            }
        )
    
    def simulate_bis_alert(self) -> Alert:
        """模拟BIS实体清单告警"""
        return Alert(
            id=f"bis_test_{int(time.time())}",
            rule_id="bis_entity_update",
            title="BIS将3家中国实体列入实体清单",
            severity="critical",
            source="BIS实体清单",
            content="商务部工业与安全局今日更新实体清单，新增3家中国科技公司...",
            timestamp=datetime.now(),
            url="https://www.bis.doc.gov/entity-list-update",
            metadata={
                'entity_name': 'Test Technology Co., Ltd.',
                'change_type': '新增',
                'country': 'China',
                'restrictions': '出口管制许可证要求（推定拒绝）',
                'effective_date': datetime.now().strftime('%Y-%m-%d'),
                'url': 'https://www.bis.doc.gov/entity-list-update',
                'source_name': 'BIS实体清单'
            }
        )
    
    def simulate_tariff_alert(self) -> Alert:
        """模拟关税政策告警"""
        return Alert(
            id=f"tariff_test_{int(time.time())}",
            rule_id="tariff_policy_change",
            title="USTR宣布对301条款关税进行复审",
            severity="high",
            source="美国贸易代表办公室",
            content="USTR发布公告，宣布启动对现行301条款关税措施的四年期复审程序...",
            timestamp=datetime.now(),
            url="https://ustr.gov/301-review",
            metadata={
                'policy_type': '301条款四年期复审',
                'effective_date': '2026-03-01',
                'products': '电动汽车、太阳能电池、半导体等',
                'rate_change': '维持现有关税，部分产品可能调整',
                'description': 'USTR启动对价值约3700亿美元中国商品的301条款关税复审，公众评议期60天...',
                'url': 'https://ustr.gov/301-review',
                'source_name': 'USTR'
            }
        )
    
    def simulate_executive_order_alert(self) -> Alert:
        """模拟行政命令告警"""
        return Alert(
            id=f"eo_test_{int(time.time())}",
            rule_id="executive_order",
            title="总统签署关于人工智能出口的行政命令",
            severity="critical",
            source="白宫",
            content="总统今日签署行政命令，加强对先进AI技术对华出口的管制...",
            timestamp=datetime.now(),
            url="https://www.whitehouse.gov/eo-ai-export",
            metadata={
                'eo_number': 'Executive Order 141XX',
                'title': '关于加强人工智能和半导体技术出口管制的行政命令',
                'signing_date': datetime.now().strftime('%Y-%m-%d'),
                'key_points': '1. 扩大AI芯片出口许可要求 2. 建立新的技术出口审查机制 3. 要求云服务提供商报告外国AI训练活动',
                'china_impact': '直接影响中国获取先进AI芯片和云计算资源，可能加速国产替代进程',
                'url': 'https://www.whitehouse.gov/eo-ai-export',
                'source_name': '白宫'
            }
        )
    
    def simulate_sanction_alert(self) -> Alert:
        """模拟制裁告警"""
        return Alert(
            id=f"sanction_test_{int(time.time())}",
            rule_id="treasury_sanction",
            title="财政部将2名个人和5家实体列入SDN清单",
            severity="high",
            source="财政部OFAC",
            content="财政部外国资产控制办公室今日发布制裁公告...",
            timestamp=datetime.now(),
            url="https://home.treasury.gov/sanctions",
            metadata={
                'sanction_type': 'SDN清单',
                'target_entities': 'ABC Shipping Ltd., XYZ Electronics Co.',
                'countries': 'China, Hong Kong',
                'reasoning': '涉嫌参与规避对某国制裁的活动，包括转运敏感技术和商品...',
                'effective_date': datetime.now().strftime('%Y-%m-%d'),
                'url': 'https://home.treasury.gov/sanctions',
                'source_name': '财政部OFAC'
            }
        )
    
    def simulate_export_control_alert(self) -> Alert:
        """模拟出口管制规则告警"""
        return Alert(
            id=f"export_test_{int(time.time())}",
            rule_id="export_control_rule",
            title="BIS发布先进计算芯片出口管制新规",
            severity="high",
            source="联邦公报",
            content="商务部发布最终规则，修订出口管理条例(EAR)对先进计算芯片的管制...",
            timestamp=datetime.now(),
            url="https://www.federalregister.gov/export-control-rule",
            metadata={
                'rule_number': 'RIN 0694-AI94',
                'title': '出口管制条例：先进计算和半导体制造物项的修订',
                'summary': '修订ECCN 3A090和4A090，调整性能阈值，新增对数据中心AI芯片的许可要求...',
                'china_impact': '进一步限制中国获取高性能AI芯片，影响范围扩大至更多型号和消费级产品',
                'comment_deadline': '2026-03-30',
                'url': 'https://www.federalregister.gov/export-control-rule',
                'source_name': '联邦公报'
            }
        )
    
    def run_simulation(self, alert_types: list = None) -> dict:
        """
        运行模拟测试
        
        Args:
            alert_types: 要测试的告警类型列表，None表示全部
        
        Returns:
            测试结果统计
        """
        simulations = {
            'supreme_court': self.simulate_supreme_court_alert,
            'bis': self.simulate_bis_alert,
            'tariff': self.simulate_tariff_alert,
            'executive_order': self.simulate_executive_order_alert,
            'sanction': self.simulate_sanction_alert,
            'export_control': self.simulate_export_control_alert
        }
        
        if alert_types:
            simulations = {k: v for k, v in simulations.items() if k in alert_types}
        
        results = {
            'total': len(simulations),
            'success': 0,
            'failed': 0,
            'details': []
        }
        
        print(f"\n{'='*60}")
        print("US-China Policy Alert System - 模拟测试")
        print(f"{'='*60}\n")
        
        if not self.notifier:
            print("⚠️ 警告: 飞书通知器未配置，仅生成模拟告警")
            print("请设置 FEISHU_WEBHOOK_URL 环境变量\n")
        
        for alert_type, simulator in simulations.items():
            print(f"\n测试场景: {alert_type}")
            print("-" * 40)
            
            try:
                alert = simulator()
                template = self.templates.get(
                    f"{alert_type}_alert" if alert_type != 'supreme_court' else 'supreme_court_alert',
                    {'title': alert.title, 'content': alert.content}
                )
                
                print(f"  告警标题: {alert.title}")
                print(f"  严重级别: {alert.severity}")
                print(f"  数据源: {alert.source}")
                
                if self.notifier:
                    success = self.notifier.send_alert(alert, template)
                    if success:
                        print(f"  状态: ✅ 通知发送成功")
                        results['success'] += 1
                    else:
                        print(f"  状态: ❌ 通知发送失败")
                        results['failed'] += 1
                else:
                    print(f"  状态: ⏭️ 已生成（通知器未配置）")
                    results['success'] += 1
                
                results['details'].append({
                    'type': alert_type,
                    'title': alert.title,
                    'severity': alert.severity,
                    'success': True if not self.notifier else success
                })
                
                # 添加延迟避免频率限制
                time.sleep(1)
                
            except Exception as e:
                print(f"  状态: ❌ 异常: {e}")
                results['failed'] += 1
                results['details'].append({
                    'type': alert_type,
                    'error': str(e),
                    'success': False
                })
        
        return results
    
    def test_connection(self) -> bool:
        """测试飞书连接"""
        if not self.notifier:
            print("❌ 飞书通知器未配置")
            return False
        
        print("\n测试飞书连接...")
        success = self.notifier.send_test_message()
        
        if success:
            print("✅ 飞书连接正常")
        else:
            print("❌ 飞书连接失败")
        
        return success


def load_config():
    """加载配置文件"""
    import yaml
    config_path = Path('memory/us-china-policy-alerts.yaml')
    
    if not config_path.exists():
        print(f"❌ 配置文件不存在: {config_path}")
        sys.exit(1)
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='US-China Policy Alert Simulator')
    parser.add_argument('--type', type=str, help='指定测试类型 (supreme_court/bis/tariff/executive_order/sanction/export_control)')
    parser.add_argument('--test-connection', action='store_true', help='仅测试飞书连接')
    parser.add_argument('--list', action='store_true', help='列出所有测试场景')
    
    args = parser.parse_args()
    
    # 加载配置
    config = load_config()
    
    # 创建模拟器
    simulator = AlertSimulator(config)
    
    if args.list:
        print("\n可用测试场景:")
        print("  - supreme_court: 最高法院裁决")
        print("  - bis: BIS实体清单更新")
        print("  - tariff: 关税政策变化")
        print("  - executive_order: 行政命令签署")
        print("  - sanction: 财政部制裁")
        print("  - export_control: 出口管制规则")
        return
    
    if args.test_connection:
        simulator.test_connection()
        return
    
    # 运行模拟
    alert_types = [args.type] if args.type else None
    results = simulator.run_simulation(alert_types)
    
    # 打印总结
    print(f"\n{'='*60}")
    print("测试总结")
    print(f"{'='*60}")
    print(f"总测试数: {results['total']}")
    print(f"成功: {results['success']}")
    print(f"失败: {results['failed']}")
    
    if results['failed'] == 0:
        print("\n✅ 所有测试通过！")
    else:
        print(f"\n⚠️ {results['failed']} 个测试失败")
    
    # 保存测试报告
    report_file = Path('memory/alert_simulation_report.json')
    report = {
        'timestamp': datetime.now().isoformat(),
        'results': results
    }
    
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n测试报告已保存: {report_file}")


if __name__ == '__main__':
    main()
