#!/usr/bin/env python3
"""
Gmail AI Reply Bot - Simple version with timeout handling
"""

import os
import imaplib
import email
import smtplib
import ssl
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

# Environment variables
EMAIL_USER = os.environ.get('EMAIL_USER', 'hourglass.yang@gmail.com')
EMAIL_PASS = os.environ.get('EMAIL_PASS', 'otrittdcxhfxcxsi')
IMAP_SERVER = os.environ.get('IMAP_SERVER', 'imap.gmail.com')
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
REPORT_PATH = '/root/.openclaw/workspace/research_report.pdf'

def connect_imap():
    """Connect to Gmail IMAP server."""
    try:
        print(f"Connecting to IMAP: {IMAP_SERVER}...")
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, timeout=30)
        print("IMAP SSL connected, logging in...")
        mail.login(EMAIL_USER, EMAIL_PASS)
        print("IMAP login successful, selecting INBOX...")
        mail.select('INBOX')
        print("INBOX selected")
        return mail
    except Exception as e:
        print(f"IMAP Connection Error: {e}")
        return None

def get_unread_emails(mail):
    """Fetch all unread emails from INBOX."""
    try:
        print("Searching for unread emails...")
        status, messages = mail.search(None, 'UNSEEN')
        if status != 'OK':
            print(f"Search failed: {status}")
            return []
        
        email_ids = messages[0].split()
        print(f"Found {len(email_ids)} unread email ID(s)")
        
        if not email_ids:
            return []
        
        emails = []
        
        for email_id in email_ids:
            print(f"Fetching email ID: {email_id.decode()}...")
            status, msg_data = mail.fetch(email_id, '(RFC822)')
            if status != 'OK':
                print(f"Fetch failed for {email_id}")
                continue
                
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    # Extract email details
                    subject = decode_header(msg['Subject'])
                    from_addr = decode_header(msg['From'])
                    
                    # Extract body
                    body = extract_body(msg)
                    
                    emails.append({
                        'id': email_id,
                        'subject': subject,
                        'from': from_addr,
                        'body': body
                    })
                    print(f"  -> From: {from_addr}, Subject: {subject[:50]}")
        
        return emails
    except Exception as e:
        print(f"Error fetching emails: {e}")
        return []

def decode_header(header_value):
    """Decode email header value."""
    if not header_value:
        return ""
    decoded_parts = email.header.decode_header(header_value)
    result = ""
    for part, charset in decoded_parts:
        if isinstance(part, bytes):
            result += part.decode(charset or 'utf-8', errors='ignore')
        else:
            result += str(part)
    return result

def extract_body(msg):
    """Extract plain text body from email message."""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            
            if content_type == "text/plain" and "attachment" not in content_disposition:
                try:
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    break
                except:
                    pass
            elif content_type == "text/html" and "attachment" not in content_disposition and not body:
                try:
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                except:
                    pass
    else:
        try:
            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        except:
            pass
    return body

def generate_reply(original_email):
    """Generate AI reply based on email content."""
    body = original_email['body']
    subject = original_email['subject']
    
    # Check if user is requesting a report
    is_report_request = any(keyword in body.lower() or keyword in subject.lower() 
                           for keyword in ['报告', 'report', '发送报告', 'send report'])
    
    reply_body = f"""您好，

感谢您的来信。

邮件主题：{subject}

我已收到您的消息，会尽快处理。
"""
    
    if is_report_request:
        reply_body += """
根据您的要求，我将附上研究报告。
"""
    
    reply_body += """
如有其他问题，请随时联系。

此致
AI邮件助手
"""
    
    return reply_body, is_report_request

def send_reply_smtp(original_email, reply_body, attach_report=False):
    """Send reply via SMTP."""
    try:
        print(f"  Sending reply to: {original_email['from']}")
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = original_email['from']
        msg['Subject'] = f"Re: {original_email['subject']}"
        
        # Add body
        msg.attach(MIMEText(reply_body, 'plain', 'utf-8'))
        
        # Attach report if requested
        if attach_report and os.path.exists(REPORT_PATH):
            print(f"  Attaching report: {REPORT_PATH}")
            with open(REPORT_PATH, 'rb') as f:
                attachment = MIMEBase('application', 'octet-stream')
                attachment.set_payload(f.read())
            
            encoders.encode_base64(attachment)
            attachment.add_header(
                'Content-Disposition',
                'attachment; filename=research_report.pdf'
            )
            msg.attach(attachment)
        elif attach_report:
            print(f"  Warning: Report file not found at {REPORT_PATH}")
        
        # Send via SMTP
        print("  Connecting to SMTP...")
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_SERVER, 465, context=context, timeout=30) as server:
            print("  SMTP connected, logging in...")
            server.login(EMAIL_USER, EMAIL_PASS)
            print("  SMTP login successful, sending message...")
            server.send_message(msg)
        
        print("  Reply sent successfully")
        return True
    except Exception as e:
        print(f"  SMTP Send Error: {e}")
        return False

def mark_as_read(mail, email_id):
    """Mark email as read."""
    try:
        mail.store(email_id, '+FLAGS', '\\Seen')
        return True
    except Exception as e:
        print(f"  Error marking email as read: {e}")
        return False

def main():
    """Main function."""
    print(f"[{datetime.now()}] Gmail AI Reply Bot Starting...")
    print(f"Email: {EMAIL_USER}")
    print("-" * 50)
    
    # Set socket timeout globally
    socket.setdefaulttimeout(30)
    
    # Connect to IMAP
    mail = connect_imap()
    if not mail:
        print("Failed to connect to IMAP server")
        return 1
    
    # Get unread emails
    emails = get_unread_emails(mail)
    
    if not emails:
        print("\nNo unread emails to process")
        mail.close()
        mail.logout()
        return 0
    
    print(f"\nProcessing {len(emails)} email(s)...")
    print("-" * 50)
    
    processed_count = 0
    
    for email_data in emails:
        print(f"\nEmail from: {email_data['from']}")
        print(f"Subject: {email_data['subject']}")
        
        # Generate reply
        reply_body, is_report_request = generate_reply(email_data)
        
        # Send reply
        if send_reply_smtp(email_data, reply_body, attach_report=is_report_request):
            # Mark as read
            if mark_as_read(mail, email_data['id']):
                processed_count += 1
                print("  -> Marked as read")
            else:
                print("  -> Failed to mark as read")
        else:
            print("  -> Failed to send reply")
    
    # Close connection
    mail.close()
    mail.logout()
    
    print("-" * 50)
    print(f"[{datetime.now()}] Complete. {processed_count}/{len(emails)} email(s) processed.")
    return 0

if __name__ == "__main__":
    exit(main())
