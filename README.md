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
- `POST /compare` — run a two-prompt comparison (Prompt A vs Prompt B) on the same input
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

## UI notes

- **Chat is always visible** on the right.
- The left side uses **mode tabs**:
  - **Config**: model picker, system prompt, generation params
  - **Prompts**: prompt library (browse/search/create/edit/apply)
- **Compare**: run Prompt A vs Prompt B side-by-side, then **promote** the winner to the System Prompt
- Chat header shows the **active prompt label** (selected prompt name or “Custom Prompt”) and a **Clear** action.

## Smoke test

```bash
curl http://127.0.0.1:8000/models
curl http://127.0.0.1:8000/prompts
curl -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3:latest","system_prompt":"","user_input":"Say hi.","params":{}}'
```
