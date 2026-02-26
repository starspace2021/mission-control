#!/usr/bin/env python3
"""
QQ邮箱清理脚本 - 简化版
连接QQ邮箱，按规则清理垃圾邮件
"""

import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
import re
import ssl
import socket

# 邮箱配置
EMAIL = "495168397@qq.com"
PASSWORD = "wujsuiuwyabgcbda"
IMAP_SERVER = "imap.qq.com"
IMAP_PORT = 993

# 强制删除的发件人列表
FORCED_DELETE_SENDERS = [
    "no_reply@email.apple.com",
    "do_not_reply@email.apple.com"
]

# 垃圾关键词列表
SPAM_KEYWORDS = [
    "广告", "推广", "优惠", "促销", "特价", "秒杀",
    "贷款", "信用卡", "保险", "理财", "投资",
    "招聘", "兼职", "刷单", "返利",
    "中奖", "抽奖", "免费领",
    "代写", "论文", "考试",
    "色情", "赌博", "博彩"
]


def decode_email_header(header):
    """解码邮件头"""
    if not header:
        return ""
    try:
        decoded_parts = decode_header(header)
        result = []
        for part, charset in decoded_parts:
            if isinstance(part, bytes):
                try:
                    result.append(part.decode(charset or 'utf-8', errors='replace'))
                except:
                    result.append(part.decode('utf-8', errors='replace'))
            else:
                result.append(part)
        return "".join(result)
    except:
        return str(header)


def get_sender(msg):
    """获取发件人邮箱"""
    from_header = msg.get("From", "")
    match = re.search(r'<([^>]+)>', from_header)
    if match:
        return match.group(1).lower()
    if '@' in from_header:
        return from_header.lower().strip()
    return from_header.lower()


def get_subject(msg):
    """获取邮件主题"""
    return decode_email_header(msg.get("Subject", ""))


def should_delete_by_sender(sender):
    """检查是否强制删除的发件人"""
    sender_lower = sender.lower()
    for forced_sender in FORCED_DELETE_SENDERS:
        if forced_sender.lower() in sender_lower:
            return True
    return False


def should_delete_by_keywords(subject):
    """检查主题是否包含垃圾关键词"""
    subject_lower = subject.lower()
    for keyword in SPAM_KEYWORDS:
        if keyword in subject_lower:
            return True, keyword
    return False, None


def parse_date(msg):
    """解析邮件日期"""
    date_str = msg.get("Date", "")
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(date_str)
    except:
        return None


def process_mailbox_quick(mail, folder, cutoff_date):
    """快速处理邮箱文件夹 - 只检查发件人和主题，不下载完整邮件"""
    deleted_count = 0
    skipped_important = 0
    sender_stats = {}
    
    try:
        status, _ = mail.select(folder)
        if status != 'OK':
            print(f"[!] 无法选择文件夹: {folder}")
            return deleted_count, skipped_important, sender_stats
        
        # 搜索所有邮件
        status, data = mail.search(None, 'ALL')
        if status != 'OK':
            print(f"[!] 搜索邮件失败: {folder}")
            return deleted_count, skipped_important, sender_stats
        
        msg_ids = data[0].split()
        total = len(msg_ids)
        print(f"[*] {folder}: 共 {total} 封邮件")
        
        # 限制处理数量
        MAX_EMAILS = 200
        if total > MAX_EMAILS:
            print(f"[*] 邮件较多，处理最新的 {MAX_EMAILS} 封")
            msg_ids = msg_ids[-MAX_EMAILS:]
        
        for i, msg_id in enumerate(msg_ids):
            try:
                # 只获取邮件头，不下载完整内容
                status, msg_data = mail.fetch(msg_id, '(BODY.PEEK[HEADER])')
                if status != 'OK':
                    continue
                
                msg = email.message_from_bytes(msg_data[0][1])
                sender = get_sender(msg)
                subject = get_subject(msg)
                msg_date = parse_date(msg)
                
                should_delete = False
                reason = ""
                
                # 规则1: 强制删除的发件人
                if should_delete_by_sender(sender):
                    should_delete = True
                    reason = f"强制删除发件人"
                
                # 规则2: 关键词匹配
                elif should_delete_by_keywords(subject)[0]:
                    keyword = should_delete_by_keywords(subject)[1]
                    should_delete = True
                    reason = f"关键词: {keyword}"
                
                # 规则3: 超过30天
                elif msg_date and msg_date < cutoff_date:
                    should_delete = True
                    reason = f"超30天"
                
                if should_delete:
                    mail.store(msg_id, '+FLAGS', '\\Deleted')
                    deleted_count += 1
                    
                    if sender not in sender_stats:
                        sender_stats[sender] = {"count": 0, "reasons": set()}
                    sender_stats[sender]["count"] += 1
                    sender_stats[sender]["reasons"].add(reason)
                    
                    if deleted_count <= 20:  # 只显示前20条详情
                        print(f"  [-] {sender[:40]:<40} | {subject[:30]:<30} | {reason}")
                
            except Exception as e:
                continue
        
        mail.expunge()
        print(f"[*] {folder} 完成: 删除 {deleted_count} 封\n")
        
    except Exception as e:
        print(f"[!] 处理 {folder} 出错: {e}")
    
    return deleted_count, skipped_important, sender_stats


def main():
    print("=" * 70)
    print("QQ邮箱清理报告")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()
    
    # 设置socket超时
    socket.setdefaulttimeout(30)
    
    try:
        print(f"[*] 连接 {IMAP_SERVER}:{IMAP_PORT} ...")
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        
        print(f"[*] 登录 {EMAIL} ...")
        mail.login(EMAIL, PASSWORD)
        print("[+] 登录成功\n")
        
        cutoff_date = datetime.now() - timedelta(days=30)
        
        # 处理收件箱
        inbox_deleted, inbox_skipped, inbox_stats = process_mailbox_quick(mail, "INBOX", cutoff_date)
        
        # 处理垃圾箱
        junk_deleted, junk_skipped, junk_stats = process_mailbox_quick(mail, "Junk", cutoff_date)
        
        mail.close()
        mail.logout()
        
        # 汇总统计
        total_deleted = inbox_deleted + junk_deleted
        
        # 合并发件人统计
        all_stats = {}
        for stats in [inbox_stats, junk_stats]:
            for sender, data in stats.items():
                if sender not in all_stats:
                    all_stats[sender] = {"count": 0, "reasons": set()}
                all_stats[sender]["count"] += data["count"]
                all_stats[sender]["reasons"].update(data["reasons"])
        
        print("=" * 70)
        print("清理汇总")
        print("=" * 70)
        print(f"总删除邮件数: {total_deleted}")
        print(f"  - 收件箱: {inbox_deleted} 封")
        print(f"  - 垃圾箱: {junk_deleted} 封")
        print()
        
        if all_stats:
            print("主要发件人:")
            sorted_senders = sorted(all_stats.items(), key=lambda x: x[1]["count"], reverse=True)
            for sender, stats in sorted_senders[:15]:
                reasons = ", ".join(list(stats["reasons"])[:2])
                print(f"  {stats['count']:>3} 封 | {sender:<40} | {reasons}")
        
        print()
        print("[+] 清理完成")
        
    except socket.timeout:
        print("[!] 连接超时，请检查网络或IMAP设置")
    except imaplib.IMAP4.error as e:
        print(f"[!] IMAP错误: {e}")
        print("[!] 可能原因: 授权码错误、IMAP未开启、或需要应用专用密码")
    except Exception as e:
        print(f"[!] 错误: {e}")


if __name__ == "__main__":
    main()
