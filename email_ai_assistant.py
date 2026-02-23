#!/usr/bin/env python3
"""
Gmail AI 邮件助手
由于网络限制，当前无法直接连接 Gmail IMAP/SMTP 服务器
"""

import imaplib
import smtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
import socks
import socket

def set_proxy():
    """设置 SOCKS5 代理（如果可用）"""
    # 检查常见代理端口
    proxy_ports = [1080, 7890, 7891, 8080, 9050]
    proxy_hosts = ['127.0.0.1', 'localhost']
    
    for host in proxy_hosts:
        for port in proxy_ports:
            try:
                test_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                test_sock.settimeout(2)
                result = test_sock.connect_ex((host, port))
                test_sock.close()
                if result == 0:
                    print(f"检测到代理: {host}:{port}")
                    socks.set_default_proxy(socks.SOCKS5, host, port)
                    socket.socket = socks.socksocket
                    return True
            except:
                pass
    return False

def main():
    # 获取环境变量
    EMAIL_USER = os.getenv('EMAIL_USER')
    EMAIL_PASS = os.getenv('EMAIL_PASS')
    IMAP_SERVER = os.getenv('IMAP_SERVER', 'imap.gmail.com')
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    
    if not EMAIL_USER or not EMAIL_PASS:
        print("错误: 未设置 EMAIL_USER 或 EMAIL_PASS 环境变量")
        return
    
    print(f"邮箱用户: {EMAIL_USER}")
    print(f"IMAP 服务器: {IMAP_SERVER}")
    print(f"SMTP 服务器: {SMTP_SERVER}")
    
    # 尝试设置代理
    proxy_set = set_proxy()
    if proxy_set:
        print("已启用代理")
    else:
        print("未检测到代理，尝试直接连接...")
    
    # 连接 IMAP
    print(f"\n正在连接 IMAP 服务器...")
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, timeout=30)
        print("IMAP SSL 连接成功")
        mail.login(EMAIL_USER, EMAIL_PASS)
        print("IMAP 登录成功")
    except Exception as e:
        print(f"IMAP 连接失败: {e}")
        print("\n可能的原因:")
        print("1. 网络限制 - 当前环境可能无法访问 Gmail")
        print("2. 需要应用专用密码 - Gmail 需要生成应用专用密码而不是账户密码")
        print("3. IMAP 未启用 - 需要在 Gmail 设置中启用 IMAP 访问")
        return
    
    # 选择收件箱
    mail.select('INBOX')
    
    # 搜索未读邮件
    status, messages = mail.search(None, 'UNSEEN')
    if status != 'OK':
        print("搜索邮件失败")
        mail.logout()
        return
    
    message_ids = messages[0].split()
    print(f"\n找到 {len(message_ids)} 封未读邮件")
    
    if len(message_ids) == 0:
        print("没有未读邮件需要处理")
        mail.logout()
        return
    
    # 处理每封邮件
    processed = 0
    for msg_id in message_ids:
        print(f"\n--- 处理邮件 ID: {msg_id.decode()} ---")
        
        try:
            status, msg_data = mail.fetch(msg_id, '(RFC822)')
            if status != 'OK':
                print(f"获取邮件失败")
                continue
            
            raw_email = msg_data[0][1]
            email_message = email.message_from_bytes(raw_email)
            
            subject = email_message.get('Subject', '')
            from_addr = email.utils.parseaddr(email_message.get('From', ''))[1]
            
            print(f"发件人: {from_addr}")
            print(f"主题: {subject}")
            
            # 提取正文
            body = ""
            if email_message.is_multipart():
                for part in email_message.walk():
                    content_type = part.get_content_type()
                    if content_type == "text/plain":
                        try:
                            body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                            break
                        except:
                            pass
            else:
                try:
                    body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')
                except:
                    body = str(email_message.get_payload())
            
            print(f"正文预览: {body[:100]}...")
            
            # 检查是否需要发送报告
            need_report = any(kw in body.lower() for kw in ['报告', 'report', '发送', 'send'])
            
            # 构建回复
            reply_subject = f"Re: {subject}" if not subject.startswith('Re:') else subject
            reply_body = f"""您好，

我已收到您的邮件。

原邮件信息：
- 主题: {subject}
- 内容摘要: {body[:200]}{'...' if len(body) > 200 else ''}

此邮件由 AI 助手自动回复。

祝好！
"""
            
            # 发送回复
            msg = MIMEMultipart()
            msg['From'] = EMAIL_USER
            msg['To'] = from_addr
            msg['Subject'] = reply_subject
            msg.attach(MIMEText(reply_body, 'plain', 'utf-8'))
            
            # 附加报告（如果需要）
            report_path = '/root/.openclaw/workspace/research_report.pdf'
            if need_report and os.path.exists(report_path):
                print("附加报告文件...")
                with open(report_path, 'rb') as f:
                    attachment = MIMEBase('application', 'pdf')
                    attachment.set_payload(f.read())
                encoders.encode_base64(attachment)
                attachment.add_header('Content-Disposition', 'attachment; filename="research_report.pdf"')
                msg.attach(attachment)
            
            # SMTP 发送
            print(f"发送回复到 {from_addr}...")
            with smtplib.SMTP_SSL(SMTP_SERVER, 465, timeout=30) as smtp:
                smtp.login(EMAIL_USER, EMAIL_PASS)
                smtp.send_message(msg)
            print("回复发送成功")
            
            # 标记为已读
            mail.store(msg_id, '+FLAGS', '\\Seen')
            print("已标记为已读")
            processed += 1
            
        except Exception as e:
            print(f"处理邮件时出错: {e}")
            continue
    
    mail.logout()
    print(f"\n处理完成: {processed}/{len(message_ids)} 封邮件")

if __name__ == '__main__':
    main()
