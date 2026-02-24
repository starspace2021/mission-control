import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os

# QQ邮箱配置
smtp_server = "smtp.qq.com"
smtp_port = 465
sender_email = "495168397@qq.com"
sender_password = "wujsuiuwyabgcbda"  # 授权码

# 收件人
receiver_email = "495168397@qq.com"

def send_email(subject, body, attachment_path):
    """发送带附件的邮件"""
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    
    # 邮件正文
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    
    # 添加附件
    if attachment_path and os.path.exists(attachment_path):
        filename = os.path.basename(attachment_path)
        with open(attachment_path, "rb") as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
        
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename= {filename}',
        )
        msg.attach(part)
    
    # 发送邮件
    try:
        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()
        print(f"✓ 邮件发送成功: {subject}")
        return True
    except Exception as e:
        print(f"✗ 邮件发送失败: {subject}")
        print(f"  错误: {str(e)}")
        return False

# 邮件内容
emails = [
    {
        'subject': '【美国对华政策监控】日报 - 2026-02-24',
        'body': '''尊敬的用户：

您好！

附件为2026年2月24日美国对华政策监控日报，报告时段为过去24小时（2026-02-23 10:30 至 2026-02-24 10:30）。

报告要点：
• 特朗普政府维持对华10%额外关税政策
• 中国对五种关键金属实施出口管制反制
• 半导体出口管制持续收紧
• 28家美国防务公司被列入中方出口管制清单

如有任何问题，请随时联系。

此致
敬礼！

---
自动生成报告系统
''',
        'attachment': '/root/.openclaw/workspace/us_china_policy_report_20260224.docx'
    },
    {
        'subject': '【非洲情报】过去24小时综合简报 - 2026-02-24',
        'body': '''尊敬的用户：

您好！

附件为2026年2月24日非洲涉华情报日报，报告时段为过去24小时。

报告要点：
• 中国继续推进与非洲国家的太空合作协议
• 尼日利亚-中国投资峰会筹备工作推进
• 中非贸易额达2950亿美元，同比增长3.8%
• 苏丹、刚果(金)等国家安全风险需持续关注

如有任何问题，请随时联系。

此致
敬礼！

---
自动生成报告系统
''',
        'attachment': '/root/.openclaw/workspace/africa_intel_report_20260224.docx'
    },
    {
        'subject': '【Polymarket】每日简报 - 2026-02-24',
        'body': '''尊敬的用户：

您好！

附件为2026年2月24日Polymarket每日简报，数据日期为2026年2月23日。

报告要点：
• 平台过去24小时交易量约$45M
• 月度活跃用户约510万
• 美国建立比特币储备概率：51%
• 地缘政治类市场关注度上升

如有任何问题，请随时联系。

此致
敬礼！

---
自动生成报告系统
''',
        'attachment': '/root/.openclaw/workspace/polymarket_report_20260224.docx'
    }
]

# 发送所有邮件
print("=" * 50)
print("开始发送邮件...")
print("=" * 50)

success_count = 0
for email in emails:
    if send_email(email['subject'], email['body'], email['attachment']):
        success_count += 1
    print()

print("=" * 50)
print(f"发送完成: {success_count}/{len(emails)} 封邮件发送成功")
print("=" * 50)
