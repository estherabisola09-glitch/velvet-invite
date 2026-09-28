import asyncio
import logging
import secrets
from datetime import datetime, timedelta
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, field_validator

from app.config import get_settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_TOKEN_CLOCK_SKEW_SECONDS = 10


def google_oauth_is_configured() -> bool:
    settings = get_settings()
    return bool(
        settings.GOOGLE_CLIENT_ID
        and settings.GOOGLE_CLIENT_SECRET
        and settings.GOOGLE_REDIRECT_URI
    )


def google_login_error() -> RedirectResponse:
    settings = get_settings()
    return RedirectResponse(
        f"{settings.FRONTEND_ORIGIN}/login?oauth_error=google",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.get("/google")
async def google_login():
    settings = get_settings()
    if not google_oauth_is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured",
        )

    nonce = secrets.token_urlsafe(32)
    state = jwt.encode(
        {
            "purpose": "google_oauth",
            "nonce": nonce,
            "exp": datetime.utcnow() + timedelta(minutes=10),
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    query = urlencode(
        {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email",
            "state": state,
            "nonce": nonce,
            "prompt": "select_account",
        }
    )
    return RedirectResponse(
        f"{GOOGLE_AUTHORIZATION_URL}?{query}",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.get("/google/callback")
async def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    settings = get_settings()
    if not google_oauth_is_configured():
        return google_login_error()
    if error or not code or not state:
        return google_login_error()

    try:
        state_payload = jwt.decode(
            state,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if state_payload.get("purpose") != "google_oauth":
            raise JWTError("Invalid OAuth state purpose")
    except JWTError:
        logger.warning("Rejected Google OAuth callback with invalid state")
        return google_login_error()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            response.raise_for_status()
            tokens = response.json()
        identity_token = tokens.get("id_token")
        if not identity_token:
            raise ValueError("Google did not return an identity token")
        google_user = await asyncio.to_thread(
            id_token.verify_oauth2_token,
            identity_token,
            GoogleRequest(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=GOOGLE_TOKEN_CLOCK_SKEW_SECONDS,
        )
    except (httpx.HTTPError, GoogleAuthError, ValueError) as exc:
        logger.warning("Google sign-in verification failed: %s", exc)
        return google_login_error()

    google_id = google_user.get("sub")
    email = google_user.get("email")
    if (
        not google_id
        or not email
        or google_user.get("email_verified") is not True
        or google_user.get("nonce") != state_payload.get("nonce")
    ):
        logger.warning("Google sign-in did not provide a verified email")
        return google_login_error()

    user = await User.find_one(User.google_id == google_id)
    if user is None:
        user = await User.find_one(User.email == email)
        if user is not None and user.google_id not in (None, google_id):
            logger.warning("Google email is already linked to another Google account")
            return google_login_error()
        if user is None:
            user = User(
                name=google_user.get("name") or email.split("@", 1)[0],
                email=email,
                google_id=google_id,
            )
        else:
            user.google_id = google_id
            user.updated_at = datetime.utcnow()
        await user.save()

    access_token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(
        f"{settings.FRONTEND_ORIGIN}/login#"
        f"{urlencode({'access_token': access_token})}",
        status_code=status.HTTP_303_SEE_OTHER,
    )


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if (
            len(password) < 8
            or not any("a" <= character <= "z" for character in password)
            or not any("A" <= character <= "Z" for character in password)
            or not any(
                not character.isalnum() and not character.isspace()
                for character in password
            )
        ):
            raise ValueError(
                "Password must be at least 8 characters and include lowercase, "
                "uppercase, and a symbol"
            )
        return password


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup(data: SignupRequest):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_user = await User.find_one(User.email == data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    await user.insert()

    return SignupResponse(message="Account created. Please log in.")


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = await User.find_one(User.email == data.email)
    if (
        not user
        or not user.password_hash
        or not verify_password(data.password, user.password_hash)
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = await User.get(payload.get("sub"))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "plan": current_user.plan,
    }