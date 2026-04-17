from fastapi import APIRouter, Depends, HTTPException

from app.modules.auth.db import get_conn
from app.modules.auth.deps import get_current_user_id
from app.modules.auth.schemas import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UserOut,
)
from app.modules.auth.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest):
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id FROM users WHERE email = %s", (body.email,))
        existing = cur.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        pw_hash = hash_password(body.password)
        cur.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s)",
            (body.email, pw_hash, body.full_name),
        )
        conn.commit()

        user_id = int(cur.lastrowid)
        token = create_access_token(user_id)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user_id, "email": body.email, "full_name": body.full_name},
        }


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE email = %s", (body.email,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(body.password, user.get("password_hash") or ""):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(int(user["id"]))
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": int(user["id"]),
                "email": user["email"],
                "full_name": user.get("full_name"),
            },
        }


@router.get("/me", response_model=UserOut)
def me(user_id: int = Depends(get_current_user_id)):
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id, email, full_name FROM users WHERE id = %s",
            (user_id,),
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
