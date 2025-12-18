# prompt-canvas

A local-first playground for designing, versioning, and evaluating LLM prompt templates using **local models via Ollama**.

## What's in this repo

- **Backend**: FastAPI API server (models, chat, prompt library)
- **Frontend**: Next.js + React + TypeScript UI with ChatGPT-style output
- **Provider layer**: Ollama provider behind an interface
- **Prompt Library**: File-based prompt template storage (Markdown + YAML frontmatter)

For a running status / checklist, see `docs/progress.md`.

## Quickstart (dev)

### Prereqs

- Python 3.9+
- Node.js 18+
- Ollama installed + running (`ollama serve`) and at least one model pulled (e.g. `ollama pull llama3`)

### Backend (FastAPI)

From repo root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install fastapi uvicorn pydantic pyyaml
uvicorn backend.app.main:app --port 8000
```

API endpoints:

- `GET /models` — list available Ollama models
- `POST /chat` — run single-turn chat
- `GET /prompts` — list prompt templates
- `GET /prompts/{id}` — get a prompt template
- `POST /prompts` — create a prompt template
- `PUT /prompts/{id}` — update a prompt template
- `DELETE /prompts/{id}` — delete a prompt template

### Frontend (Next.js)

From repo root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend calls the backend directly at `http://127.0.0.1:8000` (CORS enabled).

## Smoke test

```bash
curl http://127.0.0.1:8000/models
curl http://127.0.0.1:8000/prompts
curl -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3:latest","system_prompt":"","user_input":"Say hi.","params":{}}'
```
