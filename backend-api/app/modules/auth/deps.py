from fastapi import Depends, Header, HTTPException

from app.modules.auth.security import decode_token


def get_current_user_id(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1].strip()
    try:
        return decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
