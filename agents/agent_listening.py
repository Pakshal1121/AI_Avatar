"""
IELTS Listening Coach Agent — Mia
==================================
ANAM avatar + OpenAI Realtime + function tools for 5-phase interactive coaching.

Phase flow (all driven by the LLM via function-tool calls):
  1. intro    — Mia greets, teaches 3 section-specific strategies
  2. preview  — Mia shows questions on-screen, reads them aloud
  3. passage  — Mia narrates the full passage with her avatar voice
  4. qa       — Mia asks each question; student answers verbally
  5. feedback — Mia reveals scores and explains every answer

Data channel messages published to frontend (JSON):
  { "type": "phase",     "phase": "intro|preview|passage|qa|feedback" }
  { "type": "questions", "questions": [{id, question, type, options?}] }
  { "type": "highlight", "questionId": N }
  { "type": "score",     "score": N, "total": N,
    "results": [{id, correct, userAnswer, correctAnswer, explanation}] }

Run:
  python agent_listening.py dev
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from openai import OpenAI as _OpenAISync

from livekit.agents import (
    Agent,
    AgentSession,
    ConversationItemAddedEvent,
    JobContext,
    JobRequest,
    WorkerOptions,
    WorkerType,
    cli,
    function_tool,
)
from livekit.plugins import anam, openai

from log import log_turn

# ── env ──────────────────────────────────────────────────────────────────────
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

logger = logging.getLogger("listening-coach")
logger.setLevel(logging.INFO)

AGENT_NAME = "Mia"
AGENT_WORKER_NAME = "listening-coach"

# ── section configs ──────────────────────────────────────────────────────────
SECTION_CONFIGS: dict[str, dict[str, Any]] = {
    "section1": {
        "label": "Section 1",
        "description": "a conversation between two people in an everyday social context — like booking a hotel, making an enquiry, or a phone call",
        "strategies": [
            "Read all questions before the audio starts — predict the type of answer (name, number, date, place)",
            "Listen for pauses and topic shifts — the conversation often changes subject before each new question",
            "Watch for corrections — speakers often say something then correct it, and the corrected version is the answer",
        ],
        "passage_style": "a natural dialogue between two speakers (e.g. a receptionist and a customer)",
        "difficulty": "easy",
        "question_count": 8,
    },
    "section2": {
        "label": "Section 2",
        "description": "a monologue in a social context — like a tour guide, a community announcement, or an orientation speech",
        "strategies": [
            "The speaker usually follows a clear structure — introduction, then topic by topic. Use that structure to navigate your questions",
            "Listen for signpost language like 'Moving on to…', 'Another important point is…' to locate answers",
            "Numbers, names, and dates are common answers — write them down immediately as you hear them",
        ],
        "passage_style": "a single speaker giving practical information to an audience",
        "difficulty": "medium",
        "question_count": 8,
    },
    "section3": {
        "label": "Section 3",
        "description": "a conversation in an educational or training context — like a university tutorial, a study group discussion, or a project meeting",
        "strategies": [
            "There are 2–4 speakers, often with different opinions. Track WHO is saying WHAT",
            "Questions often test opinions, suggestions, and conclusions — not just facts",
            "Multiple choice questions often contain distractors where a speaker mentions something then rejects it — stay alert",
        ],
        "passage_style": "a conversation between students and/or a tutor discussing academic work",
        "difficulty": "medium",
        "question_count": 9,
    },
    "section4": {
        "label": "Section 4",
        "description": "an academic monologue — typically a university lecture on a specific subject",
        "strategies": [
            "This is the hardest section. The lecturer uses academic vocabulary — use the preview time to spot topic keywords",
            "Answers often require you to understand a process or sequence — map the structure as you listen",
            "Paraphrasing is heavy here: the question uses different words from what you hear. Focus on meaning, not exact wording",
        ],
        "passage_style": "a university lecturer delivering an academic talk on a specific topic",
        "difficulty": "hard",
        "question_count": 10,
    },
}

# ── helpers ───────────────────────────────────────────────────────────────────

def _pick_user_name(room: Any, agent_name: str) -> str:
    try:
        for _, p in (room.remote_participants or {}).items():
            name = getattr(p, "name", None) or getattr(p, "identity", None)
            if not name:
                continue
            if str(name).strip().lower() == agent_name.strip().lower():
                continue
            return str(name)
    except Exception:
        pass
    return "Student"


async def _publish(room: Any, payload: dict) -> None:
    """Send a JSON data message to all frontend participants."""
    try:
        data = json.dumps(payload).encode("utf-8")
        await room.local_participant.publish_data(data, reliable=True)
    except Exception as e:
        logger.warning(f"publish_data failed: {e}")


# ── Pre-generate passage + questions (blocking, called at session start) ──────

def _generate_passage_and_questions(section_key: str) -> dict:
    """
    Call OpenAI synchronously (before the voice session starts) to generate
    a realistic IELTS passage and questions for the given section.
    Returns: {"transcript": str, "title": str, "questions": list}
    """
    cfg = SECTION_CONFIGS.get(section_key, SECTION_CONFIGS["section1"])
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set")

    client = _OpenAISync(api_key=api_key)

    system = (
        "You are an expert IELTS content author.\n"
        "Return STRICT JSON only. No markdown, no code fences, no explanations outside JSON.\n"
        "All fields must contain real, authentic content — no placeholders.\n"
        "The transcript must be natural spoken English (contractions, fillers), at least 350 words.\n"
        "Questions must be answerable ONLY from the transcript.\n"
        "For multiple_choice: include exactly 4 options labelled A–D.\n"
        "For fill_blank: blank is 1–4 words spoken verbatim in the transcript.\n"
        "For short_answer: answer is 1–6 words from the transcript.\n"
        "answers field must be lowercase and match the transcript verbatim or near-verbatim.\n"
    )

    user_payload = {
        "task": "Generate an IELTS Listening passage and questions",
        "sectionType": section_key,
        "sectionDescription": cfg["description"],
        "transcriptStyle": cfg["passage_style"],
        "difficulty": cfg["difficulty"],
        "numberOfQuestions": cfg["question_count"],
        "questionTypes": ["multiple_choice", "fill_blank", "short_answer"],
        "outputSchema": {
            "title": "short descriptive title, e.g. 'Hotel Booking Enquiry'",
            "transcript": "full spoken text, 350+ words, natural speech",
            "questions": [
                {
                    "id": 1,
                    "type": "multiple_choice | fill_blank | short_answer",
                    "question": "the question text",
                    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
                    "answer": "correct answer (lowercase)",
                    "explanation": "brief explanation referencing the transcript",
                }
            ],
        },
    }

    for attempt in range(3):
        try:
            try:
                resp = client.responses.create(
                    model=os.getenv("LISTENING_PASSAGE_MODEL", "gpt-4.1-mini"),
                    input=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": json.dumps(user_payload)},
                    ],
                    temperature=1.0,
                )
                raw = resp.output_text
            except Exception:
                resp = client.chat.completions.create(
                    model=os.getenv("LISTENING_PASSAGE_MODEL", "gpt-4.1-mini"),
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": json.dumps(user_payload)},
                    ],
                    temperature=1.0,
                )
                raw = resp.choices[0].message.content

            import re
            cleaned = re.sub(r"```(?:json)?", "", raw or "").strip()
            out = json.loads(cleaned)

            transcript = str(out.get("transcript", "")).strip()
            questions_raw = out.get("questions", [])
            title = str(out.get("title", cfg["label"])).strip()

            if len(transcript) < 100 or not isinstance(questions_raw, list) or len(questions_raw) < 3:
                continue

            questions = []
            for idx, q in enumerate(questions_raw):
                q_type = str(q.get("type", "short_answer")).strip()
                if q_type not in ("multiple_choice", "fill_blank", "short_answer"):
                    q_type = "short_answer"
                item = {
                    "id": int(q.get("id", idx + 1)),
                    "type": q_type,
                    "question": str(q.get("question", "")).strip(),
                    "answer": str(q.get("answer", "")).strip(),
                    "explanation": str(q.get("explanation", "")).strip(),
                }
                if q_type == "multiple_choice":
                    opts = q.get("options") or []
                    item["options"] = [str(o) for o in opts[:4]]
                questions.append(item)

            if not questions:
                continue

            return {"title": title, "transcript": transcript, "questions": questions}

        except Exception as e:
            logger.warning(f"Passage generation attempt {attempt + 1} failed: {e}")
            continue

    # Fallback minimal passage
    logger.error("All passage generation attempts failed — using fallback")
    return {
        "title": "Accommodation Enquiry",
        "transcript": (
            "Agent: Good morning, City Guesthouse. How can I help you? "
            "Caller: Hi, I'd like to book a room for next weekend, please. "
            "Agent: Certainly. What type of room would you like — single or double? "
            "Caller: A double room, please. For two nights, Friday and Saturday. "
            "Agent: Let me check availability… Yes, we have a double room available. "
            "The rate is eighty-five pounds per night, which includes breakfast. "
            "Caller: That sounds good. Can I pay by card? "
            "Agent: Yes, we accept all major cards. I'll need your name and a contact number. "
            "Caller: My name is James Carter, and my number is 07700 900 123. "
            "Agent: Perfect. Your booking is confirmed for Friday the 14th. "
            "Check-in is from three o'clock in the afternoon. "
            "Caller: Great. Is there parking available? "
            "Agent: Yes, free parking is available on site. "
            "Caller: Wonderful. Thank you very much. "
            "Agent: Thank you, Mr Carter. We look forward to seeing you. Goodbye. "
        ),
        "questions": [
            {"id": 1, "type": "short_answer", "question": "What type of room does the caller request?", "answer": "double room", "explanation": "The caller says 'A double room, please.'"},
            {"id": 2, "type": "short_answer", "question": "How many nights will the caller stay?", "answer": "two nights", "explanation": "The caller says 'For two nights, Friday and Saturday.'"},
            {"id": 3, "type": "short_answer", "question": "What is the nightly rate?", "answer": "eighty-five pounds", "explanation": "The agent says 'The rate is eighty-five pounds per night.'"},
            {"id": 4, "type": "multiple_choice", "question": "What is included in the room rate?", "options": ["A. Dinner", "B. Breakfast", "C. Lunch", "D. All meals"], "answer": "b. breakfast", "explanation": "The agent says 'which includes breakfast.'"},
            {"id": 5, "type": "short_answer", "question": "What is the caller's surname?", "answer": "carter", "explanation": "The caller says 'My name is James Carter.'"},
            {"id": 6, "type": "short_answer", "question": "What time is check-in?", "answer": "three o'clock", "explanation": "The agent says 'Check-in is from three o'clock in the afternoon.'"},
            {"id": 7, "type": "multiple_choice", "question": "What payment method does the caller plan to use?", "options": ["A. Cash", "B. Cheque", "C. Bank transfer", "D. Card"], "answer": "d. card", "explanation": "The caller asks 'Can I pay by card?' and the agent confirms."},
            {"id": 8, "type": "short_answer", "question": "What facility is available on site at no cost?", "answer": "parking", "explanation": "The agent says 'free parking is available on site.'"},
        ],
    }


# ── Agent class with function tools ──────────────────────────────────────────

class ListeningCoachAgent(Agent):
    """
    Stateful IELTS Listening Coach.
    The LLM calls these function tools to advance phases and publish data
    messages to the frontend sidebar.
    """

    def __init__(
        self,
        instructions: str,
        room: Any,
        passage_data: dict,
        section_key: str,
    ):
        super().__init__(instructions=instructions)
        self._room = room
        self._passage_data = passage_data
        self._section_key = section_key
        self._user_answers: dict[int, dict] = {}
        self._current_phase = "intro"

    # ── Phase tools ──────────────────────────────────────────────────────────

    @function_tool
    async def advance_to_preview(self) -> str:
        """
        Call this tool exactly once, at the end of the introduction phase,
        when you are ready to show the questions on screen and read them to the student.
        This will display all questions in the sidebar.
        """
        questions_frontend = [
            {
                "id": q["id"],
                "type": q["type"],
                "question": q["question"],
                **({"options": q["options"]} if q.get("options") else {}),
            }
            for q in self._passage_data["questions"]
        ]
        await _publish(self._room, {"type": "phase", "phase": "preview"})
        await asyncio.sleep(0.3)
        await _publish(self._room, {"type": "questions", "questions": questions_frontend})
        self._current_phase = "preview"
        logger.info("[listening-coach] → preview phase published")
        return f"Questions are now visible on the student's screen. There are {len(questions_frontend)} questions."

    @function_tool
    async def advance_to_passage(self) -> str:
        """
        Call this tool when you have finished reading the questions and the
        student has had time to review them. This signals the start of the
        audio passage phase.
        """
        await _publish(self._room, {"type": "phase", "phase": "passage"})
        self._current_phase = "passage"
        logger.info("[listening-coach] → passage phase published")
        return "Passage phase started. Now narrate the full transcript from beginning to end without stopping."

    @function_tool
    async def advance_to_qa(self) -> str:
        """
        Call this tool immediately after you have finished narrating the entire
        passage. This signals the start of the question-and-answer phase.
        """
        await _publish(self._room, {"type": "phase", "phase": "qa"})
        self._current_phase = "qa"
        logger.info("[listening-coach] → qa phase published")
        return "Q&A phase started. Now ask the questions one by one, waiting for the student's verbal answer each time."

    @function_tool
    async def highlight_question(self, question_id: int) -> str:
        """
        Call this tool before asking each question during the Q&A phase
        to highlight the question in the student's sidebar.

        Args:
            question_id: The numeric ID of the question you are about to ask (1-based)
        """
        await _publish(self._room, {"type": "highlight", "questionId": question_id})
        logger.info(f"[listening-coach] highlighted question {question_id}")
        return f"Question {question_id} is now highlighted on the student's screen."

    @function_tool
    async def record_student_answer(
        self,
        question_id: int,
        user_answer: str,
        is_correct: bool,
        correct_answer: str,
        explanation: str,
    ) -> str:
        """
        Call this tool after the student answers each question during Q&A
        to record their answer for the final feedback report.

        Args:
            question_id: The numeric ID of the question (must match the question list)
            user_answer: Exactly what the student said as their answer
            is_correct: Whether the student's answer is correct
            correct_answer: The correct answer from the passage
            explanation: Brief explanation of why, quoting the relevant passage moment
        """
        self._user_answers[question_id] = {
            "userAnswer": user_answer,
            "correct": is_correct,
            "correctAnswer": correct_answer,
            "explanation": explanation,
        }
        logger.info(f"[listening-coach] recorded answer for Q{question_id}: correct={is_correct}")
        return f"Answer recorded for question {question_id}."

    @function_tool
    async def publish_final_score(self) -> str:
        """
        Call this tool at the very start of the feedback phase, before you begin
        explaining the answers. This publishes the score to the frontend and
        triggers the feedback view.
        """
        questions = self._passage_data["questions"]
        total = len(questions)
        score = 0
        results = []

        for q in questions:
            qid = q["id"]
            recorded = self._user_answers.get(qid)
            if recorded:
                correct = recorded["correct"]
                user_answer = recorded["userAnswer"]
                correct_answer = recorded["correctAnswer"]
                explanation = recorded["explanation"]
            else:
                correct = False
                user_answer = ""
                correct_answer = q.get("answer", "")
                explanation = q.get("explanation", "")

            if correct:
                score += 1

            results.append({
                "id": qid,
                "correct": correct,
                "userAnswer": user_answer,
                "correctAnswer": correct_answer,
                "explanation": explanation,
            })

        await _publish(self._room, {"type": "phase", "phase": "feedback"})
        await asyncio.sleep(0.3)
        await _publish(self._room, {
            "type": "score",
            "score": score,
            "total": total,
            "results": results,
        })
        self._current_phase = "feedback"
        logger.info(f"[listening-coach] → feedback published score={score}/{total}")
        return f"Score published: {score}/{total}. Now explain each answer in detail."


# ── Instructions builder ──────────────────────────────────────────────────────

def _build_instructions(section_key: str, passage_data: dict) -> str:
    cfg = SECTION_CONFIGS.get(section_key, SECTION_CONFIGS["section1"])
    strategies_text = "\n".join(f"  - {s}" for s in cfg["strategies"])

    questions = passage_data["questions"]
    questions_text = "\n".join(
        f"  Q{q['id']}: [{q['type']}] {q['question']}"
        + (f"\n    Options: {', '.join(q.get('options', []))}" if q.get("options") else "")
        + f"\n    Answer: {q['answer']}"
        for q in questions
    )

    return f"""You are Mia, a warm, expert IELTS Listening coach conducting a live one-on-one session.

SECTION: {cfg['label']} — {cfg['description']}
DIFFICULTY: {cfg['difficulty']}

KEY STRATEGIES FOR THIS SECTION:
{strategies_text}

THE PASSAGE YOU WILL NARRATE (title: "{passage_data['title']}"):
---
{passage_data['transcript']}
---

THE QUESTIONS (you already know the answers — do NOT reveal them until feedback):
{questions_text}

YOUR PERSONALITY:
- Warm, encouraging — praise effort before correcting
- Precise — always quote the exact passage moment when explaining answers
- Structured — never skip a phase or jump ahead
- Natural — use contractions, vary your pace, speak conversationally

SESSION PHASES — FOLLOW THIS ORDER EXACTLY:

PHASE 1 — INTRODUCTION:
  - Greet the student warmly
  - Explain what {cfg['label']} is: {cfg['description']}
  - Teach the 3 key strategies one by one with brief examples
  - Ask if they have questions
  - Then say you're about to show the questions on screen
  - CALL TOOL: advance_to_preview()

PHASE 2 — QUESTION PREVIEW:
  - Tell the student you're showing the questions now
  - Read EVERY question aloud clearly (for MC, read all 4 options)
  - After reading all questions, give 20–30 seconds of silence for study
  - Say: "Alright, I'm going to read the passage now — listen carefully."
  - CALL TOOL: advance_to_passage()

PHASE 3 — PASSAGE NARRATION:
  - Narrate the FULL passage from beginning to end exactly as written
  - For dialogues: clearly distinguish speakers by changing your tone
  - Do NOT pause mid-passage to comment
  - After finishing: "That's the end of the passage. Now let's go through the questions."
  - CALL TOOL: advance_to_qa()

PHASE 4 — Q&A:
  For EACH question (Q1 through Q{len(questions)}):
    - CALL TOOL: highlight_question(question_id=N) BEFORE asking it
    - Ask the question clearly
    - Wait for the student's verbal answer
    - Briefly acknowledge ("Good", "Interesting", "Let's continue")
    - CALL TOOL: record_student_answer(...) to record what they said
    - Move to the next question
  After all questions: "Excellent. Let me give you the full feedback now."
  - CALL TOOL: publish_final_score()

PHASE 5 — FEEDBACK:
  - Go through EVERY question
  - Correct: confirm and quote the passage moment
  - Wrong: gently correct, quote the exact passage line, explain the strategy
  - Give improvement tips based on the mistakes
  - Close warmly: "You've done really well today — keep practising!"

CRITICAL RULES:
- ALWAYS call the phase tool before starting each phase
- NEVER reveal answers before the feedback phase
- ALWAYS call record_student_answer for every question during Q&A
- ALWAYS call publish_final_score before starting feedback
- One question at a time during Q&A — do not rush
"""


# ── Entrypoint ────────────────────────────────────────────────────────────────

async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect()

    room_name: str = getattr(ctx.room, "name", "") or ""
    room_metadata: str = getattr(ctx.room, "metadata", "") or ""

    # Detect section from room name (e.g. "listening-section2-ab12cd34")
    section_key = "section1"
    for key in SECTION_CONFIGS:
        if key in room_name.lower() or key in room_metadata.lower():
            section_key = key
            break

    logger.info(f"[listening-coach] Room={room_name} Section={section_key}")

    # Pre-generate passage + questions (blocking OpenAI call before voice starts)
    logger.info("[listening-coach] Generating passage and questions…")
    passage_data = await asyncio.get_event_loop().run_in_executor(
        None, _generate_passage_and_questions, section_key
    )
    logger.info(f"[listening-coach] Generated passage: '{passage_data['title']}' with {len(passage_data['questions'])} questions")

    instructions = _build_instructions(section_key, passage_data)
    cfg = SECTION_CONFIGS[section_key]

    # Build agent with function tools
    agent = ListeningCoachAgent(
        instructions=instructions,
        room=ctx.room,
        passage_data=passage_data,
        section_key=section_key,
    )

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="coral"),
        resume_false_interruption=False,
    )

    session_id = room_name or getattr(ctx.room, "sid", "unknown")
    user_name_cache: Optional[str] = None

    @session.on("conversation_item_added")
    def on_conversation_item_added(event: ConversationItemAddedEvent) -> None:
        nonlocal user_name_cache
        try:
            role = getattr(event.item, "role", "unknown")
            text = getattr(event.item, "text_content", "") or ""
            if not text.strip():
                return
            if user_name_cache is None:
                user_name_cache = _pick_user_name(ctx.room, AGENT_NAME)
            log_turn(
                session_id=session_id,
                role=role,
                text=text,
                user_name=user_name_cache,
                agent_name=AGENT_NAME,
            )
        except Exception:
            logger.exception("log_turn failed")

    # ANAM avatar
    anam_api_key = os.environ["ANAM_API_KEY"]
    anam_avatar_id = os.environ["ANAM_AVATAR_ID"]

    anam_avatar = anam.AvatarSession(
        persona_config=anam.PersonaConfig(
            name="avatar",
            avatarId=anam_avatar_id,
        ),
        api_key=anam_api_key,
        avatar_participant_name=AGENT_NAME,
    )

    await anam_avatar.start(session, room=ctx.room)
    await session.start(agent=agent, room=ctx.room)

    # Wait for a human participant
    await ctx.wait_for_participant()

    # Small delay for frontend to finish mounting
    await asyncio.sleep(2.0)

    # Signal frontend: intro phase starting
    await _publish(ctx.room, {"type": "phase", "phase": "intro", "section": section_key})

    # Kick off the introduction
    await session.generate_reply(
        instructions=(
            f"Begin Phase 1 — Introduction. "
            f"Greet the student warmly. "
            f"Tell them this session is for IELTS Listening {cfg['label']}: {cfg['description']}. "
            f"Teach them the 3 key strategies for this section type one by one. "
            f"Then call the advance_to_preview tool to move to the question preview phase."
        )
    )


# ── Worker ────────────────────────────────────────────────────────────────────

async def request_fnc(req: JobRequest) -> None:
    await req.accept(attributes={"agentType": "avatar"})


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            worker_type=WorkerType.ROOM,
            request_fnc=request_fnc,
            agent_name=AGENT_WORKER_NAME,
        )
    )
