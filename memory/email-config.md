# 邮件配置

## QQ 邮箱
- 邮箱: 495168397@qq.com
- SMTP/IMAP 授权码: bfghyfphetaecacj
- SMTP服务器: smtp.qq.com:465 (SSL)
- IMAP服务器: imap.qq.com:993 (SSL)

## Gmail (备用)
- 邮箱: hourglass.yang@gmail.com
- 应用专用密码: qxdsstmypovmmizf
- SMTP服务器: smtp.gmail.com:587 (STARTTLS)

## 默认收件人
**主邮箱**: 495168397@qq.com

## 使用方式

### Python 发送邮件
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# QQ邮箱
smtp_server = "smtp.qq.com"
smtp_port = 465
username = "495168397@qq.com"
password = "bfghyfphetaecacj"

msg = MIMEMultipart()
msg['From'] = username
msg['To'] = "495168397@qq.com"  # 默认发送到QQ邮箱
msg['Subject'] = "美国对华政策日报"

# 添加内容
msg.attach(MIMEText(content, 'plain', 'utf-8'))

# 发送
server = smtplib.SMTP_SSL(smtp_server, smtp_port)
server.login(username, password)
server.send_message(msg)
server.quit()
```

### 命令行发送 (mailx/mutt)
```bash
# 需要配置 ~/.mailrc
```
