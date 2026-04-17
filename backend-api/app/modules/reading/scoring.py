from __future__ import annotations

from typing import Any
import re


def normalize_answer(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, (int, float)):
        return str(val).strip().lower()
    if isinstance(val, str):
        return val.strip().lower()
    return str(val).strip().lower()


def answers_match(expected: Any, actual: Any, qtype: str) -> bool:
    e = normalize_answer(expected)
    a = normalize_answer(actual)

    if qtype == "multiple_choice":
        # expected may be "A" or "B" etc.
        return a[:1] == e[:1] and a[:1] in {"a", "b", "c", "d"}

    if qtype == "true_false_not_given":
        # allow t/f/ng, true/false/not given
        mapping = {
            "t": "true",
            "true": "true",
            "f": "false",
            "false": "false",
            "ng": "not given",
            "notgiven": "not given",
            "not given": "not given",
        }

        def norm_tfng(x: str) -> str:
            x = x.replace("_", " ")
            x = x.replace("-", " ")
            x = " ".join(x.split())
            return mapping.get(x, x)

        return norm_tfng(a) == norm_tfng(e)

    if qtype in {"short_answer", "matching_headings"}:
        # forgiving: exact match after basic normalization
        return a == e

    return a == e


# ---------------------------
# ✅ NEW: Evidence + Explanation helpers (NO impact on scoring)
# ---------------------------

_WORD_RE = re.compile(r"[A-Za-z0-9']+")


def _tokenize(text: str) -> set[str]:
    text = (text or "").lower()
    return {m.group(0) for m in _WORD_RE.finditer(text) if len(m.group(0)) >= 3}


def _split_sentences(text: str) -> list[str]:
    """
    Simple sentence splitter.
    Keeps sentences readable and stable for "exact sentence highlighting".
    """
    t = (text or "").strip()
    if not t:
        return []
    # Split on . ! ? followed by whitespace (keeps punctuation)
    parts = re.split(r"(?<=[.!?])\s+", t)
    return [p.strip() for p in parts if p.strip()]


def _best_evidence_sentences(passage_text: str, prompt: str, correct_answer: Any, limit: int = 3) -> list[str]:
    """
    Pick 1-3 exact sentences from the passage that best match the question + correct answer.
    This is heuristic (no OpenAI call) and does NOT change scoring.
    """
    sentences = _split_sentences(passage_text)
    if not sentences:
        return []

    # Keywords from prompt + correct answer
    key_tokens = _tokenize(prompt) | _tokenize(str(correct_answer))
    if not key_tokens:
        # fallback: return first 1-2 sentences if we have nothing
        return sentences[: min(limit, len(sentences))]

    scored: list[tuple[int, int, str]] = []
    for idx, s in enumerate(sentences):
        st = _tokenize(s)
        overlap = len(st & key_tokens)
        # slight boost for shorter sentences (more precise)
        length_penalty = max(0, len(st) - 25)
        score = overlap * 10 - length_penalty
        scored.append((score, idx, s))

    scored.sort(key=lambda x: (-x[0], x[1]))

    # Take top sentences with positive score; if none, fallback to 1 sentence
    best = [s for (score, _, s) in scored if score > 0][:limit]
    if not best:
        best = [scored[0][2]]

    # Ensure unique, keep order as they appear in passage
    seen = set()
    ordered: list[tuple[int, str]] = []
    for s in best:
        if s in seen:
            continue
        seen.add(s)
        try:
            pos = sentences.index(s)
        except ValueError:
            pos = 10**9
        ordered.append((pos, s))

    ordered.sort(key=lambda x: x[0])
    return [s for _, s in ordered]


def _build_explanation(correct_answer: Any, evidence: list[str]) -> str:
    """
    A clean, safe explanation string based on evidence sentences.
    (No model call; your scoring remains unchanged.)
    """
    ca = str(correct_answer).strip()
    if evidence:
        # Short + clear
        joined = " ".join(evidence[:2]).strip()
        return f"The correct answer is '{ca}' because the passage states: {joined}"
    return f"The correct answer is '{ca}' based on the passage."


def compute_scores(attempt: dict[str, Any], user_answers: dict[str, Any]):
    passages = attempt.get("passages", [])

    # ✅ NEW: build passage text map for evidence extraction
    passage_text_map: dict[str, str] = {}
    for ptxt in attempt.get("passagesText", []) or []:
        pid = str(ptxt.get("passageId"))
        passage_text_map[pid] = (ptxt.get("text") or "")

    wrong = []
    per_passage = {"1": {"correct": 0, "total": 0}, "2": {"correct": 0, "total": 0}, "3": {"correct": 0, "total": 0}}

    for p in passages:
        pid = str(p.get("passageId"))
        for q in p.get("questions", []):
            qid = q.get("id")
            qtype = q.get("type")
            expected = q.get("correctAnswer")
            actual = user_answers.get(qid)

            per_passage.setdefault(pid, {"correct": 0, "total": 0})
            per_passage[pid]["total"] += 1

            if answers_match(expected, actual, qtype):
                per_passage[pid]["correct"] += 1
            else:
                # ✅ NEW: evidence + explanation (NO impact on scoring)
                passage_text = passage_text_map.get(pid, "")
                prompt = q.get("prompt", "") or ""
                evidence = _best_evidence_sentences(passage_text, prompt, expected, limit=3)
                explanation = _build_explanation(expected, evidence)

                wrong.append(
                    {
                        "questionId": qid,
                        "passageId": pid,
                        "prompt": prompt,
                        "correctAnswer": expected,
                        "userAnswer": actual,
                        "type": qtype,

                        # ✅ added fields (frontend can show + highlight)
                        "evidence_sentences": evidence,
                        "explanation": explanation,
                    }
                )

    total_q = sum(v["total"] for v in per_passage.values())
    total_c = sum(v["correct"] for v in per_passage.values())

    def pct(c: int, t: int) -> float:
        return round((c / t) * 100.0, 2) if t else 0.0

    scores = {
        "overall_score": pct(total_c, total_q),
        "passage_1_score": pct(per_passage.get("1", {}).get("correct", 0), per_passage.get("1", {}).get("total", 0)),
        "passage_2_score": pct(per_passage.get("2", {}).get("correct", 0), per_passage.get("2", {}).get("total", 0)),
        "passage_3_score": pct(per_passage.get("3", {}).get("correct", 0), per_passage.get("3", {}).get("total", 0)),
        "total_questions": total_q,
        "correct_questions": total_c,
        "wrong_answer": wrong,
    }
    return scores
