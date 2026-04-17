from __future__ import annotations

import hashlib
import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

# bcrypt hashing via passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings (fallbacks if env not set)
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # default 7 days


def _normalize_password(pw: str) -> str:
    """
    bcrypt only uses the first 72 BYTES. To avoid runtime errors and truncation weirdness,
    we pre-hash long passwords to a fixed-length string.
    IMPORTANT: Must be applied both in hash_password() and verify_password().
    """
    pw = (pw or "").strip()

    # bcrypt limit is 72 BYTES (not characters)
    if len(pw.encode("utf-8")) > 72:
        return hashlib.sha256(pw.encode("utf-8")).hexdigest()

    return pw


def hash_password(password: str) -> str:
    password = _normalize_password(password)
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    password = _normalize_password(password)
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> int:
    """
    Returns user_id (int) or raises ValueError if invalid.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        sub = payload.get("sub")
        if not sub:
            raise ValueError("Missing sub")
        return int(sub)
    except Exception as e:
        raise ValueError("Invalid token") from e