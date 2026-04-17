# Unified FastAPI Backend (Phase 2)

This service unifies:
- Reading backend (`/reading/*`)
- Writing backend (`/writing/*`)
- LiveKit token minting (`/getToken`)

Auth is now included here (`/api/auth/*`). The old Node auth backend (`/backend`) is no longer required.

## Run

```bash
cd backend-api
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# copy env
cp .env.example .env

# start
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8003} --reload
```

## Endpoints

- `GET /health` (ok)
- Auth:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (Bearer token)
- Reading:
  - `POST /reading/generate-test`
  - `POST /reading/generate-questions`
  - `POST /reading/submit`
  - `GET /reading/results/{userId}/latest`
  - `POST /reading/feedback`
- Writing:
  - `GET /writing/question?taskType=task1|task2`
  - `POST /writing/score`
- LiveKit:
  - `GET /getToken?identity=...&name=...&room=...`

