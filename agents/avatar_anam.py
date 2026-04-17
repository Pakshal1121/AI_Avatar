import logging
import os
import json
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobRequest,
    WorkerOptions,
    WorkerType,
    cli,
    ConversationItemAddedEvent,
)
from livekit.plugins import anam, openai

from log import log_turn  # ✅ must match the updated log_turn signature

logger = logging.getLogger("anam-avatar-example")
logger.setLevel(logging.INFO)

load_dotenv()

AGENT_NAME = "Mia"  # ✅ keep consistent with avatar_participant_name


def pick_user_name(room, agent_name: str) -> str:
    """
    Picks the human user's display name from the room.
    Since your frontend passes participantName=full_name, this will be the user's name.
    """
    try:
        # Remote participants are everyone except the local participant (the agent).
        for _, p in (room.remote_participants or {}).items():
            name = getattr(p, "name", None) or getattr(p, "identity", None)
            if not name:
                continue

            # Skip if it matches the agent/avatar name
            if str(name).strip().lower() == agent_name.strip().lower():
                continue

            return str(name)
    except Exception:
        pass

    return "User"


async def entrypoint(ctx: JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="coral"),
        resume_false_interruption=False,
    )

    # ✅ stable session id for logs + DB
    session_id = (
        getattr(ctx.room, "name", None)
        or getattr(ctx.room, "sid", None)
        or "unknown_session"
    )

    # ✅ cache user name once we can detect it
    user_name_cache = None

    # ✅ ADDED: Read dispatch metadata (sent from frontend via /api/livekit/request-agent)
    meta = {}
    try:
        job = getattr(ctx, "job", None)
        md = getattr(job, "metadata", None) if job else None
        if md:
            meta = json.loads(md)
    except Exception:
        meta = {}

    writing_feedback = meta.get("writingFeedback")

    # ✅ log EVERYTHING (user + agent) whenever a message is committed to history
    @session.on("conversation_item_added")
    def on_conversation_item_added(event: ConversationItemAddedEvent):
        nonlocal user_name_cache
        try:
            role = getattr(event.item, "role", "unknown")
            text = getattr(event.item, "text_content", "") or ""

            if not text.strip():
                return

            # Resolve the user's name once (from room participants)
            if user_name_cache is None:
                user_name_cache = pick_user_name(ctx.room, AGENT_NAME)

            # ✅ IMPORTANT: send user_name + agent_name so DB can store "Divya -> Mia" etc.
            log_turn(
                session_id=session_id,
                role=role,
                text=text,
                user_name=user_name_cache,
                agent_name=AGENT_NAME,
            )

        except Exception:
            # never break your agent because of logging
            logger.exception("Failed to write conversation log")

    # --- Avatar config ---
    anam_api_key = os.getenv("ANAM_API_KEY")
    if not anam_api_key:
        raise ValueError("ANAM_API_KEY is not set")

    anam_avatar_id = os.getenv("ANAM_AVATAR_ID")
    if not anam_avatar_id:
        raise ValueError("ANAM_AVATAR_ID is not set")

    anam_avatar = anam.AvatarSession(
        persona_config=anam.PersonaConfig(
            name="avatar",
            avatarId=anam_avatar_id,
        ),
        api_key=anam_api_key,
        avatar_participant_name=AGENT_NAME,  # ✅ "Mia"
    )

    # Start avatar first (joins room)
    await anam_avatar.start(session, room=ctx.room)

    # ✅ ADDED: Build instructions based on real writing scoring context (if provided)
    instructions = (
        "Your name is Mia. You are a friendly and helpful assistant. "
        "Keep your responses short and concise in English."
    )

    if writing_feedback and isinstance(writing_feedback, dict):
        ev = writing_feedback.get("evaluation") or {}
        task_type = writing_feedback.get("taskType")
        question = writing_feedback.get("question")
        criteria = ev.get("criteria") or []
        overall = ev.get("overallScore")
        examiner_comments = ev.get("examinerComments") or []

        scoring_context = {
            "taskType": task_type,
            "overallScore": overall,
            "criteria": criteria,
            "examinerComments": examiner_comments,
            "question": question,
        }

        instructions = (
            "Your name is Mia. You are an IELTS Writing examiner. "
            "You MUST base your feedback ONLY on this scoring result:\n"
            f"{json.dumps(scoring_context, ensure_ascii=False)}\n\n"
            "Give: (1) quick band summary, (2) 2-3 strengths, (3) 2-3 improvements, "
            "(4) 3 concrete rewrite tips. Do NOT invent scores."
        )

    # Start agent (joins room and waits for avatar)
    await session.start(
        agent=Agent(
            instructions=instructions
        ),
        room=ctx.room,
    )

    # Optional greeting
    await session.generate_reply(instructions="say hello to the user in English")


async def request_fnc(req: JobRequest):
    await req.accept(
        attributes={"agentType": "avatar"},
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            worker_type=WorkerType.ROOM,
            request_fnc=request_fnc,
            agent_name="livekit-agent",  # used to request the agent
        )
    )