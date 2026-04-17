"""
IELTS Listening — backend router

Endpoints
---------
GET  /listening/passage?sectionType=section1|section2|section3|section4
     Generates an authentic IELTS listening passage + questions via OpenAI.

POST /listening/score
     Scores user answers against the stored correct answers (fuzzy match),
     returns per-question results + logs to JSONL.
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

router = APIRouter(tags=["listening"])

# ─────────────── Logging ───────────────

# LOG_DIR = Path(__file__).resolve().parents[3] / "KMS" / "logs" / "Listening_logs"

# Write conversation logs into backend-api/KMS/Listening_logs
LOG_DIR = Path(__file__).resolve().parents[1] / "backend-api" / "KMS" / "Listening_logs"


def _safe_filename(s: str) -> str:
    s = (s or "anonymous").strip().lower()
    s = re.sub(r"[^a-z0-9._-]+", "_", s)
    return s[:80] or "anonymous"


def _append_log_jsonl(user_id: str, payload: Dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    day = datetime.utcnow().strftime("%Y-%m-%d")
    fname = f"listening_logs_{_safe_filename(user_id)}_{day}.jsonl"
    path = LOG_DIR / fname
    payload = dict(payload)
    payload["loggedAtUtc"] = datetime.utcnow().isoformat() + "Z"
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


# ─────────────── Section configs ───────────────

SECTION_CONFIGS = {
    "section1": {
        "label": "Section 1",
        "description": "A conversation between two people in an everyday social context (e.g. booking, enquiry, phone call).",
        "style": "dialogue between two speakers (e.g. a receptionist and a customer)",
        "question_count": 8,
        "difficulty": "easy",
    },
    "section2": {
        "label": "Section 2",
        "description": "A monologue in a social context (e.g. a tour guide speech, announcement about local facilities).",
        "style": "monologue by a single speaker giving practical information",
        "question_count": 8,
        "difficulty": "medium",
    },
    "section3": {
        "label": "Section 3",
        "description": "A conversation in an educational/training context (e.g. university tutorial, study group).",
        "style": "conversation between two or three students and/or a tutor",
        "question_count": 9,
        "difficulty": "medium",
    },
    "section4": {
        "label": "Section 4",
        "description": "An academic monologue (e.g. a university lecture on a specific topic).",
        "style": "university lecture or academic talk by a single lecturer",
        "question_count": 10,
        "difficulty": "hard",
    },
}


# ─────────────── Passage generation ───────────────

@router.get("/listening/passage")
def listening_passage(sectionType: str = Query(..., alias="sectionType")):
    """Generate an authentic IELTS Listening passage + questions via OpenAI."""

    from openai import OpenAI

    section_key = (sectionType or "").strip().lower()
    if section_key not in SECTION_CONFIGS:
        raise HTTPException(status_code=400, detail="sectionType must be section1, section2, section3, or section4")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing")

    cfg = SECTION_CONFIGS[section_key]
    client = OpenAI(api_key=api_key)

    system = (
        "You are an expert IELTS content author.\n"
        "Return STRICT JSON only. No markdown. No code fences. No explanations outside the JSON.\n"
        "All fields are required and must contain real, non-placeholder content.\n"
        "The transcript must be natural spoken English (contractions, fillers like 'um', 'right', 'so'), "
        "at least 350 words, and suitable for an audio recording.\n"
        "Questions must be answerable ONLY from information stated in the transcript.\n"
        "For multiple_choice questions, include EXACTLY 4 options labelled A–D.\n"
        "For fill_blank questions, the blank should be a short phrase (1–4 words) spoken in the transcript.\n"
        "For short_answer questions, the answer must be a brief phrase (1–6 words) from the transcript.\n"
        "answers must be lowercase and match a word or phrase spoken verbatim or near-verbatim in the transcript.\n"
        "Vary question types across the set.\n"
    )

    user_prompt = {
        "task": "Generate an IELTS Listening passage and questions",
        "sectionType": section_key,
        "sectionDescription": cfg["description"],
        "transcriptStyle": cfg["style"],
        "difficulty": cfg["difficulty"],
        "numberOfQuestions": cfg["question_count"],
        "questionTypes": ["multiple_choice", "fill_blank", "short_answer"],
        "outputSchema": {
            "sectionType": section_key,
            "title": "Short descriptive title for the passage (e.g. 'Flat Rental Enquiry')",
            "context": "One sentence describing the scenario for the listener",
            "transcript": "The full spoken text (350+ words, natural speech, with speaker labels if dialogue)",
            "questions": [
                {
                    "id": 1,
                    "type": "multiple_choice | fill_blank | short_answer",
                    "question": "The question text",
                    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
                    "answer": "correct answer (for MC: the full option text, e.g. 'A. three months')",
                    "explanation": "Brief explanation quoting or referencing the relevant transcript line",
                }
            ],
        },
    }

    last_text = ""
    for attempt in range(3):
        try:
            try:
                resp = client.responses.create(
                    model=os.getenv("LISTENING_PASSAGE_MODEL", "gpt-4.1-nano"),
                    input=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": json.dumps(user_prompt)},
                    ],
                    temperature=1.0,
                )
                last_text = resp.output_text
            except Exception:
                resp = client.chat.completions.create(
                    model=os.getenv("LISTENING_PASSAGE_MODEL", "gpt-4.1-nano"),
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": json.dumps(user_prompt)},
                    ],
                    temperature=1.0,
                )
                last_text = resp.choices[0].message.content

            # Strip any accidental markdown fences
            cleaned = re.sub(r"```(?:json)?", "", last_text or "").strip()
            out = json.loads(cleaned)

            # Validate required fields
            if not out.get("transcript") or not out.get("questions"):
                continue

            transcript = str(out["transcript"]).strip()
            questions = out["questions"]

            if len(transcript) < 100 or not isinstance(questions, list) or len(questions) < 3:
                continue

            # Normalise questions
            normalised_questions = []
            for idx, q in enumerate(questions):
                q_type = str(q.get("type", "short_answer")).strip()
                if q_type not in ("multiple_choice", "fill_blank", "short_answer"):
                    q_type = "short_answer"

                item: Dict[str, Any] = {
                    "id": int(q.get("id", idx + 1)),
                    "type": q_type,
                    "question": str(q.get("question", "")).strip(),
                    "answer": str(q.get("answer", "")).strip(),
                    "explanation": str(q.get("explanation", "")).strip(),
                }

                if q_type == "multiple_choice":
                    opts = q.get("options") or []
                    item["options"] = [str(o) for o in opts[:4]] if opts else []

                normalised_questions.append(item)

            return {
                "sectionType": section_key,
                "title": str(out.get("title", cfg["label"])).strip(),
                "context": str(out.get("context", cfg["description"])).strip(),
                "transcript": transcript,
                "questions": normalised_questions,
            }

        except Exception:
            continue

    return JSONResponse(
        status_code=502,
        content={"error": "Model failed to generate a valid passage after 3 attempts", "raw": last_text[:2000]},
    )


# ─────────────── Scoring ───────────────

def _normalise(s: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9\s]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _answers_match(user: str, correct: str) -> bool:
    """Fuzzy match: exact after normalisation, or correct is contained in user answer."""
    u = _normalise(user)
    c = _normalise(correct)
    if not u:
        return False
    return u == c or c in u or u in c


# @router.post("/listening/score")
# def listening_score(payload: Dict[str, Any]):
#     """
#     Score user answers for a listening passage.

#     Body:
#       - userId: string
#       - displayName: string
#       - sectionType: string
#       - questions: list of question objects (must include id, answer)
#       - answers: dict mapping question id (as string key) to user answer string

#     Returns:
#       - score: int
#       - total: int
#       - results: [{id, correct, userAnswer, correctAnswer, explanation}]
#     """
#     user_id = str((payload.get("userId") or "anonymous")).strip() or "anonymous"
#     display_name = str(payload.get("displayName") or "").strip()
#     section_type = str(payload.get("sectionType") or "").strip()
#     questions: List[Dict[str, Any]] = payload.get("questions") or []
#     user_answers: Dict[str, str] = payload.get("answers") or {}

#     if not questions:
#         raise HTTPException(status_code=400, detail="questions list is required")

#     results = []
#     score = 0

#     for q in questions:
#         q_id = q.get("id")
#         correct_answer = str(q.get("answer", "")).strip()
#         explanation = str(q.get("explanation", "")).strip()

#         # answers dict keys may be int or str
#         user_answer = str(user_answers.get(str(q_id)) or user_answers.get(q_id) or "").strip()

#         correct = _answers_match(user_answer, correct_answer)
#         if correct:
#             score += 1

#         results.append({
#             "id": q_id,
#             "correct": correct,
#             "userAnswer": user_answer,
#             "correctAnswer": correct_answer,
#             "explanation": explanation,
#         })

#     total = len(questions)

#     # Log
#     try:
#         _append_log_jsonl(
#             user_id=user_id,
#             payload={
#                 "userId": user_id,
#                 "displayName": display_name,
#                 "sectionType": section_type,
#                 "score": score,
#                 "total": total,
#                 "results": results,
#             },
#         )
#     except Exception as e:
#         pass  # don't fail the response if logging errors

#     return {
#         "score": score,
#         "total": total,
#         "results": results,
#     }

@router.post("/listening/score")
def listening_score(payload: Dict[str, Any]):
    from openai import OpenAI
    from .db import insert_listening_log
    import uuid

    attempt_id = uuid.uuid4().hex

    user_id = str((payload.get("userId") or "anonymous")).strip() or "anonymous"
    username = str(payload.get("username") or payload.get("displayName") or "").strip()
    email_id = str(payload.get("emailId") or payload.get("email") or "").strip()
    section_type = str(payload.get("sectionType") or "").strip()
    questions: List[Dict[str, Any]] = payload.get("questions") or []
    user_answers: Dict[str, str] = payload.get("answers") or {}

    # ✅ optional: conversation logs sent from frontend after live avatar session
    conversation_logs = payload.get("conversation_logs") or payload.get("conversationLogs")

    if not questions:
        raise HTTPException(status_code=400, detail="questions list is required")

    results = []
    score = 0

    for q in questions:
        q_id = q.get("id")
        correct_answer = str(q.get("answer", "")).strip()
        explanation = str(q.get("explanation", "")).strip()

        user_answer = str(user_answers.get(str(q_id)) or user_answers.get(q_id) or "").strip()

        correct = _answers_match(user_answer, correct_answer)
        if correct:
            score += 1

        results.append({
            "id": q_id,
            "correct": correct,
            "userAnswer": user_answer,
            "correctAnswer": correct_answer,
            "explanation": explanation,
        })

    total = len(questions)

    # ✅ Generate feedback_ai based on performance
    feedback_ai = None
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            client = OpenAI(api_key=api_key)

            fb_system = (
                "You are an IELTS Listening coach.\n"
                "Return STRICT JSON only.\n"
                "Give short, avatar-friendly feedback based on the score and mistakes.\n"
            )
            fb_user = {
                "sectionType": section_type,
                "score": score,
                "total": total,
                "mistakes": [r for r in results if not r.get("correct")][:6],
                "jsonSchema": {
                    "summary": "string",
                    "strengths": ["string"],
                    "weaknesses": ["string"],
                    "nextSteps": ["string"],
                    "bandAdvice": "string"
                }
            }

            try:
                fb_resp = client.responses.create(
                    model=os.getenv("LISTENING_FEEDBACK_MODEL", "gpt-4.1-nano"),
                    input=[
                        {"role": "system", "content": fb_system},
                        {"role": "user", "content": json.dumps(fb_user, ensure_ascii=False)},
                    ],
                    temperature=0.2,
                )
                fb_text = fb_resp.output_text
            except Exception:
                fb_resp = client.chat.completions.create(
                    model=os.getenv("LISTENING_FEEDBACK_MODEL", "gpt-4.1-nano"),
                    messages=[
                        {"role": "system", "content": fb_system},
                        {"role": "user", "content": json.dumps(fb_user, ensure_ascii=False)},
                    ],
                    temperature=0.2,
                )
                fb_text = fb_resp.choices[0].message.content

            feedback_ai = json.loads(fb_text)
    except Exception:
        feedback_ai = None

    created_at = datetime.utcnow().isoformat() + "Z"

    log_entry = {
        "attemptId": attempt_id,
        "userId": user_id,
        "username": username,
        "emailId": email_id,
        "sectionType": section_type,
        "score": score,
        "total": total,
        "results": results,
        "conversation_logs": conversation_logs,  # ✅ stored if provided
        "feedback_ai": feedback_ai,
        "createdAt": created_at,
        "version": "listening_v1",
    }

    print("LISTENING SCORE HIT:", log_entry.get("userId"), log_entry.get("sectionType"), log_entry.get("score"), "/", log_entry.get("total"))

    # JSONL log
    try:
        _append_log_jsonl(user_id=user_id, payload=log_entry)
    except Exception:
        pass

    # DB insert (non-fatal)
    try:
        insert_listening_log(log_entry)
    except Exception:
        print("DB INSERT FAILED (listening_logs):", repr(e))

    return {
        "attemptId": attempt_id,
        "score": score,
        "total": total,
        "results": results,
        "feedback_ai": feedback_ai,
    }

# ─────────────── Health ───────────────

@router.get("/listening/health")
def listening_health():
    return {"ok": True, "module": "listening"}
