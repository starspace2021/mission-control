#!/usr/bin/env python3
"""
日本情报数据管理 API
统一的数据入口，禁止直接操作 reports.json
"""

import json
import os
import shutil
from datetime import datetime
from typing import List, Dict, Optional

DATA_DIR = "/root/.openclaw/workspace/japan-intelligence/data"
REPORTS_DIR = "/root/.openclaw/workspace/japan-intelligence/reports"
BACKUP_DIR = f"{DATA_DIR}/backups"
DATA_FILE = f"{DATA_DIR}/reports.json"

class JapanIntelAPI:
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
            self._cleanup_old_backups()
    
    def _cleanup_old_backups(self):
        """清理30天前的备份"""
        import glob
        backups = glob.glob(f"{BACKUP_DIR}/reports_*.json")
        backups.sort()
        for old in backups[:-30]:
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
        """添加新报告"""
        self._backup()
        reports = self._load_data()
        
        time_key = f"{report.get('time')}-{report.get('category')}"
        existing = [r for r in reports if f"{r.get('time')}-{r.get('category')}" == time_key]
        
        if existing:
            return {"success": False, "error": "报告已存在", "existing": existing[0]}
        
        reports.append(report)
        reports.sort(key=lambda x: x.get('time', ''), reverse=True)
        self._save_data(reports)
        
        return {"success": True, "report": report, "total": len(reports)}
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        reports = self._load_data()
        intel_count = len([r for r in reports if r.get('category') == 'intel'])
        risk_count = len([r for r in reports if r.get('category') == 'risk'])
        
        return {
            "total": len(reports),
            "intel": intel_count,
            "risk": risk_count,
            "latest": reports[0].get('time') if reports else None,
            "oldest": reports[-1].get('time') if reports else None
        }
    
    def validate(self) -> Dict:
        """验证数据完整性"""
        reports = self._load_data()
        errors = []
        
        if len(reports) < 5:
            errors.append(f"记录数过少: {len(reports)} 条")
        
        if reports:
            latest = reports[0].get('time', '')
            try:
                latest_dt = datetime.strptime(latest, "%Y-%m-%d %H:%M")
                hours_ago = (datetime.now() - latest_dt).total_seconds() / 3600
                if hours_ago > 48:
                    errors.append(f"最新记录超过48小时: {latest}")
            except:
                errors.append(f"时间格式错误: {latest}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "stats": self.get_stats()
        }

api = JapanIntelAPI()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python api.py [stats|validate]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "stats":
        print(json.dumps(api.get_stats(), ensure_ascii=False, indent=2))
    elif cmd == "validate":
        print(json.dumps(api.validate(), ensure_ascii=False, indent=2))