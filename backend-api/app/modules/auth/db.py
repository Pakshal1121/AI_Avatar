import os
from contextlib import contextmanager

import mysql.connector


def _db_config():
    # Keep names aligned with existing services where possible.
    # Prefer MYSQL_* (used by reading service); fall back to DB_*.
    return {
        "host": os.getenv("MYSQL_HOST") or os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("MYSQL_PORT") or os.getenv("DB_PORT", "3306")),
        "user": os.getenv("MYSQL_USER") or os.getenv("DB_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD") or os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("MYSQL_DB") or os.getenv("DB_NAME", "ielts"),
    }


@contextmanager
def get_conn():
    conn = mysql.connector.connect(**_db_config())
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass
