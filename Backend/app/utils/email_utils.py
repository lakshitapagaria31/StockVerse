import smtplib
from email.message import EmailMessage

from app.config import settings


def is_email_delivery_configured() -> bool:
    return bool(
        settings.smtp_host
        and settings.smtp_username
        and settings.smtp_password
        and settings.smtp_sender
    )


def send_reset_otp_email(recipient: str, otp: str, expiry_seconds: int) -> bool:
    """Send OTP email using SMTP. Returns False if SMTP is not configured."""
    if not is_email_delivery_configured():
        return False

    message = EmailMessage()
    message["Subject"] = "StockVerse password reset OTP"
    message["From"] = settings.smtp_sender
    message["To"] = recipient
    message.set_content(
        "Use this OTP to reset your StockVerse password.\n\n"
        f"OTP: {otp}\n"
        f"Valid for: {expiry_seconds} seconds\n\n"
        "If you did not request this, you can ignore this email."
    )

    try:
        if settings.smtp_use_tls:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                server.starttls()
                server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(message)
            return True

        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
        return True
    except Exception:
        return False
