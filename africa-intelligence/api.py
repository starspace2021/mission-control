#!/usr/bin/env python3
"""
非洲情报数据管理 API
统一的数据入口，禁止直接操作 reports.json
"""

import json
import os
import shutil
from datetime import datetime
from typing import List, Dict, Optional

DATA_DIR = "/root/.openclaw/workspace/africa-intelligence/data"
REPORTS_DIR = "/root/.openclaw/workspace/africa-intelligence/reports"
BACKUP_DIR = f"{DATA_DIR}/backups"
DATA_FILE = f"{DATA_DIR}/reports.json"

class AfricaIntelAPI:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        os.makedirs(BACKUP_DIR, exist_ok=True)
        os.makedirs(REPORTS_DIR, exist_ok=True)
        
    def _backup(self):
        """自动备份"""
        if os.path.exists(DATA_FILE):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{BACKUP_DIR}/reports_{timestamp}.json"
            shutil.copy2(DATA_FILE, backup_file)
            # 保留最近30天备份
            self._cleanup_old_backups()
    
    def _cleanup_old_backups(self):
        """清理30天前的备份"""
        import glob
        backups = glob.glob(f"{BACKUP_DIR}/reports_*.json")
        backups.sort()
        for old in backups[:-30]:  # 保留最近30个
            os.remove(old)
    
    def _load_data(self) -> List[Dict]:
        """加载数据"""
        if not os.path.exists(DATA_FILE):
            return []
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_data(self, data: List[Dict]):
        """保存数据"""
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def add_report(self, report: Dict) -> Dict:
        """
        添加新报告
        自动去重、排序、备份
        """
        # 备份
        self._backup()
        
        # 加载现有数据
        reports = self._load_data()
        
        # 检查重复（时间和类别相同）
        time_key = f"{report.get('time')}-{report.get('category')}"
        existing = [r for r in reports if f"{r.get('time')}-{r.get('category')}" == time_key]
        
        if existing:
            return {"success": False, "error": "报告已存在", "existing": existing[0]}
        
        # 添加新报告
        reports.append(report)
        
        # 按时间倒序排序
        reports.sort(key=lambda x: x.get('time', ''), reverse=True)
        
        # 保存
        self._save_data(reports)
        
        return {"success": True, "report": report, "total": len(reports)}
    
    def get_reports(self, category: Optional[str] = None, 
                    tag: Optional[str] = None,
                    limit: int = 100) -> List[Dict]:
        """查询报告"""
        reports = self._load_data()
        
        if category:
            reports = [r for r in reports if r.get('category') == category]
        
        if tag:
            reports = [r for r in reports if tag in r.get('tags', [])]
        
        return reports[:limit]
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        reports = self._load_data()
        
        # 只统计未删除的报告
        active_reports = [r for r in reports if not r.get('deleted')]
        
        intel_count = len([r for r in active_reports if r.get('category') == 'intel'])
        risk_count = len([r for r in active_reports if r.get('category') == 'risk'])
        deleted_count = len([r for r in reports if r.get('deleted')])
        
        return {
            "total": len(active_reports),
            "intel": intel_count,
            "risk": risk_count,
            "deleted": deleted_count,
            "latest": active_reports[0].get('time') if active_reports else None,
            "oldest": active_reports[-1].get('time') if active_reports else None
        }
    
    def delete_report(self, report_id: str, soft_delete: bool = True) -> Dict:
        """
        删除报告
        默认使用软删除（标记为已删除，不物理删除）
        """
        # 备份
        self._backup()
        
        # 加载现有数据
        reports = self._load_data()
        
        # 查找报告
        target = None
        for r in reports:
            if r.get('id') == report_id:
                target = r
                break
        
        if not target:
            return {"success": False, "error": f"报告不存在: {report_id}"}
        
        if soft_delete:
            # 软删除：标记为已删除
            target['deleted'] = True
            target['deleted_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self._save_data(reports)
            return {
                "success": True, 
                "action": "soft_delete",
                "report_id": report_id,
                "message": "报告已标记为删除（软删除）"
            }
        else:
            # 硬删除：从列表中移除
            reports = [r for r in reports if r.get('id') != report_id]
            self._save_data(reports)
            return {
                "success": True,
                "action": "hard_delete", 
                "report_id": report_id,
                "message": "报告已永久删除"
            }
    
    def restore_report(self, report_id: str) -> Dict:
        """恢复软删除的报告"""
        reports = self._load_data()
        
        for r in reports:
            if r.get('id') == report_id:
                if r.get('deleted'):
                    del r['deleted']
                    del r['deleted_at']
                    self._save_data(reports)
                    return {
                        "success": True,
                        "report_id": report_id,
                        "message": "报告已恢复"
                    }
                else:
                    return {"success": False, "error": "报告未被删除"}
        
        return {"success": False, "error": f"报告不存在: {report_id}"}
    
    def list_deleted(self) -> List[Dict]:
        """列出所有已软删除的报告"""
        reports = self._load_data()
        return [r for r in reports if r.get('deleted')]
    
    def get_reports(self, category: Optional[str] = None, 
                    tag: Optional[str] = None,
                    limit: int = 100,
                    include_deleted: bool = False) -> List[Dict]:
        """查询报告（默认排除已删除的）"""
        reports = self._load_data()
        
        # 默认排除已删除的报告
        if not include_deleted:
            reports = [r for r in reports if not r.get('deleted')]
        
        if category:
            reports = [r for r in reports if r.get('category') == category]
        
        if tag:
            reports = [r for r in reports if tag in r.get('tags', [])]
        
        return reports[:limit]
    
    def validate(self) -> Dict:
        """验证数据完整性"""
        reports = self._load_data()
        
        # 排除已删除的报告进行验证
        active_reports = [r for r in reports if not r.get('deleted')]
        
        errors = []
        
        if len(active_reports) < 5:
            errors.append(f"有效记录数过少: {len(active_reports)} 条")
        
        # 检查最新记录时间
        if active_reports:
            latest = active_reports[0].get('time', '')
            try:
                latest_dt = datetime.strptime(latest, "%Y-%m-%d %H:%M")
                hours_ago = (datetime.now() - latest_dt).total_seconds() / 3600
                if hours_ago > 48:
                    errors.append(f"最新记录超过48小时: {latest}")
            except:
                errors.append(f"时间格式错误: {latest}")
        
        deleted_count = len([r for r in reports if r.get('deleted')])
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "stats": {
                **self.get_stats(),
                "deleted": deleted_count
            }
        }

# 全局API实例
api = AfricaIntelAPI()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python api.py [add|get|stats|validate|delete|restore|list-deleted]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "stats":
        print(json.dumps(api.get_stats(), ensure_ascii=False, indent=2))
    elif cmd == "validate":
        print(json.dumps(api.validate(), ensure_ascii=False, indent=2))
    elif cmd == "delete":
        if len(sys.argv) < 3:
            print("Usage: python api.py delete <report_id> [--hard]")
            sys.exit(1)
        report_id = sys.argv[2]
        hard = "--hard" in sys.argv
        print(json.dumps(api.delete_report(report_id, soft_delete=not hard), ensure_ascii=False, indent=2))
    elif cmd == "restore":
        if len(sys.argv) < 3:
            print("Usage: python api.py restore <report_id>")
            sys.exit(1)
        report_id = sys.argv[2]
        print(json.dumps(api.restore_report(report_id), ensure_ascii=False, indent=2))
    elif cmd == "list-deleted":
        deleted = api.list_deleted()
        print(json.dumps({"deleted_count": len(deleted), "reports": deleted}, ensure_ascii=False, indent=2))
    else:
        print(f"Unknown command: {cmd}")