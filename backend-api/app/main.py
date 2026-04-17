import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.modules.auth.router import router as auth_router
from app.modules.reading.router import router as reading_router
from app.modules.writing.router import router as writing_router
from app.modules.listening.router import router as listening_router


def _cors_origins():
    raw = os.getenv("CORS_ORIGINS")
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(title="IELTS AI Tutor - Unified API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: both routers expose /health. That's ok (same payload).
app.include_router(reading_router)
app.include_router(writing_router)
app.include_router(listening_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {"ok": True, "service": "ielts-ai-tutor-unified-api"}
