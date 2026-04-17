from __future__ import annotations

import json
from mysql.connector import pooling

# Reuse the same MySQL settings used by reading module
from app.modules.reading.config import settings

_pool = None


def get_pool():
    global _pool
    if _pool:
        return _pool

    cfg = settings.mysql
    _pool = pooling.MySQLConnectionPool(
        pool_name="writing_pool",
        pool_size=5,
        host=cfg["host"],
        port=cfg["port"],
        user=cfg["user"],
        password=cfg["password"],
        database=cfg["db"],
    )
    return _pool


def insert_writing_log(entry: dict):
    pool = get_pool()
    conn = pool.get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO writing_logs
            (attempt_id, user_id, display_name, email_id, task_type, question, essay,
             overall_score, task_achievement, task_response, coherence_and_cohesion, lexical_resource,
             grammatical_range_and_accuracy, criteria, feedback_ai, created_at, meta, version)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE
              user_id=VALUES(user_id),
              display_name=VALUES(display_name),
              email_id=VALUES(email_id),
              task_type=VALUES(task_type),
              question=VALUES(question),
              essay=VALUES(essay),
              overall_score=VALUES(overall_score),
              task_achievement=VALUES(task_achievement),
              task_response=VALUES(task_response),
              coherence_and_cohesion=VALUES(coherence_and_cohesion),
              lexical_resource=VALUES(lexical_resource),
              grammatical_range_and_accuracy=VALUES(grammatical_range_and_accuracy),
              criteria=VALUES(criteria),
              feedback_ai=VALUES(feedback_ai),
              created_at=VALUES(created_at),
              meta=VALUES(meta),
              version=VALUES(version)
            """,
            (
                entry.get("attemptId"),
                entry.get("userId"),
                entry.get("displayName"),
                entry.get("emailId"),
                entry.get("taskType"),
                entry.get("question"),
                entry.get("essay"),
                entry.get("overallScore"),
                entry.get("taskAchievement"),
                entry.get("taskResponse"),
                entry.get("coherenceAndCohesion"),
                entry.get("lexicalResource"),
                entry.get("grammaticalRangeAndAccuracy"),
                json.dumps(entry.get("criteria", [])),
                json.dumps(entry.get("feedback_ai")) if entry.get("feedback_ai") is not None else None,
                (entry.get("createdAt") or "").replace("T", " ").replace("Z", ""),
                json.dumps(entry.get("meta", {})),
                entry.get("version", "writing_v1"),
            ),
        )
        conn.commit()
    finally:
        conn.close()