#!/usr/bin/env python3
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# QQ邮箱配置
smtp_server = "smtp.qq.com"
smtp_port = 587
sender_email = os.environ.get("QQ_EMAIL", "")
sender_password = os.environ.get("QQ_EMAIL_PASSWORD", "")

recipient = "495168397@qq.com"
subject = "【非洲情报】14:00简报 - 2026年2月25日"
body = """Hourglass，

【非洲当地时间14:00情报摘要】已生成，请查收附件。

简要概览：
1. 刚果（金）钴出口限制持续 — 暴露中国关键矿产供应链脆弱性
2. 中美非洲矿产竞争白热化 — 美国加速布局非洲关键矿产
3. 南非零关税政策获积极反响 — 5月1日起正式实施
4. 尼日利亚安全局势 — 近期无新增涉华安全事件

详细内容请查看附件Word文档。

—— 侧影
"""

attachment_path = "/root/.openclaw/workspace/africa_report_20260225_1400.docx"

# 创建邮件
msg = MIMEMultipart()
msg['From'] = sender_email
msg['To'] = recipient
msg['Subject'] = subject

# 添加正文
msg.attach(MIMEText(body, 'plain', 'utf-8'))

# 添加附件
if os.path.exists(attachment_path):
    with open(attachment_path, 'rb') as f:
        attachment = MIMEBase('application', 'octet-stream')
        attachment.set_payload(f.read())
    encoders.encode_base64(attachment)
    attachment.add_header(
        'Content-Disposition',
        f'attachment; filename=非洲情报_14:00简报_20260225.docx'
    )
    msg.attach(attachment)
    print(f"附件已添加: {attachment_path}")
else:
    print(f"警告: 附件不存在 {attachment_path}")

# 发送邮件
try:
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(sender_email, sender_password)
    server.send_message(msg)
    server.quit()
    print("邮件发送成功")
except Exception as e:
    print(f"邮件发送失败: {e}")
