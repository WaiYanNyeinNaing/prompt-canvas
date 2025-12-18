## Progress (MVP / vertical slices)

### Implemented

- **Backend API (FastAPI)**
  - `GET /models`: lists configured Gemini models
  - `POST /chat`: runs a single-turn chat (system prompt + user input) and returns assistant output + latency
  - `POST /compare`: compares two prompt templates side-by-side on the same input
  - `GET /prompts`: lists prompt templates
  - `GET /prompts/{id}`: fetches a single prompt template
  - `POST /prompts`: creates a new prompt template
  - `PUT /prompts/{id}`: updates an existing prompt template
  - `DELETE /prompts/{id}`: deletes a prompt template
  - CORS enabled for direct frontend calls (avoids proxy timeout issues)

- **Provider abstraction**
  - `Provider.list_models()`
  - `Provider.generate(model, messages, params)`
  - **GeminiProvider** implementation (Google GenAI SDK)
  - Configuration: `GEMINI_API_KEY` required, `GEMINI_MODELS` optional (comma-separated)

- **Prompt Library (file-based)**
  - Stored in `prompts/` as Markdown with YAML frontmatter
  - CRUD operations via API
  - Search by name/tags

- **Frontend (Next.js + React + TS)**
  - Model picker + system prompt editor + generation params
  - Chat panel with ChatGPT-style markdown rendering
  - Chat header actions: clear transcript + copy messages
  - Active prompt indicator (shows selected prompt name / “Custom Prompt”)
  - Prompt Library panel (list, search, create, edit, delete, apply to chat)
  - Compare tab: select Prompt A/B + input, run compare, and promote winner to Config
  - Mode tabs layout: **Config** / **Prompts** / **Compare** with chat always visible (compare hides chat to focus)
  - Uses webpack dev mode for stable long-running requests

### Known constraints / notes

- **Cloud LLM dependency**: requires Gemini API access + `GEMINI_API_KEY`
- **Single-turn chat**: no multi-turn history yet (each request is independent)
- **Direct backend calls**: frontend calls `http://127.0.0.1:8000` directly to avoid Next.js proxy timeout on long LLM requests

### How to run (dev)

- **Backend** (without autoreload for stability)

```bash
uvicorn backend.app.main:app --port 8000

# For long prompts, you may need to increase client timeouts on the frontend / network.
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
curl http://127.0.0.1:8000/prompts
curl -X POST http://127.0.0.1:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"gemini-3-flash-preview","system_prompt":"","user_input":"Say hi.","params":{}}'
```

### Next (suggested)

- Multi-turn chat history in the UI + request payload
- Run history + comparison view (side-by-side outputs)
- Prompt versioning
