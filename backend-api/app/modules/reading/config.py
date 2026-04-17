# from __future__ import annotations

# from pathlib import Path
# import os
# from dataclasses import dataclass
# from dotenv import load_dotenv

# # Load backend-api/.env explicitly
# ENV_PATH = Path(__file__).resolve().parents[3] / ".env"
# load_dotenv(dotenv_path=ENV_PATH)


# @dataclass(frozen=True)
# class Settings:
#     # OpenAI
#     openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
#     openai_model_questions: str = os.getenv("OPENAI_READING_Q_MODEL", "gpt-4o-mini")
#     openai_model_feedback: str = os.getenv("OPENAI_READING_FB_MODEL", "gpt-4o-mini")
#     openai_model_passages: str = os.getenv("OPENAI_READING_PASSAGES_MODEL", "gpt-4o-mini")

#     # Storage
#     data_dir: str = os.getenv("READING_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))

#     # Question generation
#     questions_per_passage: int = int(os.getenv("READING_QUESTIONS_PER_PASSAGE", "13"))

#     # MySQL (inside settings ✅)
#     mysql: dict = None  # type: ignore


# settings = Settings()

# # ✅ Rebuild immutable dataclass with mysql dict
# object.__setattr__(
#     settings,
#     "mysql",
#     {
#         "host": os.getenv("MYSQL_HOST", "localhost"),
#         "port": int(os.getenv("MYSQL_PORT", "3306")),
#         "user": os.getenv("MYSQL_USER", "root"),
#         "password": os.getenv("MYSQL_PASSWORD", ""),
#         "db": os.getenv("MYSQL_DB", "ielts"),
#     },
# )

from __future__ import annotations

from pathlib import Path
import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load backend-api/.env explicitly
ENV_PATH = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=ENV_PATH)


@dataclass(frozen=True)
class Settings:
    # OpenAI
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model_questions: str = os.getenv("OPENAI_READING_Q_MODEL", "gpt-4o-mini")
    openai_model_feedback: str = os.getenv("OPENAI_READING_FB_MODEL", "gpt-4o-mini")
    openai_model_passages: str = os.getenv("OPENAI_READING_PASSAGES_MODEL", "gpt-4o-mini")

    # Storage
    data_dir: str = os.getenv(
        "READING_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data")
    )

    # Question generation (kept for compatibility)
    questions_per_passage: int = int(os.getenv("READING_QUESTIONS_PER_PASSAGE", "13"))

    # ✅ Total questions distribution across 3 passages (defaults to 40 total)
    # Example: "13,13,14" => Passage1=13, Passage2=13, Passage3=14
    reading_questions_distribution: str = os.getenv("READING_QUESTIONS_DISTRIBUTION", "13,13,14")
    questions_distribution: tuple[int, int, int] = (13, 13, 14)

    # MySQL (inside settings ✅)
    mysql: dict = None  # type: ignore


settings = Settings()

# ✅ Parse distribution string safely (defaults to 13,13,14 => total 40)
try:
    parts = [
        int(x.strip())
        for x in (settings.reading_questions_distribution or "").split(",")
        if x.strip()
    ]
    if len(parts) == 3 and all(p > 0 for p in parts):
        object.__setattr__(settings, "questions_distribution", (parts[0], parts[1], parts[2]))
except Exception:
    pass

# ✅ Rebuild immutable dataclass with mysql dict
object.__setattr__(
    settings,
    "mysql",
    {
        "host": os.getenv("MYSQL_HOST", "localhost"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", ""),
        "db": os.getenv("MYSQL_DB", "ielts"),
    },
)