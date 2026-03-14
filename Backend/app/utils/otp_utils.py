import random
import time

from fastapi import HTTPException, status

from app.config import settings


_otp_cache: dict[str, tuple[str, float]] = {}
_otp_requests: dict[str, list[float]] = {}


def _prune_old_requests(email: str, now: float) -> None:
    window_start = now - settings.otp_window_seconds
    timestamps = _otp_requests.get(email, [])
    _otp_requests[email] = [ts for ts in timestamps if ts >= window_start]


def generate_otp(email: str) -> str:
    now = time.time()
    _prune_old_requests(email, now)

    if len(_otp_requests[email]) >= settings.otp_request_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OTP request limit reached. Try again later.",
        )

    _otp_requests[email].append(now)
    otp = f"{random.randint(0, 999999):06d}"
    _otp_cache[email] = (otp, now + settings.otp_expiry_seconds)
    return otp


def verify_otp(email: str, otp: str, *, consume: bool = True) -> bool:
    cached = _otp_cache.get(email)
    if not cached:
        return False

    expected_otp, expiry = cached
    if time.time() > expiry:
        _otp_cache.pop(email, None)
        return False

    is_valid = otp == expected_otp
    if is_valid and consume:
        _otp_cache.pop(email, None)
    return is_valid
