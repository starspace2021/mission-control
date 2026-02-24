#!/usr/bin/env python3
"""
QQ邮箱清理助手 - 优化版
Memory & Admin Department - 克林负责

优化内容:
1. 添加30秒连接超时
2. 分批处理邮件，每批50封
3. 限制总处理时间不超过120秒
4. 优化IMAP连接逻辑
"""

import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
import re
import sys
import socket
import signal

# ============ 配置 ============
EMAIL = '495168397@qq.com'
PASSWORD = 'ghvuapitdfwqbiee'
IMAP_SERVER = 'imap.qq.com'
IMAP_PORT = 993

# 超时设置
CONNECTION_TIMEOUT = 30  # 连接超时30秒
MAX_EXECUTION_TIME = 120  # 最大执行时间120秒
BATCH_SIZE = 50  # 每批处理50封邮件

FORCE_DELETE_SENDERS = [
    'no_reply@email.apple.com',
    'do_not_reply@email.apple.com'
]

SPAM_KEYWORDS = [
    '广告', '推广', '优惠', '促销', '特价', '秒杀',
    '贷款', '信用卡', '保险', '理财', '投资',
    '招聘', '兼职', '刷单', '返利',
    '中奖', '抽奖', '免费领',
    '代写', '论文', '考试',
    '色情', '赌博', '博彩'
]

# ============ 全局状态 ============
start_time = datetime.now()
timeout_occurred = False

def check_timeout():
    """检查是否超时"""
    global timeout_occurred
    elapsed = (datetime.now() - start_time).total_seconds()
    if elapsed > MAX_EXECUTION_TIME:
        timeout_occurred = True
        return True
    return False

def decode_str(s):
    if s is None:
        return ''
    decoded_fragments = decode_header(s)
    result = ''
    for fragment, charset in decoded_fragments:
        if isinstance(fragment, bytes):
            try:
                result += fragment.decode(charset or 'utf-8', errors='ignore')
            except:
                result += fragment.decode('utf-8', errors='ignore')
        else:
            result += fragment
    return result

def get_sender(msg):
    from_header = msg.get('From', '')
    match = re.search(r'<([^>]+)>', from_header)
    if match:
        return match.group(1).lower()
    if '@' in from_header:
        return from_header.lower().strip()
    return from_header.lower()

def get_subject(msg):
    return decode_str(msg.get('Subject', '(无主题)'))

def get_date(msg):
    date_str = msg.get('Date', '')
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(date_str)
    except:
        return None

def is_important(msg):
    flags = msg.get('X-Priority', '')
    if flags in ['1', '2']:
        return True
    if msg.get('Importance', '').lower() == 'high':
        return True
    if msg.get('X-MSMail-Priority', '').lower() == 'high':
        return True
    return False

def should_delete_by_keywords(subject, sender):
    text = (subject + ' ' + sender).lower()
    for keyword in SPAM_KEYWORDS:
        if keyword in text:
            return True, keyword
    return False, None

def process_email_batch(mail, msg_ids, cutoff_date, stats, folder_name):
    """分批处理邮件"""
    global timeout_occurred
    
    total_ids = len(msg_ids)
    processed = 0
    
    # 分批处理
    for batch_start in range(0, total_ids, BATCH_SIZE):
        if check_timeout():
            print(f'⚠️ 接近超时限制，已处理 {processed}/{total_ids} 封邮件', flush=True)
            break
        
        batch_end = min(batch_start + BATCH_SIZE, total_ids)
        batch = msg_ids[batch_start:batch_end]
        
        for msg_id in batch:
            if check_timeout():
                break
                
            try:
                status, msg_data = mail.fetch(msg_id, '(RFC822)')
                if status != 'OK':
                    continue
                
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                stats['total_checked'] += 1
                processed += 1
                
                sender = get_sender(msg)
                subject = get_subject(msg)
                date = get_date(msg)
                
                if is_important(msg):
                    stats['skipped_important'] += 1
                    continue
                
                if sender in FORCE_DELETE_SENDERS:
                    mail.store(msg_id, '+FLAGS', '\\Deleted')
                    stats['deleted_force'].append({
                        'sender': sender,
                        'subject': subject,
                        'folder': folder_name
                    })
                    print(f'  [删除-强制] {sender}: {subject[:50]}', flush=True)
                    continue
                
                has_spam_keyword, matched_keyword = should_delete_by_keywords(subject, sender)
                if has_spam_keyword:
                    mail.store(msg_id, '+FLAGS', '\\Deleted')
                    stats['deleted_keywords'].append({
                        'sender': sender,
                        'subject': subject,
                        'keyword': matched_keyword,
                        'folder': folder_name
                    })
                    print(f'  [删除-关键词:{matched_keyword}] {sender}: {subject[:50]}', flush=True)
                    continue
                
                if date and date < cutoff_date:
                    mail.store(msg_id, '+FLAGS', '\\Deleted')
                    stats['deleted_old'].append({
                        'sender': sender,
                        'subject': subject,
                        'date': date.strftime('%Y-%m-%d'),
                        'folder': folder_name
                    })
                    print(f'  [删除-过期:{date.strftime("%Y-%m-%d")}] {sender}: {subject[:50]}', flush=True)
                    continue
                
            except Exception as e:
                stats['errors'].append(str(e))
                continue
        
        # 每批处理后提交删除
        if not timeout_occurred:
            mail.expunge()
        
        print(f'  批次进度: {processed}/{total_ids}', flush=True)

def main():
    """主函数"""
    global start_time
    start_time = datetime.now()
    
    cutoff_date = datetime.now() - timedelta(days=30)
    
    stats = {
        'total_checked': 0,
        'deleted_force': [],
        'deleted_keywords': [],
        'deleted_old': [],
        'skipped_important': 0,
        'errors': []
    }
    
    print('='*60, flush=True)
    print('QQ邮箱清理助手 - 优化版', flush=True)
    print('开始时间: ' + start_time.strftime('%Y-%m-%d %H:%M:%S'), flush=True)
    print(f'连接超时: {CONNECTION_TIMEOUT}秒 | 执行限制: {MAX_EXECUTION_TIME}秒 | 批次大小: {BATCH_SIZE}', flush=True)
    print('='*60, flush=True)
    
    mail = None
    
    try:
        # 设置socket超时
        socket.setdefaulttimeout(CONNECTION_TIMEOUT)
        
        print('正在连接 ' + IMAP_SERVER + '...', flush=True)
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(EMAIL, PASSWORD)
        print('登录成功!', flush=True)
        
        # 收件箱
        print('\n' + '='*50, flush=True)
        print('正在检查: 收件箱 (INBOX)', flush=True)
        print('='*50, flush=True)
        
        status, messages = mail.select('INBOX')
        if status == 'OK':
            status, data = mail.search(None, 'ALL')
            if status == 'OK':
                msg_ids = data[0].split()
                print(f'找到 {len(msg_ids)} 封邮件', flush=True)
                
                if msg_ids:
                    process_email_batch(mail, msg_ids, cutoff_date, stats, '收件箱')
                
                print('收件箱 清理完成', flush=True)
        
        # 检查是否超时
        if check_timeout():
            print('\n⚠️ 执行时间接近限制，跳过垃圾箱处理', flush=True)
        else:
            # 垃圾箱
            print('\n' + '='*50, flush=True)
            print('正在检查: 垃圾箱 (Junk)', flush=True)
            print('='*50, flush=True)
            
            try:
                status, messages = mail.select('Junk')
                if status == 'OK':
                    status, data = mail.search(None, 'ALL')
                    if status == 'OK':
                        msg_ids = data[0].split()
                        print(f'找到 {len(msg_ids)} 封邮件', flush=True)
                        
                        if msg_ids:
                            process_email_batch(mail, msg_ids, cutoff_date, stats, '垃圾箱')
                        
                        print('垃圾箱 清理完成', flush=True)
            except Exception as e:
                print(f'垃圾箱处理出错: {str(e)}', flush=True)
        
        mail.close()
        mail.logout()
        
    except socket.timeout:
        stats['errors'].append('连接超时')
        print('错误: 连接超时', flush=True)
    except Exception as e:
        stats['errors'].append('错误: ' + str(e))
        print(f'错误: {str(e)}', flush=True)
    finally:
        if mail:
            try:
                mail.logout()
            except:
                pass
    
    # 生成报告
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print('\n' + '='*60, flush=True)
    print('清理报告', flush=True)
    print('='*60, flush=True)
    print(f'执行时间: {duration:.1f} 秒', flush=True)
    print(f'检查邮件总数: {stats["total_checked"]}', flush=True)
    print(f'强制删除: {len(stats["deleted_force"])} 封', flush=True)
    print(f'关键词删除: {len(stats["deleted_keywords"])} 封', flush=True)
    print(f'过期删除: {len(stats["deleted_old"])} 封', flush=True)
    print(f'保留重要邮件: {stats["skipped_important"]} 封', flush=True)
    print(f'错误数: {len(stats["errors"])}', flush=True)
    
    if timeout_occurred:
        print('\n⚠️ 注意: 执行因接近时间限制而提前结束', flush=True)
    
    if stats['deleted_force']:
        print('\n--- 强制删除的邮件 ---', flush=True)
        for item in stats['deleted_force'][:5]:
            print(f'  [{item["folder"]}] {item["sender"]}: {item["subject"][:40]}', flush=True)
        if len(stats['deleted_force']) > 5:
            print(f'  ... 还有 {len(stats["deleted_force"]) - 5} 封', flush=True)
    
    if stats['deleted_keywords']:
        print('\n--- 关键词删除的邮件 ---', flush=True)
        for item in stats['deleted_keywords'][:5]:
            print(f'  [{item["folder"]}] [{item["keyword"]}] {item["sender"]}: {item["subject"][:40]}', flush=True)
        if len(stats['deleted_keywords']) > 5:
            print(f'  ... 还有 {len(stats["deleted_keywords"]) - 5} 封', flush=True)
    
    if stats['errors']:
        print('\n--- 错误信息 ---', flush=True)
        for err in stats['errors']:
            print(f'  ! {err}', flush=True)
    
    print(f'\n结束时间: {end_time.strftime("%Y-%m-%d %H:%M:%S")}', flush=True)
    print('='*60, flush=True)
    
    # 返回执行时间（用于监控）
    return duration

if __name__ == '__main__':
    duration = main()
    # 如果执行时间超过120秒，返回非零退出码
    if duration > MAX_EXECUTION_TIME:
        sys.exit(1)
    sys.exit(0)
