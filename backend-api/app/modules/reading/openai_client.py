from __future__ import annotations

import json
from typing import Any

from .config import settings


class OpenAIUnavailable(RuntimeError):
    pass


def _get_client():
    if not settings.openai_api_key:
        raise OpenAIUnavailable("OPENAI_API_KEY is not set")
    try:
        from openai import OpenAI
    except Exception as e:
        raise OpenAIUnavailable(
            "OpenAI python package not installed. Run: pip install openai"
        ) from e
    return OpenAI(api_key=settings.openai_api_key)


def _safe_json_loads(raw: str) -> dict[str, Any]:
    raw = (raw or "").strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(raw[start : end + 1])
        raise


def _normalize_questions_payload(obj: dict[str, Any], expected_ids: list[str]) -> dict[str, Any]:
    passages = obj.get("passages")

    # passages as dict keyed by id
    if isinstance(passages, dict):
        norm = []
        for pid in expected_ids:
            val = passages.get(pid) or passages.get(str(pid))
            if isinstance(val, dict):
                qs = val.get("questions", [])
                norm.append({"passageId": str(pid), "questions": qs if isinstance(qs, list) else []})
            elif isinstance(val, list):
                norm.append({"passageId": str(pid), "questions": val})
            else:
                norm.append({"passageId": str(pid), "questions": []})
        obj["passages"] = norm
        return obj

    # passages as list
    if isinstance(passages, list):
        by_id: dict[str, Any] = {}
        for p in passages:
            if isinstance(p, dict):
                pid = str(p.get("passageId") or p.get("id") or "")
                if pid:
                    by_id[pid] = p

        norm = []
        for pid in expected_ids:
            p = by_id.get(str(pid))
            if not isinstance(p, dict):
                norm.append({"passageId": str(pid), "questions": []})
                continue
            qs = p.get("questions", [])
            norm.append({"passageId": str(pid), "questions": qs if isinstance(qs, list) else []})

        obj["passages"] = norm
        return obj

    # unknown
    obj["passages"] = [{"passageId": pid, "questions": []} for pid in expected_ids]
    return obj


def _is_valid_questions_payload(obj: dict[str, Any], expected_ids: list[str]) -> bool:
    passages = obj.get("passages")
    if not isinstance(passages, list) or len(passages) != len(expected_ids):
        return False

    seen = set()
    for p in passages:
        if not isinstance(p, dict):
            return False
        pid = str(p.get("passageId") or "")
        if pid not in expected_ids:
            return False
        seen.add(pid)
        if not isinstance(p.get("questions"), list):
            return False

    return seen == set(expected_ids)


# ✅ REQUIRED by router import
def generate_reading_passages(seed: str | None = None) -> dict[str, Any]:
    client = _get_client()

    schema_hint = {
        "passages": [
            {"passageId": "1", "title": "...", "text": "..."},
            {"passageId": "2", "title": "...", "text": "..."},
            {"passageId": "3", "title": "...", "text": "..."},
        ]
    }

    system = (
        "You create IELTS Academic Reading passages.\n"
        "Return STRICT JSON only (no markdown, no extra text).\n"
        "Return exactly:\n"
        '{ "passages": ['
        '{"passageId":"1","title":"...","text":"..."},'
        '{"passageId":"2","title":"...","text":"..."},'
        '{"passageId":"3","title":"...","text":"..."}'
        "] }\n"
        "Rules:\n"
        "- Passage 1: easy/general topic (~250-350 words)\n"
        "- Passage 2: medium (~350-500 words)\n"
        "- Passage 3: harder academic/scientific (~500-700 words)\n"
        "- No copyrighted text\n"
        '- passageId must be strings "1","2","3"\n'
    )

    user = {"seed": seed or "", "output_schema_example": schema_hint}

    resp = client.chat.completions.create(
        model=settings.openai_model_passages,
        temperature=0.7,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
        ],
    )

    content = resp.choices[0].message.content or "{}"
    print("OPENAI RAW CONTENT (passages):", content)
    return _safe_json_loads(content)


# ✅ ONLY ONE version (no duplicates)

def generate_reading_questions(passages: list[dict[str, str]]) -> dict[str, Any]:
    client = _get_client()
    expected_ids = [str(p.get("passageId")) for p in passages if p.get("passageId")]

    # ✅ Desired question counts per passage (defaults to 13,13,14 => total 40)
    dist = getattr(settings, "questions_distribution", None)
    if (
        isinstance(dist, (list, tuple))
        and len(dist) == len(expected_ids)
        and all(isinstance(x, int) and x > 0 for x in dist)
    ):
        counts = [int(x) for x in dist]
    else:
        counts = [settings.questions_per_passage for _ in expected_ids]

    total_questions = sum(counts)

    schema_hint = {
        "passages": [
            {
                "passageId": "1",
                "questions": [
                    {
                        "id": "p1_q1",
                        "type": "multiple_choice",
                        "prompt": "...",
                        "options": ["...", "...", "...", "..."],
                        "correctAnswer": "A",
                        "rationale": "...",
                    }
                ],
            }
        ],
        "notes": "...",
    }

    system_base = """
You are an IELTS Reading examiner.
Generate questions based ONLY on the provided passage text.
Return STRICT JSON only (no markdown, no extra text).

Return exactly:
{ "passages": [
  {"passageId":"1","questions":[...]},
  {"passageId":"2","questions":[...]},
  {"passageId":"3","questions":[...]}
], "notes": "..." }

Rules:
- Include ALL passageIds exactly: __IDS__
- Question counts MUST be:
  - Passage 1: __N1__ questions
  - Passage 2: __N2__ questions
  - Passage 3: __N3__ questions
  - Total: __TOTAL__ questions
- Allowed types: multiple_choice, true_false_not_given, matching_headings, short_answer
- For multiple_choice: include 4 options and correctAnswer as A/B/C/D.
- Use ids like p1_q1, p1_q2, p2_q1... (do NOT use braces in ids).
- Each question MUST include: id, type, prompt, correctAnswer. Include options only for multiple_choice.
""".strip()

    user = {
        "questions_distribution": {"1": counts[0], "2": counts[1], "3": counts[2]}
        if len(counts) >= 3
        else counts,
        "passages": passages,
        "output_schema_example": schema_hint,
        "notes": "Ensure question counts are exact and IDs are unique per passage.",
    }

    def _has_expected_counts(obj: dict[str, Any]) -> bool:
        passages_obj = obj.get("passages")
        if not isinstance(passages_obj, list) or len(passages_obj) != len(expected_ids):
            return False
        want = {expected_ids[i]: counts[i] for i in range(len(expected_ids))}
        for p in passages_obj:
            pid = str(p.get("passageId") or "")
            qs = p.get("questions")
            if pid not in want or not isinstance(qs, list):
                return False
            if len(qs) != want[pid]:
                return False
        return True

    def _call(temp: float, extra_strict: bool) -> dict[str, Any]:
        system = (
            system_base.replace("__IDS__", ",".join(expected_ids))
            .replace("__N1__", str(counts[0] if len(counts) > 0 else settings.questions_per_passage))
            .replace("__N2__", str(counts[1] if len(counts) > 1 else settings.questions_per_passage))
            .replace("__N3__", str(counts[2] if len(counts) > 2 else settings.questions_per_passage))
            .replace("__TOTAL__", str(total_questions))
        )
        if extra_strict:
            system += "\nReturn only JSON. No extra keys. Ensure counts are exact."

        resp = client.chat.completions.create(
            model=settings.openai_model_questions,
            temperature=temp,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
            ],
        )

        content = resp.choices[0].message.content or "{}"
        print("OPENAI RAW CONTENT (questions):", content)
        obj = _safe_json_loads(content)
        obj = _normalize_questions_payload(obj, expected_ids)
        return obj

    def _generate_missing_for_passage(
        pid: str, passage_text: str, need: int, existing_ids: list[str]
    ) -> list[dict[str, Any]]:
        """If OpenAI returned fewer questions, ask for the missing ones for that passage only."""
        if need <= 0:
            return []
        system = (
            "You are an IELTS Reading examiner. Generate additional questions based ONLY on the passage text.\n"
            "Return STRICT JSON only (no markdown).\n"
            'Return exactly: {"questions":[...]}\n'
            f"Generate exactly {need} questions.\n"
            "Allowed types: multiple_choice, true_false_not_given, matching_headings, short_answer\n"
            "For multiple_choice: include 4 options and correctAnswer as A/B/C/D.\n"
            "Each question MUST include: id, type, prompt, correctAnswer. Include options only for multiple_choice.\n"
            f"Do NOT reuse any of these ids: {', '.join(existing_ids) if existing_ids else 'NONE'}\n"
            f"Use ids that start with p{pid}_q and continue numbering.\n"
        )
        user_payload = {"passageId": pid, "text": passage_text, "existing_ids": existing_ids}

        resp = client.chat.completions.create(
            model=settings.openai_model_questions,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
            ],
        )

        content = resp.choices[0].message.content or "{}"
        obj = _safe_json_loads(content)
        qs = obj.get("questions")
        return qs if isinstance(qs, list) else []

    obj = _call(temp=0.6, extra_strict=False)
    if not _is_valid_questions_payload(obj, expected_ids) or not _has_expected_counts(obj):
        obj = _call(temp=0.2, extra_strict=True)

    # ✅ Post-process: trim extras, and if short, generate missing per passage.
    obj = _normalize_questions_payload(obj, expected_ids)
    by_pid_text = {str(p.get("passageId")): (p.get("text") or "") for p in passages}
    want = {expected_ids[i]: counts[i] for i in range(len(expected_ids))}

    for p in obj.get("passages", []):
        pid = str(p.get("passageId") or "")
        qs = p.get("questions") if isinstance(p.get("questions"), list) else []

        # trim if too many
        if pid in want and len(qs) > want[pid]:
            p["questions"] = qs[: want[pid]]
            qs = p["questions"]

        # fill if too few
        if pid in want and len(qs) < want[pid]:
            need = want[pid] - len(qs)
            existing_ids = [str(q.get("id")) for q in qs if isinstance(q, dict) and q.get("id")]
            more = _generate_missing_for_passage(pid, by_pid_text.get(pid, ""), need, existing_ids)
            if isinstance(more, list) and more:
                p["questions"] = (qs + more)[: want[pid]]

    return obj

def generate_feedback(feedback_payload: dict[str, Any]) -> dict[str, Any]:
    client = _get_client()

    system = (
        "You are an IELTS Reading coach. Provide concise, actionable feedback. "
        "Focus on why answers were wrong, where in the passage the clue likely was, "
        "and 3 study tips. Return STRICT JSON only (no markdown)."
    )

    schema_hint = {
        "overall": "...",
        "byPassage": {"1": "...", "2": "...", "3": "..."},
        "tips": ["...", "...", "..."],
    }

    user = {"input": feedback_payload, "output_schema_example": schema_hint}

    resp = client.chat.completions.create(
        model=settings.openai_model_feedback,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
        ],
    )

    content = resp.choices[0].message.content or "{}"
    return _safe_json_loads(content)