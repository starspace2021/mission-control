#!/usr/bin/env python3
"""
Send academic briefing report via QQ Mail (SMTP)
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

# QQ Mail SMTP settings
SMTP_SERVER = "smtp.qq.com"
SMTP_PORT = 587
SENDER_EMAIL = "495168397@qq.com"
SENDER_PASSWORD = "wujsuiuwyabgcbda"  # QQ邮箱授权码

# Read the markdown report
report_path = "/root/.openclaw/workspace/academic-research/daily-briefing-2026-02-26.md"
with open(report_path, 'r', encoding='utf-8') as f:
    report_content = f.read()

# Create message
msg = MIMEMultipart()
msg['From'] = SENDER_EMAIL
msg['To'] = SENDER_EMAIL  # Send to self
msg['Subject'] = "【学术简报】量化金融与遥感情报 - 2026-02-26"

# Attach the markdown content as text
msg.attach(MIMEText(report_content, 'plain', 'utf-8'))

# Attach the markdown file
with open(report_path, 'rb') as f:
    attachment = MIMEApplication(f.read(), Name='daily-briefing-2026-02-26.md')
    attachment['Content-Disposition'] = 'attachment; filename="daily-briefing-2026-02-26.md"'
    msg.attach(attachment)

try:
    # Connect to SMTP server
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    
    # Send email
    server.send_message(msg)
    server.quit()
    print("✅ Email sent successfully!")
except Exception as e:
    print(f"❌ Failed to send email: {e}")
