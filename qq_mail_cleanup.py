#!/usr/bin/env python3
# QQ邮箱清理脚本 - 最终版

import imaplib
import ssl
import email
from email.header import decode_header
from datetime import datetime, timedelta
import re
import socket

# 设置超时
socket.setdefaulttimeout(60)

# 邮箱配置
IMAP_SERVER = "imap.qq.com"
IMAP_PORT = 993
EMAIL = "495168397@qq.com"
PASSWORD = "ghvuapitdfwqbiee"

# 强制删除的发件人列表
FORCE_DELETE_SENDERS = [
    "no_reply@email.apple.com",
    "do_not_reply@email.apple.com"
]

# 关键词列表
SPAM_KEYWORDS = [
    "广告", "推广", "优惠", "促销", "特价", "秒杀",
    "贷款", "信用卡", "保险", "理财", "投资",
    "招聘", "兼职", "刷单", "返利",
    "中奖", "抽奖", "免费领",
    "代写", "论文", "考试",
    "色情", "赌博", "博彩"
]

def decode_str(s):
    if s is None:
        return ""
    try:
        decoded = decode_header(s)
        result = ""
        for part, charset in decoded:
            if isinstance(part, bytes):
                if charset:
                    result += part.decode(charset, errors='ignore')
                else:
                    result += part.decode('utf-8', errors='ignore')
            else:
                result += part
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

def get_subject(msg):
    subject = msg.get("Subject", "")
    return decode_str(subject)

def get_date(msg):
    date_str = msg.get("Date", "")
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(date_str)
    except:
        return None

def should_delete_by_keywords(subject, sender):
    text = (subject + " " + sender).lower()
    for keyword in SPAM_KEYWORDS:
        if keyword in text:
            return True, keyword
    return False, None

def process_folder(mail, folder_name, folder_label, stats):
    print(f"\n正在选择 {folder_label}...")
    status, _ = mail.select(folder_name, readonly=False)
    if status != "OK":
        print(f"✗ 无法选择 {folder_label}")
        return
    
    print(f"正在搜索邮件...")
    status, data = mail.search(None, "ALL")
    if status != "OK":
        print(f"✗ 无法搜索 {folder_label}")
        return
    
    email_ids = data[0].split()
    total = len(email_ids)
    print(f"发现 {total} 封邮件")
    
    if total == 0:
        return
    
    cutoff_date = datetime.now() - timedelta(days=30)
    to_delete = []
    
    print("开始分析邮件...")
    for i, email_id in enumerate(email_ids):
        try:
            status, msg_data = mail.fetch(email_id, "(RFC822)")
            if status != "OK":
                continue
            
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            sender = get_sender(msg)
            subject = get_subject(msg)
            date = get_date(msg)
            
            # 规则1: 强制删除特定发件人
            if sender in FORCE_DELETE_SENDERS:
                to_delete.append((email_id, "force", sender, subject))
                continue
            
            # 规则2: 关键词匹配
            should_delete, matched_keyword = should_delete_by_keywords(subject, sender)
            if should_delete:
                to_delete.append((email_id, "keyword", sender, subject, matched_keyword))
                continue
            
            # 规则3: 超过30天的邮件
            if date and date < cutoff_date:
                to_delete.append((email_id, "old", sender, subject, str(date)[:10]))
                
        except Exception as e:
            continue
        
        if (i + 1) % 50 == 0:
            print(f"  已分析 {i + 1}/{total} 封邮件...")
    
    print(f"分析完成，准备删除 {len(to_delete)} 封邮件...")
    
    # 执行删除
    for item in to_delete:
        email_id = item[0]
        delete_type = item[1]
        sender = item[2]
        subject = item[3]
        
        try:
            mail.store(email_id, "+FLAGS", "\\Deleted")
            
            if delete_type == "force":
                stats["deleted_force"].append({
                    "folder": folder_label,
                    "sender": sender,
                    "subject": subject[:50] + "..." if len(subject) > 50 else subject
                })
            elif delete_type == "keyword":
                stats["deleted_keywords"].append({
                    "folder": folder_label,
                    "sender": sender,
                    "subject": subject[:50] + "..." if len(subject) > 50 else subject,
                    "keyword": item[4]
                })
            elif delete_type == "old":
                stats["deleted_old"].append({
                    "folder": folder_label,
                    "sender": sender,
                    "subject": subject[:50] + "..." if len(subject) > 50 else subject,
                    "date": item[4]
                })
        except Exception as e:
            pass
    
    # 执行永久删除
    if to_delete:
        mail.expunge()
        print(f"✓ 已删除 {len(to_delete)} 封邮件")
    else:
        print("✓ 没有需要删除的邮件")

def main():
    print("=" * 50)
    print("QQ邮箱清理助手")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    stats = {
        "deleted_force": [],
        "deleted_keywords": [],
        "deleted_old": []
    }
    
    try:
        print("\n正在连接邮箱服务器...")
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        print("✓ 服务器连接成功")
        
        print("正在登录...")
        mail.login(EMAIL, PASSWORD)
        print(f"✓ 登录成功: {EMAIL}")
        
        # 处理收件箱
        print("\n【处理收件箱】")
        process_folder(mail, "INBOX", "收件箱", stats)
        
        # 处理垃圾箱
        print("\n【处理垃圾箱】")
        trash_folders = ["Junk", "Spam", "垃圾邮件", "垃圾箱"]
        trash_found = False
        for trash_name in trash_folders:
            try:
                status, _ = mail.select(trash_name, readonly=False)
                if status == "OK":
                    print(f"找到垃圾箱: {trash_name}")
                    mail.close()
                    process_folder(mail, trash_name, "垃圾箱", stats)
                    trash_found = True
                    break
            except:
                continue
        if not trash_found:
            print("未找到垃圾箱或垃圾箱为空")
        
        mail.close()
        mail.logout()
        
        # 输出报告
        print("\n" + "=" * 50)
        print("清理报告")
        print("=" * 50)
        
        total_deleted = len(stats["deleted_force"]) + len(stats["deleted_keywords"]) + len(stats["deleted_old"])
        
        print(f"\n总计删除: {total_deleted} 封邮件")
        print(f"  - 强制删除（Apple邮件）: {len(stats['deleted_force'])} 封")
        print(f"  - 关键词匹配删除: {len(stats['deleted_keywords'])} 封")
        print(f"  - 过期邮件删除（>30天）: {len(stats['deleted_old'])} 封")
        
        if stats["deleted_force"]:
            print("\n【强制删除详情】")
            for item in stats["deleted_force"][:5]:
                print(f"  - [{item['folder']}] {item['sender']}")
                print(f"    {item['subject']}")
            if len(stats["deleted_force"]) > 5:
                print(f"  ... 还有 {len(stats['deleted_force']) - 5} 封")
        
        if stats["deleted_keywords"]:
            print("\n【关键词删除详情】")
            for item in stats["deleted_keywords"][:5]:
                print(f"  - [{item['folder']}] [{item['keyword']}] {item['sender']}")
                print(f"    {item['subject']}")
            if len(stats["deleted_keywords"]) > 5:
                print(f"  ... 还有 {len(stats['deleted_keywords']) - 5} 封")
        
        if stats["deleted_old"]:
            print("\n【过期邮件删除详情】")
            for item in stats["deleted_old"][:3]:
                print(f"  - [{item['folder']}] {item['date']} {item['sender']}")
            if len(stats["deleted_old"]) > 3:
                print(f"  ... 还有 {len(stats['deleted_old']) - 3} 封")
        
        print("\n✓ 清理完成")
        
    except Exception as e:
        print(f"\n✗ 错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
