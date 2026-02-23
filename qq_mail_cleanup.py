#!/usr/bin/env python3
import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
import re
import sys

EMAIL = '495168397@qq.com'
PASSWORD = 'ghvuapitdfwqbiee'
IMAP_SERVER = 'imap.qq.com'
IMAP_PORT = 993

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

cutoff_date = datetime.now() - timedelta(days=30)

stats = {
    'total_checked': 0,
    'deleted_force': [],
    'deleted_keywords': [],
    'deleted_old': [],
    'skipped_important': 0,
    'errors': []
}

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

print('='*60, flush=True)
print('QQ邮箱清理助手', flush=True)
print('开始时间: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'), flush=True)
print('='*60, flush=True)

try:
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
            print('找到 ' + str(len(msg_ids)) + ' 封邮件', flush=True)
            
            for msg_id in msg_ids:
                try:
                    status, msg_data = mail.fetch(msg_id, '(RFC822)')
                    if status != 'OK':
                        continue
                    
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    
                    stats['total_checked'] += 1
                    
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
                            'folder': '收件箱'
                        })
                        print('  [删除-强制] ' + sender + ': ' + subject[:50], flush=True)
                        continue
                    
                    has_spam_keyword, matched_keyword = should_delete_by_keywords(subject, sender)
                    if has_spam_keyword:
                        mail.store(msg_id, '+FLAGS', '\\Deleted')
                        stats['deleted_keywords'].append({
                            'sender': sender,
                            'subject': subject,
                            'keyword': matched_keyword,
                            'folder': '收件箱'
                        })
                        print('  [删除-关键词:' + matched_keyword + '] ' + sender + ': ' + subject[:50], flush=True)
                        continue
                    
                    if date and date < cutoff_date:
                        mail.store(msg_id, '+FLAGS', '\\Deleted')
                        stats['deleted_old'].append({
                            'sender': sender,
                            'subject': subject,
                            'date': date.strftime('%Y-%m-%d'),
                            'folder': '收件箱'
                        })
                        print('  [删除-过期:' + date.strftime('%Y-%m-%d') + '] ' + sender + ': ' + subject[:50], flush=True)
                        continue
                    
                except Exception as e:
                    stats['errors'].append(str(e))
                    continue
            
            mail.expunge()
            print('收件箱 清理完成', flush=True)
    
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
                print('找到 ' + str(len(msg_ids)) + ' 封邮件', flush=True)
                
                for msg_id in msg_ids:
                    try:
                        status, msg_data = mail.fetch(msg_id, '(RFC822)')
                        if status != 'OK':
                            continue
                        
                        raw_email = msg_data[0][1]
                        msg = email.message_from_bytes(raw_email)
                        
                        stats['total_checked'] += 1
                        
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
                                'folder': '垃圾箱'
                            })
                            print('  [删除-强制] ' + sender + ': ' + subject[:50], flush=True)
                            continue
                        
                        has_spam_keyword, matched_keyword = should_delete_by_keywords(subject, sender)
                        if has_spam_keyword:
                            mail.store(msg_id, '+FLAGS', '\\Deleted')
                            stats['deleted_keywords'].append({
                                'sender': sender,
                                'subject': subject,
                                'keyword': matched_keyword,
                                'folder': '垃圾箱'
                            })
                            print('  [删除-关键词:' + matched_keyword + '] ' + sender + ': ' + subject[:50], flush=True)
                            continue
                        
                        if date and date < cutoff_date:
                            mail.store(msg_id, '+FLAGS', '\\Deleted')
                            stats['deleted_old'].append({
                                'sender': sender,
                                'subject': subject,
                                'date': date.strftime('%Y-%m-%d'),
                                'folder': '垃圾箱'
                            })
                            print('  [删除-过期:' + date.strftime('%Y-%m-%d') + '] ' + sender + ': ' + subject[:50], flush=True)
                            continue
                        
                    except Exception as e:
                        stats['errors'].append(str(e))
                        continue
                
                mail.expunge()
                print('垃圾箱 清理完成', flush=True)
    except Exception as e:
        print('垃圾箱处理出错: ' + str(e), flush=True)
    
    mail.close()
    mail.logout()
    
except Exception as e:
    stats['errors'].append('错误: ' + str(e))
    print('错误: ' + str(e), flush=True)

print('\n' + '='*60, flush=True)
print('清理报告', flush=True)
print('='*60, flush=True)
print('检查邮件总数: ' + str(stats['total_checked']), flush=True)
print('强制删除: ' + str(len(stats['deleted_force'])) + ' 封', flush=True)
print('关键词删除: ' + str(len(stats['deleted_keywords'])) + ' 封', flush=True)
print('过期删除: ' + str(len(stats['deleted_old'])) + ' 封', flush=True)
print('保留重要邮件: ' + str(stats['skipped_important']) + ' 封', flush=True)
print('错误数: ' + str(len(stats['errors'])), flush=True)

if stats['deleted_force']:
    print('\n--- 强制删除的邮件 ---', flush=True)
    for item in stats['deleted_force']:
        print('  [' + item['folder'] + '] ' + item['sender'] + ': ' + item['subject'][:40], flush=True)

if stats['deleted_keywords']:
    print('\n--- 关键词删除的邮件 ---', flush=True)
    for item in stats['deleted_keywords']:
        print('  [' + item['folder'] + '] [' + item['keyword'] + '] ' + item['sender'] + ': ' + item['subject'][:40], flush=True)

if stats['deleted_old']:
    print('\n--- 过期删除的邮件 (显示前10封) ---', flush=True)
    for item in stats['deleted_old'][:10]:
        print('  [' + item['folder'] + '] [' + item['date'] + '] ' + item['sender'] + ': ' + item['subject'][:40], flush=True)
    if len(stats['deleted_old']) > 10:
        print('  ... 还有 ' + str(len(stats['deleted_old']) - 10) + ' 封', flush=True)

if stats['errors']:
    print('\n--- 错误信息 ---', flush=True)
    for err in stats['errors']:
        print('  ! ' + err, flush=True)

print('\n结束时间: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'), flush=True)
print('='*60, flush=True)
