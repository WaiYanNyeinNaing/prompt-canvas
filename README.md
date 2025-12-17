# prompt-canvas

A local-first playground for designing, versioning, and evaluating LLM prompt templates using **local models via Ollama**.

## What’s in this repo (so far)

- **Backend**: FastAPI API server (models + chat)
- **Frontend**: Next.js + React + TypeScript UI
- **Provider layer**: Ollama provider behind an interface

For a running status / checklist, see `docs/progress.md`.

## Quickstart (dev)

### Prereqs

- Python 3.11+
- Node.js 18+
- Ollama installed + running (`ollama serve`) and at least one model pulled (e.g. `ollama pull llama3.1`)

### Backend (FastAPI)

From repo root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install fastapi uvicorn pydantic
uvicorn backend.app.main:app --reload --port 8000
```

API endpoints:

- `GET /models`
- `POST /chat`

### Frontend (Next.js)

From repo root:

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies API calls to the backend via `frontend/next.config.js` (rewrites for `/models` and `/chat` to `http://127.0.0.1:8000`).

## Smoke test

```bash
curl http://127.0.0.1:8000/models
curl -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3.1","system_prompt":"","user_input":"Say hi in one sentence.","params":{}}'
```
