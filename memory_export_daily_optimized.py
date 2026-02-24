#!/usr/bin/env python3
"""
记忆每日导出 - 优化版 (增量导出)
Memory & Admin Department - 乔巴负责

优化内容:
1. 改为增量导出（仅导出当日变更）
2. 使用文件修改时间判断
3. 添加状态跟踪文件
4. 支持全量导出模式（通过 --full 参数）
"""

import os
import sys
import json
import shutil
from datetime import datetime, timedelta
from pathlib import Path
import argparse

# ============ 配置 ============
WORKSPACE_DIR = Path('/root/.openclaw/workspace')
MEMORY_DIR = WORKSPACE_DIR / 'memory'
EXPORT_DIR = WORKSPACE_DIR / 'exports'
STATE_FILE = EXPORT_DIR / '.export_state.json'

# 保留的目录和文件
PROTECTED_ITEMS = {
    '.git',
    'node_modules',
    '__pycache__',
    '.pytest_cache',
    '.export_state.json'
}

def load_export_state():
    """加载导出状态"""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f'加载状态文件失败: {e}')
    return {
        'last_full_export': None,
        'last_incremental_export': None,
        'exported_files': [],
        'file_hashes': {}
    }

def save_export_state(state):
    """保存导出状态"""
    try:
        EXPORT_DIR.mkdir(exist_ok=True)
        with open(STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f'保存状态文件失败: {e}')

def get_file_hash(filepath):
    """获取文件哈希（用于检测变化）"""
    import hashlib
    try:
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return None

def get_file_info(filepath):
    """获取文件信息"""
    try:
        stat = os.stat(filepath)
        return {
            'mtime': stat.st_mtime,
            'size': stat.st_size,
            'hash': get_file_hash(filepath)
        }
    except:
        return None

def should_export_file(filepath, state, today_start):
    """判断文件是否需要导出"""
    try:
        stat = os.stat(filepath)
        
        # 检查是否是今日修改的文件
        if stat.st_mtime < today_start:
            return False
        
        # 检查文件哈希是否变化
        file_hash = get_file_hash(filepath)
        relative_path = str(filepath.relative_to(WORKSPACE_DIR))
        
        if relative_path in state.get('file_hashes', {}):
            if state['file_hashes'][relative_path] == file_hash:
                return False  # 文件未变化
        
        return True
    except:
        return False

def export_file(src_path, dest_path, state):
    """导出单个文件"""
    try:
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_path, dest_path)
        
        relative_path = str(src_path.relative_to(WORKSPACE_DIR))
        file_hash = get_file_hash(src_path)
        
        state['file_hashes'][relative_path] = file_hash
        if relative_path not in state['exported_files']:
            state['exported_files'].append(relative_path)
        
        return True
    except Exception as e:
        print(f'  导出失败 {src_path}: {e}')
        return False

def incremental_export(state, today_start):
    """增量导出 - 仅导出今日变更的文件"""
    exported_count = 0
    exported_size = 0
    errors = []
    
    print('开始增量导出...')
    print(f'今日起始时间: {datetime.fromtimestamp(today_start).strftime("%Y-%m-%d %H:%M:%S")}')
    
    # 遍历工作目录
    for root, dirs, files in os.walk(WORKSPACE_DIR):
        # 跳过保护目录
        dirs[:] = [d for d in dirs if d not in PROTECTED_ITEMS]
        
        for filename in files:
            if filename in PROTECTED_ITEMS:
                continue
            
            src_path = Path(root) / filename
            
            # 检查是否需要导出
            if not should_export_file(src_path, state, today_start):
                continue
            
            # 计算目标路径
            relative_path = src_path.relative_to(WORKSPACE_DIR)
            dest_path = EXPORT_DIR / relative_path
            
            # 导出文件
            if export_file(src_path, dest_path, state):
                exported_count += 1
                file_size = os.path.getsize(src_path)
                exported_size += file_size
                print(f'  [导出] {relative_path} ({file_size} bytes)')
    
    return exported_count, exported_size, errors

def full_export(state):
    """全量导出 - 导出所有文件"""
    exported_count = 0
    exported_size = 0
    errors = []
    
    print('开始全量导出...')
    
    # 清空之前的导出状态
    state['file_hashes'] = {}
    state['exported_files'] = []
    
    # 遍历工作目录
    for root, dirs, files in os.walk(WORKSPACE_DIR):
        # 跳过保护目录
        dirs[:] = [d for d in dirs if d not in PROTECTED_ITEMS]
        
        for filename in files:
            if filename in PROTECTED_ITEMS:
                continue
            
            src_path = Path(root) / filename
            relative_path = src_path.relative_to(WORKSPACE_DIR)
            dest_path = EXPORT_DIR / relative_path
            
            # 导出文件
            if export_file(src_path, dest_path, state):
                exported_count += 1
                file_size = os.path.getsize(src_path)
                exported_size += file_size
                if exported_count <= 10:  # 只显示前10个
                    print(f'  [导出] {relative_path} ({file_size} bytes)')
    
    if exported_count > 10:
        print(f'  ... 还有 {exported_count - 10} 个文件')
    
    return exported_count, exported_size, errors

def cleanup_old_exports(state, keep_days=7):
    """清理旧导出文件"""
    cleaned = 0
    cutoff_time = datetime.now().timestamp() - (keep_days * 24 * 3600)
    
    for root, dirs, files in os.walk(EXPORT_DIR):
        for filename in files:
            if filename == '.export_state.json':
                continue
            
            filepath = Path(root) / filename
            try:
                if os.path.getmtime(filepath) < cutoff_time:
                    os.remove(filepath)
                    cleaned += 1
            except:
                pass
    
    return cleaned

def main():
    parser = argparse.ArgumentParser(description='记忆每日导出工具')
    parser.add_argument('--full', action='store_true', help='执行全量导出')
    parser.add_argument('--cleanup', action='store_true', help='清理旧导出文件')
    args = parser.parse_args()
    
    start_time = datetime.now()
    
    print('='*60)
    print('记忆每日导出 - 优化版')
    print('='*60)
    print(f'开始时间: {start_time.strftime("%Y-%m-%d %H:%M:%S")}')
    
    # 确保导出目录存在
    EXPORT_DIR.mkdir(exist_ok=True)
    
    # 加载状态
    state = load_export_state()
    
    # 计算今日起始时间
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_start = today.timestamp()
    
    # 执行导出
    if args.full:
        exported_count, exported_size, errors = full_export(state)
        state['last_full_export'] = datetime.now().isoformat()
    else:
        exported_count, exported_size, errors = incremental_export(state, today_start)
        state['last_incremental_export'] = datetime.now().isoformat()
    
    # 清理旧文件
    cleaned_count = 0
    if args.cleanup:
        cleaned_count = cleanup_old_exports(state)
    
    # 保存状态
    save_export_state(state)
    
    # 生成报告
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print('\n' + '='*60)
    print('导出报告')
    print('='*60)
    print(f'执行时间: {duration:.2f} 秒')
    print(f'导出模式: {"全量" if args.full else "增量"}')
    print(f'导出文件数: {exported_count}')
    print(f'导出大小: {exported_size / 1024:.2f} KB')
    if cleaned_count > 0:
        print(f'清理旧文件: {cleaned_count} 个')
    print(f'错误数: {len(errors)}')
    print(f'上次全量导出: {state.get("last_full_export", "无")}')
    print(f'上次增量导出: {state.get("last_incremental_export", "无")}')
    
    print('\n' + '='*60)
    print('导出完成!')
    print(f'导出目录: {EXPORT_DIR}')
    print('='*60)
    
    return duration

if __name__ == '__main__':
    duration = main()
    sys.exit(0)
