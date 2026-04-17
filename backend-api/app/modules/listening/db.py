from __future__ import annotations

import json
from mysql.connector import pooling

from app.modules.reading.config import settings

_pool = None


def get_pool():
    global _pool
    if _pool:
        return _pool

    cfg = settings.mysql
    _pool = pooling.MySQLConnectionPool(
        pool_name="listening_pool",
        pool_size=5,
        host=cfg["host"],
        port=cfg["port"],
        user=cfg["user"],
        password=cfg["password"],
        database=cfg["db"],
    )
    return _pool


def insert_listening_log(entry: dict):
    pool = get_pool()
    conn = pool.get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO listening_logs
            (attempt_id, user_id, username, email_id, section_type, score, total,
             results, conversation_logs, feedback_ai, created_at, meta, version)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE
              user_id=VALUES(user_id),
              username=VALUES(username),
              email_id=VALUES(email_id),
              section_type=VALUES(section_type),
              score=VALUES(score),
              total=VALUES(total),
              results=VALUES(results),
              conversation_logs=VALUES(conversation_logs),
              feedback_ai=VALUES(feedback_ai),
              created_at=VALUES(created_at),
              meta=VALUES(meta),
              version=VALUES(version)
            """,
            (
                entry.get("attemptId"),
                entry.get("userId"),
                entry.get("username"),
                entry.get("emailId"),
                entry.get("sectionType"),
                entry.get("score"),
                entry.get("total"),
                json.dumps(entry.get("results", [])),
                json.dumps(entry.get("conversation_logs")) if entry.get("conversation_logs") is not None else None,
                json.dumps(entry.get("feedback_ai")) if entry.get("feedback_ai") is not None else None,
                (entry.get("createdAt") or "").replace("T", " ").replace("Z", ""),
                json.dumps(entry.get("meta", {})),
                entry.get("version", "listening_v1"),
            ),
        )
        conn.commit()
    finally:
        conn.close()