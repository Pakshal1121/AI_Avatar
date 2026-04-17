from __future__ import annotations

import json
from mysql.connector import pooling
from .config import settings

_pool = None


def get_pool():
    global _pool
    if _pool:
        return _pool

    cfg = settings.mysql
    _pool = pooling.MySQLConnectionPool(
        pool_name="reading_pool",
        pool_size=5,
        host=cfg["host"],
        port=cfg["port"],
        user=cfg["user"],
        password=cfg["password"],
        database=cfg["db"],
    )
    return _pool


def insert_reading_log(entry: dict):
    pool = get_pool()
    conn = pool.get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO reading_logs
            (attempt_id, user_id, created_at, overall_score, passage_1_score, passage_2_score, passage_3_score,
             total_questions, correct_questions, wrong_answer, meta, version, feedback_ai, feedback_ai_created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE
              user_id=VALUES(user_id),
              created_at=VALUES(created_at),
              overall_score=VALUES(overall_score),
              passage_1_score=VALUES(passage_1_score),
              passage_2_score=VALUES(passage_2_score),
              passage_3_score=VALUES(passage_3_score),
              total_questions=VALUES(total_questions),
              correct_questions=VALUES(correct_questions),
              wrong_answer=VALUES(wrong_answer),
              meta=VALUES(meta),
              version=VALUES(version),
              feedback_ai=VALUES(feedback_ai),
              feedback_ai_created_at=VALUES(feedback_ai_created_at)
            """,
            (
                entry.get("attemptId"),
                entry.get("userId"),
                (entry.get("createdAt") or "").replace("T", " ").replace("Z", ""),
                entry.get("overall_score"),
                entry.get("passage_1_score"),
                entry.get("passage_2_score"),
                entry.get("passage_3_score"),
                entry.get("total_questions"),
                entry.get("correct_questions"),
                json.dumps(entry.get("wrong_answer", [])),
                json.dumps(entry.get("meta", {})),
                entry.get("version", "reading_v1"),
                json.dumps(entry.get("feedback_ai")) if entry.get("feedback_ai") is not None else None,
                (entry.get("feedback_ai_createdAt") or "").replace("T", " ").replace("Z", "")
                if entry.get("feedback_ai_createdAt")
                else None,
            ),
        )
        conn.commit()
    finally:
        conn.close()