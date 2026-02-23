#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
QQ邮箱清理助手 - 简化版
"""

import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
import re
import socket

# 设置超时
socket.setdefaulttimeout(15)

# 邮箱配置
EMAIL = "495168397@qq.com"
PASSWORD = "ghvuapitdfwqbiee"
IMAP_SERVER = "imap.qq.com"
IMAP_PORT = 993

# 强制删除的发件人
FORCE_DELETE_SENDERS = [
    "no_reply@email.apple.com",
    "do_not_reply@email.apple.com"
]

# 垃圾关键词
SPAM_KEYWORDS = [
    "广告", "推广", "优惠", "促销", "特价", "秒杀",
    "贷款", "信用卡", "保险", "理财", "投资",
    "招聘", "兼职", "刷单", "返利",
    "中奖", "抽奖", "免费领",
    "代写", "论文", "考试",
    "色情", "赌博", "博彩"
]

DAYS_THRESHOLD = 30

def decode_str(s):
    if not s:
        return ""
    try:
        decoded = decode_header(s)
        result = ""
        for content, charset in decoded:
            if isinstance(content, bytes):
                if charset:
                    result += content.decode(charset, errors='ignore')
                else:
                    result += content.decode('utf-8', errors='ignore')
            else:
                result += content
        return result
    except:
        return str(s)

def get_sender(msg):
    from_header = msg.get("From", "")
    match = re.search(r'<([^>]+)>', from_header)
    if match:
        return match.group(1).lower()
    if '@' in from_header:
        return from_header.strip().lower()
    return from_header.lower()

def get_sender_name(msg):
    return decode_str(msg.get("From", ""))

def get_subject(msg):
    return decode_str(msg.get("Subject", ""))

def get_date(msg):
    date_str = msg.get("Date", "")
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(date_str)
    except:
        return None

def is_old_email(date):
    if not date:
        return False
    cutoff_date = datetime.now(date.tzinfo) - timedelta(days=DAYS_THRESHOLD)
    return date < cutoff_date

def has_spam_keywords(subject):
    subject_lower = subject.lower()
    for keyword in SPAM_KEYWORDS:
        if keyword in subject_lower:
            return True, keyword
    return False, None

def should_force_delete(sender):
    sender_lower = sender.lower()
    for force_sender in FORCE_DELETE_SENDERS:
        if force_sender.lower() in sender_lower:
            return True
    return False

def main():
    print("="*60)
    print("QQ邮箱清理助手")
    print("="*60)
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"账号: {EMAIL}")
    print()
    
    # 连接
    print("[1/4] 正在连接QQ邮箱...")
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        print("      ✓ SSL连接成功")
        mail.login(EMAIL, PASSWORD)
        print("      ✓ 登录成功")
    except Exception as e:
        print(f"      ✗ 连接失败: {e}")
        return
    
    deleted_emails = []
    stats = {"checked": 0, "deleted": 0, "force": 0, "keyword": 0, "old": 0}
    
    # 处理收件箱
    print("\n[2/4] 正在检查收件箱...")
    try:
        status, messages = mail.select("INBOX", readonly=False)
        if status == 'OK':
            msg_count = int(messages[0])
            print(f"      邮件总数: {msg_count}")
            
            if msg_count > 0:
                status, data = mail.search(None, 'ALL')
                if status == 'OK':
                    email_ids = data[0].split()
                    stats["checked"] += len(email_ids)
                    print(f"      开始处理 {len(email_ids)} 封邮件...")
                    
                    for i, email_id in enumerate(email_ids):
                        if i >= 100:  # 限制处理数量
                            print(f"      (已达到处理上限100封)")
                            break
                            
                        try:
                            status, msg_data = mail.fetch(email_id, '(RFC822)')
                            if status != 'OK':
                                continue
                            
                            raw_email = msg_data[0][1]
                            msg = email.message_from_bytes(raw_email)
                            
                            sender = get_sender(msg)
                            sender_name = get_sender_name(msg)
                            subject = get_subject(msg)
                            date = get_date(msg)
                            
                            should_delete = False
                            reason = ""
                            
                            # 强制删除
                            if should_force_delete(sender):
                                should_delete = True
                                reason = "强制删除发件人"
                                stats["force"] += 1
                            # 关键词
                            elif not should_delete:
                                has_spam, keyword = has_spam_keywords(subject)
                                if has_spam:
                                    should_delete = True
                                    reason = f"关键词: {keyword}"
                                    stats["keyword"] += 1
                            # 旧邮件
                            elif not should_delete and is_old_email(date):
                                should_delete = True
                                reason = f"超过{DAYS_THRESHOLD}天"
                                stats["old"] += 1
                            
                            if should_delete:
                                mail.store(email_id, '+FLAGS', '\\Deleted')
                                deleted_emails.append({
                                    "folder": "收件箱",
                                    "sender": sender_name[:50],
                                    "subject": subject[:50],
                                    "reason": reason
                                })
                                stats["deleted"] += 1
                                print(f"      [删] {sender[:25]:<25} | {subject[:25]:<25} | {reason}")
                        
                        except Exception as e:
                            continue
                    
                    mail.expunge()
                    print(f"      ✓ 收件箱处理完成，删除 {stats['deleted']} 封")
        else:
            print(f"      ✗ 无法访问收件箱")
    except Exception as e:
        print(f"      ✗ 错误: {e}")
    
    # 处理垃圾箱
    print("\n[3/4] 正在检查垃圾箱...")
    junk_names = ["Junk", "Trash", "垃圾邮件", "Spam"]
    junk_found = False
    for junk_name in junk_names:
        try:
            status, messages = mail.select(junk_name, readonly=False)
            if status == 'OK':
                junk_found = True
                msg_count = int(messages[0])
                print(f"      文件夹 '{junk_name}' 找到，邮件数: {msg_count}")
                
                if msg_count > 0:
                    status, data = mail.search(None, 'ALL')
                    if status == 'OK':
                        email_ids = data[0].split()
                        stats["checked"] += len(email_ids)
                        
                        junk_deleted = 0
                        for email_id in email_ids[:100]:  # 限制100封
                            try:
                                status, msg_data = mail.fetch(email_id, '(RFC822)')
                                if status != 'OK':
                                    continue
                                
                                raw_email = msg_data[0][1]
                                msg = email.message_from_bytes(raw_email)
                                sender = get_sender(msg)
                                sender_name = get_sender_name(msg)
                                subject = get_subject(msg)
                                date = get_date(msg)
                                
                                should_delete = False
                                reason = ""
                                
                                if should_force_delete(sender):
                                    should_delete = True
                                    reason = "强制删除"
                                    stats["force"] += 1
                                elif not should_delete:
                                    has_spam, keyword = has_spam_keywords(subject)
                                    if has_spam:
                                        should_delete = True
                                        reason = f"关键词: {keyword}"
                                        stats["keyword"] += 1
                                elif is_old_email(date):
                                    should_delete = True
                                    reason = f"超过{DAYS_THRESHOLD}天"
                                    stats["old"] += 1
                                
                                if should_delete:
                                    mail.store(email_id, '+FLAGS', '\\Deleted')
                                    deleted_emails.append({
                                        "folder": "垃圾箱",
                                        "sender": sender_name[:50],
                                        "subject": subject[:50],
                                        "reason": reason
                                    })
                                    junk_deleted += 1
                                    stats["deleted"] += 1
                            except:
                                continue
                        
                        mail.expunge()
                        print(f"      ✓ 垃圾箱删除 {junk_deleted} 封")
                break
        except:
            continue
    
    if not junk_found:
        print("      ! 未找到垃圾箱文件夹")
    
    # 关闭连接
    print("\n[4/4] 正在断开连接...")
    try:
        mail.close()
        mail.logout()
        print("      ✓ 已断开")
    except:
        pass
    
    # 生成报告
    print("\n" + "="*60)
    print("                    清理报告")
    print("="*60)
    print(f"检查邮件总数: {stats['checked']} 封")
    print(f"删除邮件总数: {stats['deleted']} 封")
    print(f"  - 强制删除: {stats['force']} 封")
    print(f"  - 关键词匹配: {stats['keyword']} 封")
    print(f"  - 超过30天: {stats['old']} 封")
    
    if deleted_emails:
        print("\n【已删除邮件列表】")
        for i, e in enumerate(deleted_emails[:20], 1):  # 只显示前20条
            print(f"{i}. [{e['folder']}] {e['sender'][:30]:<30} | {e['subject'][:30]:<30}")
            print(f"   原因: {e['reason']}")
        if len(deleted_emails) > 20:
            print(f"... 还有 {len(deleted_emails) - 20} 封未显示")
    
    print("\n" + "="*60)
    print("清理完成!")
    print("="*60)

if __name__ == "__main__":
    main()
