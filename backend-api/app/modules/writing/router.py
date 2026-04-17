import os
import uuid
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import math

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from livekit import api as lk_api

router = APIRouter(tags=["writing"])

# =========================
# Logging (NO DB)
# =========================
LOG_DIR = Path(__file__).resolve().parents[3] / "KMS" / "logs" / "writing_logs"# backend-api/KMS/logs


def _safe_filename(s: str) -> str:
    s = (s or "anonymous").strip().lower()
    s = re.sub(r"[^a-z0-9._-]+", "_", s)
    return s[:80] or "anonymous"


def _append_log_jsonl(user_id: str, payload: Dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    day = datetime.utcnow().strftime("%Y-%m-%d")
    fname = f"writing_logs_{_safe_filename(user_id)}_{day}.jsonl"
    path = LOG_DIR / fname

    payload = dict(payload)
    payload["loggedAtUtc"] = datetime.utcnow().isoformat() + "Z"

    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


# =========================
# LiveKit helpers
# =========================

def _generate_room_name(prefix: str = "room") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


@router.get("/getToken")
def get_token(
    identity: str = Query(default="guest"),
    name: Optional[str] = Query(default=None),
    room: Optional[str] = Query(default=None),
    room_prefix: str = Query(default="room"),
):
    # Backward compatible with old params: identity or name
    display_name = name or identity

    if not isinstance(identity, str) or identity.strip() in ("", "[object Object]"):
        identity = "guest"
    if not isinstance(display_name, str) or display_name.strip() in ("", "[object Object]"):
        display_name = "guest"

    identity = identity.strip()[:64]
    display_name = display_name.strip()[:64]

    if not room:
        room = _generate_room_name(prefix=room_prefix)

    api_key = os.environ.get("LIVEKIT_API_KEY")
    api_secret = os.environ.get("LIVEKIT_API_SECRET")
    if not api_key or not api_secret:
        raise HTTPException(status_code=500, detail="LIVEKIT_API_KEY/LIVEKIT_API_SECRET missing")

    token = (
        lk_api.AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(display_name)
        .with_grants(
            lk_api.VideoGrants(
                room_join=True,
                room=room,
                can_publish=True,
                can_subscribe=True,
            )
        )
    )

    return {"token": token.to_jwt(), "room": room}


# =========================
# Scoring endpoint (+ logs)
# =========================
@router.post("/writing/score")
def writing_score(payload: Dict[str, Any]):
    from openai import OpenAI
    from .db import insert_writing_log

    attempt_id = uuid.uuid4().hex  # ✅ unique ID per score attempt

    user_id = str((payload.get("userId") or "anonymous")).strip() or "anonymous"
    display_name = str(payload.get("displayName") or "").strip()
    email_id = str(payload.get("emailId") or payload.get("email") or "").strip()  # ✅ optional
    task_type = payload.get("taskType")
    question = payload.get("question", "")
    essay = payload.get("essay", "")

    if task_type not in ("task1", "task2"):
        raise HTTPException(status_code=400, detail="taskType must be 'task1' or 'task2'")
    if not essay or len(str(essay).strip()) < 20:
        raise HTTPException(status_code=400, detail="Essay text is too short")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing")

    client = OpenAI(api_key=api_key)

    criteria_names = (
        ["Task Achievement", "Coherence and Cohesion", "Lexical Resource", "Grammatical Range and Accuracy"]
        if task_type == "task1"
        else ["Task Response", "Coherence and Cohesion", "Lexical Resource", "Grammatical Range and Accuracy"]
    )

    system = (
        "You are an IELTS Writing examiner.\n"
        "Return STRICT JSON only, with no markdown.\n"
        "You must provide band scores in 0.5 increments between 0 and 9.\n"
        "Be fair and align with official IELTS descriptors.\n"
    )

    user = {
        "taskType": task_type,
        "question": question,
        "essay": essay,
        "requiredCriteria": criteria_names,
        "jsonSchema": {
            "overallScore": "number",
            "criteria": [{"name": "string", "score": "number", "description": "string"}],
            "highlights": ["string"],
            "improvements": ["string"],
        },
    }

    try:
        resp = client.responses.create(
            model=os.getenv("WRITING_SCORING_MODEL", "gpt-4.1-nano"),
            input=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
            ],
            temperature=0.2,
        )
        text = resp.output_text
    except Exception:
        resp = client.chat.completions.create(
            model=os.getenv("WRITING_SCORING_MODEL", "gpt-4.1-nano"),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user, ensure_ascii=False)},
            ],
            temperature=0.2,
        )
        text = resp.choices[0].message.content

    try:
        out = json.loads(text)
    except Exception:
        return JSONResponse(
            status_code=502,
            content={"error": "Model did not return valid JSON", "raw": (text or "")[:2000]},
        )

    if "overallScore" not in out or "criteria" not in out:
        return JSONResponse(status_code=502, content={"error": "Invalid scoring payload", "raw": out})

    # Extract criterion columns for log
    scores = {
        "taskAchievement": None,
        "taskResponse": None,
        "coherenceAndCohesion": None,
        "lexicalResource": None,
        "grammaticalRangeAndAccuracy": None,
    }

    for c in (out.get("criteria") or []):
        name = str(c.get("name") or "").strip()
        try:
            sc = float(c.get("score"))
        except Exception:
            sc = None

        if name == "Task Achievement":
            scores["taskAchievement"] = sc
        elif name == "Task Response":
            scores["taskResponse"] = sc
        elif name == "Coherence and Cohesion":
            scores["coherenceAndCohesion"] = sc
        elif name == "Lexical Resource":
            scores["lexicalResource"] = sc
        elif name == "Grammatical Range and Accuracy":
            scores["grammaticalRangeAndAccuracy"] = sc

    # ✅ Generate avatar-friendly feedback_ai (short, actionable)
    feedback_ai = None
    try:
        fb_system = (
            "You are an IELTS Writing coach.\n"
            "Return STRICT JSON only.\n"
            "Give brief, actionable feedback for the learner based on their scores.\n"
        )
        fb_user = {
            "overallScore": out.get("overallScore"),
            "taskType": task_type,
            "criteria": out.get("criteria", []),
            "highlights": out.get("highlights", []),
            "improvements": out.get("improvements", []),
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
                model=os.getenv("WRITING_FEEDBACK_MODEL", "gpt-4.1-nano"),
                input=[
                    {"role": "system", "content": fb_system},
                    {"role": "user", "content": json.dumps(fb_user, ensure_ascii=False)},
                ],
                temperature=0.2,
            )
            fb_text = fb_resp.output_text
        except Exception:
            fb_resp = client.chat.completions.create(
                model=os.getenv("WRITING_FEEDBACK_MODEL", "gpt-4.1-nano"),
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

    # ✅ Build log entry
    log_entry = {
        "attemptId": attempt_id,
        "userId": user_id,
        "displayName": display_name,
        "emailId": email_id,
        "taskType": task_type,
        "question": question,
        "essay": essay,
        "overallScore": out.get("overallScore"),
        **scores,
        "criteria": out.get("criteria"),
        "feedback_ai": feedback_ai,
        "createdAt": created_at,
        "version": "writing_v1",
    }

    # ✅ JSONL log (KMS/logs/writing_logs/)
    try:
        _append_log_jsonl(user_id=user_id, payload=log_entry)
    except Exception as e:
        out["_logError"] = str(e)

    # ✅ DB insert (non-fatal)
    try:
        insert_writing_log(log_entry)
    except Exception:
        pass

    # ✅ include attemptId + feedback_ai in API response
    out["attemptId"] = attempt_id
    out["feedback_ai"] = feedback_ai
    return out
# =========================
# Chart renderers (SVG)
# =========================

def _clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def _svg_bar_chart(spec: Dict[str, Any]) -> str:
    width = 760
    height = 360
    pad_l, pad_r, pad_t, pad_b = 64, 24, 24, 56

    categories: List[str] = list(spec.get("categories") or [])
    series: List[Dict[str, Any]] = list(spec.get("series") or [])
    if not categories or not series:
        return ""

    vals: List[float] = []
    for s in series:
        for v in (s.get("values") or []):
            try:
                vals.append(float(v))
            except Exception:
                pass
    vmax = max(vals) if vals else 1.0
    vmax = vmax * 1.1

    chart_w = width - pad_l - pad_r
    chart_h = height - pad_t - pad_b

    n_cat = len(categories)
    n_ser = len(series)
    group_w = chart_w / max(1, n_cat)
    bar_gap = 6
    bar_w = _clamp((group_w - (bar_gap * (n_ser + 1))) / max(1, n_ser), 4, 80)

    palette = ["#2563eb", "#10b981", "#a855f7", "#f59e0b", "#ef4444"]

    def y_for(v: float) -> float:
        return pad_t + chart_h - (v / vmax) * chart_h

    title = (spec.get("title") or "").strip()
    y_label = (spec.get("yLabel") or "").strip()

    svg = [
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>",
        "<rect width='100%' height='100%' fill='white'/>",
        "<style>text{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}</style>",
    ]
    if title:
        svg.append(
            f"<text x='{width/2}' y='18' text-anchor='middle' font-size='14' font-weight='600' fill='#0f172a'>{title}</text>"
        )

    x0, y0 = pad_l, pad_t + chart_h
    x1, y1 = pad_l + chart_w, pad_t
    svg.append(f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='#cbd5e1' stroke-width='1'/>")
    svg.append(f"<line x1='{x0}' y1='{y0}' x2='{x0}' y2='{y1}' stroke='#cbd5e1' stroke-width='1'/>")

    for i in range(0, 6):
        v = (vmax / 5) * i
        y = y_for(v)
        svg.append(f"<line x1='{x0-4}' y1='{y}' x2='{x0}' y2='{y}' stroke='#94a3b8' stroke-width='1'/>")
        svg.append(f"<text x='{x0-8}' y='{y+4}' text-anchor='end' font-size='10' fill='#475569'>{int(round(v))}</text>")
        svg.append(f"<line x1='{x0}' y1='{y}' x2='{x1}' y2='{y}' stroke='#f1f5f9' stroke-width='1'/>")

    for ci, cat in enumerate(categories):
        gx = pad_l + ci * group_w
        cx = gx + group_w / 2
        svg.append(f"<text x='{cx}' y='{pad_t + chart_h + 20}' text-anchor='middle' font-size='10' fill='#334155'>{cat}</text>")
        for si, s in enumerate(series):
            values = s.get("values") or []
            try:
                v = float(values[ci])
            except Exception:
                v = 0.0
            bx = gx + bar_gap + si * (bar_w + bar_gap)
            by = y_for(v)
            bh = (pad_t + chart_h) - by
            color = palette[si % len(palette)]
            svg.append(
                f"<rect x='{bx}' y='{by}' width='{bar_w}' height='{bh}' rx='4' fill='{color}' fill-opacity='0.9'/>"
            )

    leg_x = pad_l
    leg_y = height - 22
    for si, s in enumerate(series):
        color = palette[si % len(palette)]
        name = (s.get("name") or f"Series {si+1}").strip()
        svg.append(f"<rect x='{leg_x}' y='{leg_y-10}' width='10' height='10' rx='2' fill='{color}'/>")
        svg.append(f"<text x='{leg_x+14}' y='{leg_y-1}' font-size='10' fill='#334155'>{name}</text>")
        leg_x += 14 + (7 * len(name)) + 18

    if y_label:
        svg.append(
            f"<text x='14' y='{pad_t + chart_h/2}' font-size='10' fill='#334155' transform='rotate(-90 14 {pad_t + chart_h/2})'>{y_label}</text>"
        )

    svg.append("</svg>")
    return "".join(svg)


def _svg_line_chart(spec: Dict[str, Any]) -> str:
    width = 760
    height = 360
    pad_l, pad_r, pad_t, pad_b = 64, 24, 24, 56

    categories: List[str] = list(spec.get("categories") or [])
    series: List[Dict[str, Any]] = list(spec.get("series") or [])
    if not categories or not series:
        return ""

    vals: List[float] = []
    for s in series:
        for v in (s.get("values") or []):
            try:
                vals.append(float(v))
            except Exception:
                pass
    vmax = max(vals) if vals else 1.0
    vmin = min(vals) if vals else 0.0
    if vmax == vmin:
        vmax += 1.0
    vmax = vmax + (vmax - vmin) * 0.1
    vmin = vmin - (vmax - vmin) * 0.05

    chart_w = width - pad_l - pad_r
    chart_h = height - pad_t - pad_b

    palette = ["#2563eb", "#10b981", "#a855f7", "#f59e0b", "#ef4444"]

    def x_for(i: int) -> float:
        if len(categories) <= 1:
            return pad_l + chart_w / 2
        return pad_l + (i / (len(categories) - 1)) * chart_w

    def y_for(v: float) -> float:
        return pad_t + chart_h - ((v - vmin) / (vmax - vmin)) * chart_h

    title = (spec.get("title") or "").strip()
    y_label = (spec.get("yLabel") or "").strip()

    svg = [
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>",
        "<rect width='100%' height='100%' fill='white'/>",
        "<style>text{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}</style>",
    ]
    if title:
        svg.append(
            f"<text x='{width/2}' y='18' text-anchor='middle' font-size='14' font-weight='600' fill='#0f172a'>{title}</text>"
        )

    x0, y0 = pad_l, pad_t + chart_h
    x1, y1 = pad_l + chart_w, pad_t
    svg.append(f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='#cbd5e1' stroke-width='1'/>")
    svg.append(f"<line x1='{x0}' y1='{y0}' x2='{x0}' y2='{y1}' stroke='#cbd5e1' stroke-width='1'/>")

    for i in range(0, 6):
        v = vmin + ((vmax - vmin) / 5) * i
        y = y_for(v)
        svg.append(f"<line x1='{x0}' y1='{y}' x2='{x1}' y2='{y}' stroke='#f1f5f9' stroke-width='1'/>")
        svg.append(f"<text x='{x0-8}' y='{y+4}' text-anchor='end' font-size='10' fill='#475569'>{int(round(v))}</text>")

    for i, cat in enumerate(categories):
        x = x_for(i)
        svg.append(f"<text x='{x}' y='{pad_t + chart_h + 20}' text-anchor='middle' font-size='10' fill='#334155'>{cat}</text>")

    for si, s in enumerate(series):
        values = s.get("values") or []
        pts: List[Tuple[float, float]] = []
        for i in range(len(categories)):
            try:
                v = float(values[i])
            except Exception:
                v = 0.0
            pts.append((x_for(i), y_for(v)))
        color = palette[si % len(palette)]
        pts_str = " ".join([f"{x:.1f},{y:.1f}" for x, y in pts])
        svg.append(f"<polyline fill='none' stroke='{color}' stroke-width='2.5' points='{pts_str}'/>")
        for x, y in pts:
            svg.append(f"<circle cx='{x:.1f}' cy='{y:.1f}' r='3.5' fill='{color}'/>")

    leg_x = pad_l
    leg_y = height - 22
    for si, s in enumerate(series):
        color = palette[si % len(palette)]
        name = (s.get("name") or f"Series {si+1}").strip()
        svg.append(f"<rect x='{leg_x}' y='{leg_y-10}' width='10' height='10' rx='2' fill='{color}'/>")
        svg.append(f"<text x='{leg_x+14}' y='{leg_y-1}' font-size='10' fill='#334155'>{name}</text>")
        leg_x += 14 + (7 * len(name)) + 18

    if y_label:
        svg.append(
            f"<text x='14' y='{pad_t + chart_h/2}' font-size='10' fill='#334155' transform='rotate(-90 14 {pad_t + chart_h/2})'>{y_label}</text>"
        )

    svg.append("</svg>")
    return "".join(svg)


def _svg_pie_chart(spec: Dict[str, Any]) -> str:
    width = 760
    height = 360
    title = (spec.get("title") or "").strip()

    labels: List[str] = list(spec.get("labels") or [])
    values_raw = list(spec.get("values") or [])
    values: List[float] = []
    for v in values_raw:
        try:
            values.append(max(0.0, float(v)))
        except Exception:
            values.append(0.0)

    if not labels or not values or len(labels) != len(values):
        return ""

    total = sum(values) or 1.0

    cx, cy = 220, 190
    r = 110
    palette = ["#2563eb", "#10b981", "#a855f7", "#f59e0b", "#ef4444", "#0ea5e9", "#22c55e"]

    def polar(angle: float) -> Tuple[float, float]:
        return cx + r * math.cos(angle), cy + r * math.sin(angle)

    svg = [
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>",
        "<rect width='100%' height='100%' fill='white'/>",
        "<style>text{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}</style>",
    ]
    if title:
        svg.append(
            f"<text x='{width/2}' y='18' text-anchor='middle' font-size='14' font-weight='600' fill='#0f172a'>{title}</text>"
        )

    start = -math.pi / 2
    for i, v in enumerate(values):
        frac = v / total
        end = start + frac * (2 * math.pi)
        x1, y1 = polar(start)
        x2, y2 = polar(end)
        large = 1 if (end - start) > math.pi else 0
        color = palette[i % len(palette)]
        path = f"M {cx},{cy} L {x1:.2f},{y1:.2f} A {r},{r} 0 {large} 1 {x2:.2f},{y2:.2f} Z"
        svg.append(f"<path d='{path}' fill='{color}' fill-opacity='0.9' stroke='white' stroke-width='2'/>")
        start = end

    lx, ly = 420, 90
    for i, lab in enumerate(labels):
        color = palette[i % len(palette)]
        pct = (values[i] / total) * 100
        svg.append(f"<rect x='{lx}' y='{ly + i*22}' width='12' height='12' rx='2' fill='{color}'/>")
        svg.append(f"<text x='{lx+18}' y='{ly + i*22 + 10}' font-size='11' fill='#334155'>{lab} ({pct:.0f}%)</text>")

    svg.append("</svg>")
    return "".join(svg)


def _svg_table(spec: Dict[str, Any]) -> str:
    width, height = 760, 360
    title = (spec.get("title") or "").strip()

    columns: List[str] = list(spec.get("columns") or [])
    rows: List[List[Any]] = list(spec.get("rows") or [])
    if not columns or not rows:
        return ""

    pad = 18
    table_x = 40
    table_y = 56
    table_w = width - 80
    row_h = 28

    col_w = table_w / max(1, len(columns))

    svg = [
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>",
        "<rect width='100%' height='100%' fill='white'/>",
        "<style>text{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}</style>",
    ]

    if title:
        svg.append(
            f"<text x='{width/2}' y='18' text-anchor='middle' font-size='14' font-weight='600' fill='#0f172a'>{title}</text>"
        )

    # header background
    svg.append(f"<rect x='{table_x}' y='{table_y}' width='{table_w}' height='{row_h}' fill='#f1f5f9' stroke='#e2e8f0'/>")

    for i, col in enumerate(columns):
        x = table_x + i * col_w
        svg.append(f"<text x='{x+pad}' y='{table_y+19}' font-size='11' fill='#0f172a' font-weight='600'>{col}</text>")

    for r_i, row in enumerate(rows[:9]):
        y = table_y + row_h * (r_i + 1)
        svg.append(f"<rect x='{table_x}' y='{y}' width='{table_w}' height='{row_h}' fill='white' stroke='#e2e8f0'/>")
        for c_i, cell in enumerate(row[: len(columns)]):
            x = table_x + c_i * col_w
            svg.append(f"<text x='{x+pad}' y='{y+19}' font-size='11' fill='#334155'>{str(cell)}</text>")

    svg.append("</svg>")
    return "".join(svg)


def _svg_map(spec: Dict[str, Any]) -> str:
    width, height = 760, 360
    title = (spec.get("title") or "").strip()

    unit = (spec.get("unit") or "").strip()
    regions: List[Dict[str, Any]] = list(spec.get("regions") or [])
    if not regions:
        return ""

    vals: List[float] = []
    for r in regions:
        try:
            vals.append(float(r.get("value", 0)))
        except Exception:
            vals.append(0.0)
    vmin, vmax = (min(vals), max(vals)) if vals else (0.0, 1.0)
    if vmax == vmin:
        vmax += 1.0

    def shade(v: float) -> str:
        # return a blue shade from light to dark
        t = (v - vmin) / (vmax - vmin)
        t = max(0.0, min(1.0, t))
        # interpolate between #dbeafe and #1d4ed8 roughly
        r1, g1, b1 = (219, 234, 254)
        r2, g2, b2 = (29, 78, 216)
        r = int(r1 + (r2 - r1) * t)
        g = int(g1 + (g2 - g1) * t)
        b = int(b1 + (b2 - b1) * t)
        return f"rgb({r},{g},{b})"

    svg = [
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>",
        "<rect width='100%' height='100%' fill='white'/>",
        "<style>text{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}</style>",
    ]

    if title:
        svg.append(
            f"<text x='{width/2}' y='18' text-anchor='middle' font-size='14' font-weight='600' fill='#0f172a'>{title}</text>"
        )

    # simple tile map
    cols = 3
    tile_w = 220
    tile_h = 70
    x0 = 40
    y0 = 60

    for i, r in enumerate(regions[:9]):
        name = str(r.get("name") or "Region")
        try:
            val = float(r.get("value", 0))
        except Exception:
            val = 0.0

        x = x0 + (i % cols) * (tile_w + 14)
        y = y0 + (i // cols) * (tile_h + 14)

        color = shade(val)
        svg.append(
            f"<rect x='{x}' y='{y}' width='{tile_w}' height='{tile_h}' rx='10' fill='{color}' fill-opacity='0.9' stroke='#1e3a8a' stroke-opacity='0.15'/>"
        )
        svg.append(f"<text x='{x+12}' y='{y+24}' font-size='12' fill='#0f172a' font-weight='600'>{name}</text>")
        svg.append(
            f"<text x='{x+12}' y='{y+46}' font-size='11' fill='#0f172a'>{val:g}{(' ' + unit) if unit else ''}</text>"
        )

    svg.append("</svg>")
    return "".join(svg)


def _render_chart_svg(chart: Optional[Dict[str, Any]]) -> str:
    if not chart:
        return ""
    ctype = (chart.get("type") or "").lower()
    if ctype == "bar":
        return _svg_bar_chart(chart)
    if ctype == "line":
        return _svg_line_chart(chart)
    if ctype == "pie":
        return _svg_pie_chart(chart)
    if ctype == "table":
        return _svg_table(chart)
    if ctype == "map":
        return _svg_map(chart)
    return ""


@router.get("/writing/question")
def writing_question(taskType: str = Query(..., alias="taskType")):
    """Generate a random IELTS Writing question (Task 1 or Task 2) via OpenAI.

    Returns same JSON shape used by the existing frontend, including chartSvg.
    """

    from openai import OpenAI

    task_type = (taskType or "").strip().lower()
    if task_type not in ("task1", "task2"):
        raise HTTPException(status_code=400, detail="taskType must be task1 or task2")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing")

    client = OpenAI(api_key=api_key)

    system = (
        "You are an IELTS content generator.\n"
        "Return STRICT JSON only. No markdown. No explanations.\n"
        "IMPORTANT:\n"
        "- Always include these keys: taskType, title, question, instructions, minWords, imageDescription, chart\n"
        "- question MUST be a non-empty string.\n"
        "- chart MUST be a non-empty object.\n"
        "- Do NOT use placeholder values like 'string' or 0 everywhere.\n"
        "- diagram type MUST be exactly one of: bar, line, pie, table, map.\n"
        "- Use 4-7 categories/slices/regions; for tables use 4-7 rows.\n"
        "- Values must be realistic and consistent.\n"
        "- Task 1 question: clearly asks to describe the diagram.\n"
        "- Task 2 question: normal IELTS essay prompt, PLUS one short sentence referencing the diagram as context.\n"
    )

    user = {
        "taskType": task_type,
        "outputShape": {
            "taskType": task_type,
            "title": "IELTS Writing Task 1" if task_type == "task1" else "IELTS Writing Task 2",
            "question": "NON_EMPTY_STRING",
            "instructions": ["STRING", "STRING", "STRING"],
            "minWords": 150 if task_type == "task1" else 250,
            "imageDescription": "NON_EMPTY_STRING",
            "chart": {"type": "bar|line|pie|table|map"},
        },
        "allowedDiagramTypes": ["bar", "line", "pie", "table", "map"],
    }

    def call_openai_once() -> str:
        try:
            resp = client.responses.create(
                model=os.getenv("WRITING_QUESTION_MODEL", "gpt-4.1-nano"),
                input=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": json.dumps(user)},
                ],
                temperature=1.0,
            )
            return resp.output_text
        except Exception:
            resp = client.chat.completions.create(
                model=os.getenv("WRITING_QUESTION_MODEL", "gpt-4.1-nano"),
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": json.dumps(user)},
                ],
                temperature=1.0,
            )
            return resp.choices[0].message.content

    last_text = ""
    for _ in range(2):
        last_text = call_openai_once()
        try:
            out = json.loads(last_text)
        except Exception:
            continue

        if not out.get("question") and out.get("prompt"):
            out["question"] = out.get("prompt")

        q = str(out.get("question") or "").strip()
        chart = out.get("chart") if isinstance(out.get("chart"), dict) else None

        if q and chart:
            svg = _render_chart_svg(chart)
            out["chartSvg"] = svg if svg else None
            return out

    return JSONResponse(
        status_code=502,
        content={"error": "Model did not return required fields (question/chart)", "raw": last_text[:2000]},
    )
