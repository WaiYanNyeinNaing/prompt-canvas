# Task: Implement Chat Run (Vertical Slice #2)

> **Archived (Ollama-specific):** This document captures the legacy Ollama chat flow and is preserved for historical reference only.

## Context
Project: prompt-canvas  
Frontend: React + TypeScript  
Backend: FastAPI  
Provider: OllamaProvider  
We already have: provider abstraction + ModelInfo + GET /models working.

## Objective
Implement a minimal chat flow:
1) Frontend sends system prompt + user message + params + model to backend.
2) Backend calls OllamaProvider.generate() and returns assistant response.
3) Frontend renders the assistant message in the chat UI with loading/error states.

## Backend Requirements (FastAPI)
### Types
- In `backend/app/core/types.py`, define:
  - `ChatMessage { role: "system"|"user"|"assistant", content: str }`
  - `ChatRequest { model: str, system_prompt: str, user_input: str, params: GenerationParams }`
  - `ChatResponse { assistant_output: str, model: str, latency_ms?: int }`
  - `GenerationParams { temperature?: float, top_p?: float, top_k?: int, max_tokens?: int }`
  Keep optional fields optional. Provide safe defaults.

### Provider
- In `backend/app/providers/base.py`, add:
  - `generate(model: str, messages: list[ChatMessage], params: GenerationParams) -> str`
- In `backend/app/providers/ollama.py`, implement `generate()` using Ollama local API:
  - Prefer Ollama chat endpoint (commonly `POST http://localhost:11434/api/chat`)
  - Convert system + user into the messages structure expected by Ollama.
  - Map params to Ollama options if supported (temperature, top_p, top_k, num_predict for max tokens).
  - If Ollama unreachable, raise a controlled error handled by the route.

### API Route
- Create `backend/app/api/routes_chat.py`:
  - `POST /chat` accepts ChatRequest and returns ChatResponse
  - Error handling:
    - If model missing/empty: 400
    - If Ollama unreachable: 503 with clear message
    - If Ollama returns error: 502 with message and provider error context (no stack traces)
- Wire route in `backend/app/main.py`.

## Frontend Requirements (React + TS)
### API client
- Add `sendChat(req): Promise<ChatResponse>` in `frontend/src/api/client.ts`
- Add types in `frontend/src/api/types.ts`:
  - `ChatRequest`, `ChatResponse`, `GenerationParams`

### UI
- In `ChatPanel.tsx` (or equivalent):
  - Chat transcript list
  - Input box + Send button
  - On send: append user message, show assistant loading placeholder, call backend, replace placeholder with response
  - Handle error: show a message in chat like "Error: Ollama unreachable" and keep user message

### Integration
- Use selected model from the Model dropdown.
- Use system prompt + params from the left panel.

## Constraints
- Frontend must NOT call Ollama directly.
- Keep implementation minimal (no streaming yet).
- No prompt library and no comparison in this task.

## Definition of Done
- Backend `POST /chat` returns assistant output for a given model when Ollama is running.
- Frontend can send a message and display assistant response.
- Loading and error states work.
- Basic runtime verification: one manual run + `python -m compileall backend` still passes.
