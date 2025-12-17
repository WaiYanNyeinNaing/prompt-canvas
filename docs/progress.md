## Progress (MVP / vertical slices)

### Implemented

- **Backend API (FastAPI)**
  - `GET /models`: lists local Ollama models
  - `POST /chat`: runs a single-turn chat (system prompt + user input) and returns assistant output + latency
- **Provider abstraction**
  - `Provider.list_models()`
  - `Provider.generate(model, messages, params)`
  - **OllamaProvider** implementation with improved timeout and error surfacing
- **Frontend (Next.js + React + TS)**
  - Model picker + system prompt editor + generation params
  - Chat panel (send, transcript, loading + error states)
  - Dev proxy rewrites (`/models`, `/chat`) to the backend

### Known constraints / notes

- **Local-first**: requires Ollama running locally.
- **Single-turn chat**: current request shape supports a system prompt and one user input per request (no multi-turn history yet).
- **No persistence yet**: prompts/templates/history storage is not wired up.

### How to run (dev)

- **Backend**

```bash
uvicorn backend.app.main:app --reload --port 8000
```

- **Frontend**

```bash
cd frontend
npm install
npm run dev
```

### Quick test (API)

```bash
curl http://127.0.0.1:8000/models
curl -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3.1","system_prompt":"","user_input":"Say hi in one sentence.","params":{}}'
```

### Next (suggested)

- Multi-turn chat history in the UI + request payload
- Prompt template storage (`prompts/`), loading + editing in UI
- Run history + comparison view (side-by-side outputs)
