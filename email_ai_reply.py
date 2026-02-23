#!/usr/bin/env python3
import imaplib
import smtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
import re

# 邮箱配置
EMAIL_USER = 'hourglass.yang@gmail.com'
EMAIL_PASS = 'otrittdcxhfxcxsi'
IMAP_SERVER = 'imap.gmail.com'
SMTP_SERVER = 'smtp.gmail.com'

print('=== AI邮件助手启动 ===')
print(f'邮箱: {EMAIL_USER}')

# 连接IMAP
print('\n[1] 连接Gmail IMAP...')
try:
    imap = imaplib.IMAP4_SSL(IMAP_SERVER, 993)
    print('✓ IMAP SSL连接建立')
    imap.login(EMAIL_USER, EMAIL_PASS)
    print('✓ IMAP登录成功')
except Exception as e:
    print(f'✗ IMAP连接失败: {e}')
    exit(1)

# 选择INBOX
print('\n[2] 选择INBOX...')
status, data = imap.select('INBOX')
print(f'状态: {status}, 邮件数: {data[0].decode() if data else "N/A"}')

# 搜索未读邮件
print('\n[3] 搜索未读邮件...')
status, messages = imap.search(None, 'UNSEEN')
if status != 'OK':
    print(f'✗ 搜索邮件失败: {status}')
    imap.logout()
    exit(1)

message_ids = messages[0].split()
print(f'找到 {len(message_ids)} 封未读邮件')

if len(message_ids) == 0:
    print('\n=== 没有未读邮件，任务完成 ===')
    imap.logout()
    exit(0)

# 连接SMTP
print('\n[4] 连接SMTP...')
try:
    smtp = smtplib.SMTP_SSL(SMTP_SERVER, 465)
    print('✓ SMTP SSL连接建立')
    smtp.login(EMAIL_USER, EMAIL_PASS)
    print('✓ SMTP登录成功')
except Exception as e:
    print(f'✗ SMTP连接失败: {e}')
    imap.logout()
    exit(1)

# 处理每封未读邮件
processed_count = 0
for msg_id in message_ids:
    msg_id_str = msg_id.decode() if isinstance(msg_id, bytes) else msg_id
    print(f'\n--- 处理邮件 {msg_id_str} ---')
    
    # 获取邮件内容
    status, msg_data = imap.fetch(msg_id, '(RFC822)')
    if status != 'OK':
        print(f'✗ 获取邮件失败: {msg_id}')
        continue
    
    raw_email = msg_data[0][1]
    email_message = email.message_from_bytes(raw_email)
    
    # 解析邮件信息
    subject = email_message.get('Subject', '')
    from_addr = email_message.get('From', '')
    
    print(f'发件人: {from_addr}')
    print(f'主题: {subject}')
    
    # 提取邮件正文
    body = ''
    if email_message.is_multipart():
        for part in email_message.walk():
            content_type = part.get_content_type()
            if content_type == 'text/plain':
                try:
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    break
                except:
                    pass
            elif content_type == 'text/html' and not body:
                try:
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                except:
                    pass
    else:
        try:
            body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')
        except:
            body = str(email_message.get_payload())
    
    print(f'正文长度: {len(body)} 字符')
    
    # 检查是否需要发送报告
    need_report = any(keyword in body.lower() for keyword in ['发送报告', '报告', 'report', 'attachment'])
    print(f'需要发送报告: {need_report}')
    
    # 生成回复内容
    if need_report:
        reply_body = f'''您好，

我已收到您的邮件，并为您附上研究报告。

原邮件主题: {subject}

请查收附件中的报告文件。

此致
AI邮件助手
'''
    else:
        reply_body = f'''您好，

我已收到您的邮件。

原邮件主题: {subject}
您的请求/内容: 
{body[:500]}{'...' if len(body) > 500 else ''}

这是AI助手自动回复。如需发送报告，请在邮件中明确说明"发送报告"。

此致
AI邮件助手
'''
    
    # 创建回复邮件
    reply_msg = MIMEMultipart()
    reply_msg['From'] = EMAIL_USER
    reply_msg['To'] = from_addr
    reply_msg['Subject'] = f'Re: {subject}'
    reply_msg.attach(MIMEText(reply_body, 'plain', 'utf-8'))
    
    # 如果需要，添加附件
    if need_report:
        report_path = '/root/.openclaw/workspace/research_report.pdf'
        if os.path.exists(report_path):
            try:
                with open(report_path, 'rb') as f:
                    attachment = MIMEBase('application', 'pdf')
                    attachment.set_payload(f.read())
                encoders.encode_base64(attachment)
                attachment.add_header('Content-Disposition', 'attachment', filename='research_report.pdf')
                reply_msg.attach(attachment)
                print('✓ 已附加报告文件')
            except Exception as e:
                print(f'✗ 附加文件失败: {e}')
        else:
            print('✗ 报告文件不存在')
    
    # 发送邮件
    try:
        smtp.sendmail(EMAIL_USER, [from_addr], reply_msg.as_string())
        print(f'✓ 回复已发送至: {from_addr}')
        
        # 标记为已读
        imap.store(msg_id, '+FLAGS', r'\Seen')
        print('✓ 邮件已标记为已读')
        
        processed_count += 1
    except Exception as e:
        print(f'✗ 发送失败: {e}')

# 关闭连接
print('\n[5] 关闭连接...')
smtp.quit()
imap.close()
imap.logout()
print('✓ 连接已关闭')

print(f'\n=== 任务完成 ===')
print(f'处理邮件数: {processed_count}/{len(message_ids)}')
