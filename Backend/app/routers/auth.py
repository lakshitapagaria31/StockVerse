from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database.connection import get_db
from app.database.models import User
from app.utils.auth_utils import create_access_token, hash_password, verify_password
from app.utils.email_utils import send_reset_otp_email
from app.utils.otp_utils import generate_otp, verify_otp


router = APIRouter()


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="staff", max_length=50)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ConfirmResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)


@router.post("/signup")
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)) -> dict:
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
    }


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> dict:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
    }


@router.post("/token")
async def oauth2_token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Swagger OAuth2 password flow sends username/password form fields.
    user = await db.scalar(select(User).where(User.email == form_data.username))
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return {
        "access_token": create_access_token(user.email),
        "token_type": "bearer",
    }


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)) -> dict:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user:
        return {
            "message": "If this email exists, an OTP has been sent",
            "expires_in_seconds": settings.otp_expiry_seconds,
        }

    otp = generate_otp(payload.email)
    is_sent = send_reset_otp_email(payload.email, otp, settings.otp_expiry_seconds)

    response = {
        "message": "OTP sent to your email" if is_sent else "OTP generated",
        "expires_in_seconds": settings.otp_expiry_seconds,
        "email_sent": is_sent,
    }

    if not is_sent:
        response["otp"] = otp
        response["note"] = "SMTP not configured. Use OTP from response in development."

    return response


@router.post("/verify-otp")
async def verify_reset_otp(payload: VerifyOtpRequest) -> dict:
    is_valid = verify_otp(payload.email, payload.otp, consume=False)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    return {"message": "OTP verified"}


@router.post("/confirm-reset-password")
async def confirm_reset_password(
    payload: ConfirmResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    is_valid = verify_otp(payload.email, payload.otp)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    user.password_hash = hash_password(payload.new_password)
    await db.commit()

    return {"message": "Password updated successfully"}
