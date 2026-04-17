from __future__ import annotations

import os
import threading
from pathlib import Path
from datetime import datetime, timezone

import mysql.connector
from mysql.connector import Error as MySQLError

_lock = threading.Lock()
_db_lock = threading.Lock()
_db_conn = None

AGENTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = AGENTS_DIR.parent

AGENTS_LOG_DIR = AGENTS_DIR / "logs" / "conversations"
BACKEND_LOG_DIR = PROJECT_ROOT / "backend" / "logs" / "conversations"


def _env(name: str, default: str | None = None) -> str | None:
    v = os.getenv(name)
    return v if v not in (None, "") else default


def _get_db_conn():
    global _db_conn

    host = _env("DB_HOST")
    port = int(_env("DB_PORT", "3306"))
    user = _env("DB_USER")
    password = _env("DB_PASSWORD")
    database = _env("DB_NAME")

    if not all([host, user, password, database]):
        print("[log.py] ❌ DB env missing. Need DB_HOST, DB_USER, DB_PASSWORD, DB_NAME")
        return None

    with _db_lock:
        try:
            if _db_conn is not None and _db_conn.is_connected():
                return _db_conn

            print(f"[log.py] ✅ Connecting MySQL: host={host} port={port} user={user} db={database}")
            _db_conn = mysql.connector.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                autocommit=True,
            )
            return _db_conn
        except MySQLError as e:
            print(f"[log.py] ❌ MySQL connect failed: {e}")
            _db_conn = None
            return None


def log_turn(
    session_id: str,
    role: str,
    text: str,
    user_name: str | None = None,
    agent_name: str | None = None,
):
    # ---------- file logging ----------
    AGENTS_LOG_DIR.mkdir(parents=True, exist_ok=True)
    BACKEND_LOG_DIR.mkdir(parents=True, exist_ok=True)

    safe_session = "".join(c for c in (session_id or "") if c.isalnum() or c in ("-", "_")) or "unknown_session"
    agents_file = AGENTS_LOG_DIR / f"{safe_session}.txt"
    backend_file = BACKEND_LOG_DIR / f"{safe_session}.txt"

    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    line = f"[{ts}] {role}: {text}\n"

    with _lock:
        agents_file.open("a", encoding="utf-8").write(line)
        try:
            backend_file.open("a", encoding="utf-8").write(line)
        except Exception:
            pass

    # ---------- DB logging ----------
    u = user_name or "User"
    a = agent_name or "Agent"
    role_norm = (role or "").lower()
    is_user = role_norm in ("user", "human")
    sender = u if is_user else a
    receiver = a if is_user else u

    conn = _get_db_conn()
    if conn is None:
        return

    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO conversation_logs
              (session_id, user_name, agent_name, sender_name, receiver_name, role, message)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (safe_session, u, a, sender, receiver, role, text),
        )
        cur.close()
        print(f"[log.py] ✅ Inserted log: session={safe_session} sender={sender} role={role}")
    except MySQLError as e:
        print(f"[log.py] ❌ INSERT failed: {e}")
        try:
            conn.ping(reconnect=True, attempts=2, delay=1)
        except Exception:
            pass
