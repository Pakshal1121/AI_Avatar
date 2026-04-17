from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from .db import insert_reading_log
from .config import settings
from .models import (
    FeedbackRequest,
    FeedbackResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    ScoreLog,
    SubmitAnswersRequest,
)
from .openai_client import (
    OpenAIUnavailable,
    generate_feedback,
    generate_reading_questions,
    generate_reading_passages,
)
from .scoring import compute_scores
from .storage import (
    append_log,
    update_log,
    get_attempt_log,
    get_user_logs,
    load_attempt,
    new_attempt_id,
    now_iso,
    save_attempt,
    update_attempt,
)

router = APIRouter(tags=["reading"])


@router.get("/health")
def health():
    return {"ok": True}


# ✅ generate passages + questions dynamically (no hardcoded frontend passages)
@router.post("/reading/generate-test")
def reading_generate_test(payload: dict[str, Any]):
    user_id = str(payload.get("userId") or "anonymous")
    attempt_id = new_attempt_id()

    try:
        # 1) Generate passages
        passages_obj = generate_reading_passages(seed=f"{user_id}:{attempt_id}")
        passages = passages_obj.get("passages", [])
        if not isinstance(passages, list) or len(passages) != 3:
            raise HTTPException(status_code=500, detail="OpenAI returned invalid passages")

        # 2) Build input safely (NO KeyError)
        q_input: list[dict[str, str]] = []
        for i, p in enumerate(passages, start=1):
            pid = str(p.get("passageId") or i)
            text = p.get("text")
            if not text:
                raise HTTPException(
                    status_code=500,
                    detail=f"OpenAI passage missing text for passageId={pid}",
                )
            q_input.append({"passageId": pid, "text": text})

        # 3) Generate questions
        q_obj = generate_reading_questions(q_input)
        out_passages = q_obj.get("passages", [])

        if not isinstance(out_passages, list) or len(out_passages) != 3:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "OpenAI returned invalid questions format",
                    "hint": "Expected passages to be an array of length 3 with passageId 1/2/3",
                    "received_type": str(type(out_passages)),
                    "received_len": (len(out_passages) if isinstance(out_passages, list) else None),
                    "keys": list(q_obj.keys()) if isinstance(q_obj, dict) else None,
                },
            )

    except OpenAIUnavailable as e:
        raise HTTPException(status_code=500, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI output missing key: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unhandled error: {repr(e)}")

    attempt_payload = {
        "attemptId": attempt_id,
        "userId": user_id,
        "createdAt": now_iso(),
        "passagesText": passages,
        "passages": out_passages,
        "notes": q_obj.get("notes"),
        # NOTE: this is legacy (you can keep it)
        "questionsPerPassage": settings.questions_per_passage,
        # ✅ helpful debug field: total questions returned
        "totalQuestions": sum(len(p.get("questions", [])) for p in out_passages if isinstance(p, dict)),
    }
    save_attempt(attempt_id, attempt_payload)

    return {
        "attemptId": attempt_id,
        "userId": user_id,
        "passagesText": passages,
        "passages": out_passages,
    }


@router.post("/reading/generate-questions", response_model=GenerateQuestionsResponse)
def reading_generate_questions(payload: GenerateQuestionsRequest):
    attempt_id = new_attempt_id()
    passages = [{"passageId": p.passageId, "text": p.text} for p in payload.passages]

    try:
        generated = generate_reading_questions(passages)
    except OpenAIUnavailable as e:
        raise HTTPException(status_code=500, detail=str(e))

    out_passages = generated.get("passages")
    if not isinstance(out_passages, list) or len(out_passages) == 0:
        raise HTTPException(status_code=500, detail="OpenAI returned unexpected format")

    attempt_payload = {
        "attemptId": attempt_id,
        "userId": payload.userId,
        "createdAt": now_iso(),
        "passages": out_passages,
        "notes": generated.get("notes"),
        "questionsPerPassage": settings.questions_per_passage,
        "totalQuestions": sum(len(p.get("questions", [])) for p in out_passages if isinstance(p, dict)),
    }
    save_attempt(attempt_id, attempt_payload)

    return {"attemptId": attempt_id, "userId": payload.userId, "passages": out_passages}


@router.post("/reading/submit", response_model=ScoreLog)
def reading_submit(payload: SubmitAnswersRequest):
    attempt = load_attempt(payload.attemptId)
    if not attempt:
        raise HTTPException(status_code=404, detail="attemptId not found")
    if str(attempt.get("userId")) != str(payload.userId):
        raise HTTPException(status_code=403, detail="attemptId does not belong to user")

    scores = compute_scores(attempt, payload.answers)

    log_entry: dict[str, Any] = {
        "attemptId": payload.attemptId,
        "userId": payload.userId,
        "createdAt": now_iso(),
        **scores,
        "meta": payload.meta or {},
        "version": "reading_v1",
    }

    append_log(log_entry)

    # ✅ Store in MySQL (non-fatal if DB not configured)
    try:
        insert_reading_log(log_entry)
    except Exception:
        pass

    # ✅ write scores into attempt file
    update_attempt(payload.attemptId, {**scores, "scoredAt": now_iso()})

    # ✅ Auto-generate feedback_ai and store it in reading_logs.json + attempt file
    try:
        fb = generate_feedback(
            {
                "attemptId": payload.attemptId,
                "overall_score": log_entry.get("overall_score"),
                "passage_scores": {
                    "1": log_entry.get("passage_1_score"),
                    "2": log_entry.get("passage_2_score"),
                    "3": log_entry.get("passage_3_score"),
                },
                "wrong_answer": log_entry.get("wrong_answer", []),
            }
        )
        update_log(payload.attemptId, {"feedback_ai": fb, "feedback_ai_createdAt": now_iso()})
        update_attempt(payload.attemptId, {"feedback_ai": fb, "feedback_ai_createdAt": now_iso()})
    except Exception:
        pass

    return log_entry


@router.get("/reading/results/{user_id}/latest")
def reading_latest(user_id: str):
    logs = get_user_logs(user_id)
    if not logs:
        return {"userId": user_id, "result": None}
    latest = sorted(logs, key=lambda x: x.get("createdAt", ""), reverse=True)[0]
    return {
        "userId": user_id,
        "attemptId": latest.get("attemptId"),
        "overall_score": latest.get("overall_score"),
        "passage_1_score": latest.get("passage_1_score"),
        "passage_2_score": latest.get("passage_2_score"),
        "passage_3_score": latest.get("passage_3_score"),
    }


@router.post("/reading/feedback", response_model=FeedbackResponse)
def reading_feedback(payload: FeedbackRequest):
    log = get_attempt_log(payload.attemptId)
    if not log:
        raise HTTPException(status_code=404, detail="attemptId not found in logs")
    if str(log.get("userId")) != str(payload.userId):
        raise HTTPException(status_code=403, detail="attemptId does not belong to user")

    # ✅ If already generated, return cached feedback (saves OpenAI calls)
    cached = log.get("feedback_ai")
    if cached:
        return {"attemptId": payload.attemptId, "userId": payload.userId, "feedback": cached}

    feedback_input = {
        "attemptId": payload.attemptId,
        "overall_score": log.get("overall_score"),
        "passage_scores": {
            "1": log.get("passage_1_score"),
            "2": log.get("passage_2_score"),
            "3": log.get("passage_3_score"),
        },
        "wrong_answer": log.get("wrong_answer", []),
    }

    try:
        fb = generate_feedback(feedback_input)

        # ✅ Persist feedback into reading_logs.json and attempt file
        try:
            update_log(payload.attemptId, {"feedback_ai": fb, "feedback_ai_createdAt": now_iso()})
        except Exception:
            pass

        try:
            update_attempt(payload.attemptId, {"feedback_ai": fb, "feedback_ai_createdAt": now_iso()})
        except Exception:
            pass

    except OpenAIUnavailable as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"attemptId": payload.attemptId, "userId": payload.userId, "feedback": fb}