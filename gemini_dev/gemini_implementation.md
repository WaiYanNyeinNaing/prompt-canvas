# Gemini-3 Backend Integration Plan (No UI Changes)

## Objective
Replace Ollama with the Gemini-3 model series as the backend AI engine while keeping the existing API surface and frontend behavior intact.

## Scope
- Backend-only changes: provider implementation, API wiring, and configuration.
- Use Gemini 3 via the Google GenAI SDK as outlined in `gemini_dev/gemini_documentation.md`.
- Preserve current request/response schemas for `/models`, `/chat`, and `/compare`.

## Constraints
- No UI or frontend modifications.
- Only minor backend adjustments (API calls, model switching, config).
- No new cross-layer shortcuts; keep the provider abstraction in place.

## Assumptions
- A Gemini API key will be provided via environment variables.
- Text-only models are required (no image generation).
- The UI selects models exclusively from `/models`.

## Implementation Plan

### 1) Provider Strategy and Configuration
- Create a `GeminiProvider` implementing `Provider` in `backend/app/providers/`.
- Read `GEMINI_API_KEY` from the environment to initialize `genai.Client`.
- Decide model list strategy for `/models`:
  - Preferred: `GEMINI_MODELS` (comma-separated) with a default like `gemini-3-flash-preview`.
  - Alternative: call `client.models.list()` and filter Gemini-3 text-capable models.
- Optional: add `GEMINI_TIMEOUT` to cap request duration if the SDK allows timeout configuration.

### 2) Generation Request Mapping
- Map `GenerationParams` to Gemini config:
  - `temperature` -> `temperature`
  - `top_p` -> `top_p`
  - `top_k` -> `top_k`
  - `max_tokens` -> `max_output_tokens`
- Translate messages:
  - `system` prompt -> `system_instruction`
  - `user` input -> `contents` text
- Use `client.models.generate_content(model=..., contents=..., config=...)` as shown in the Gemini docs.
- Validate output is non-empty; raise `ProviderError` on empty responses.

### 3) Error Handling and Status Mapping
- Map Gemini connectivity/timeouts to `ProviderUnavailableError` (HTTP 503).
- Map validation/auth/quota errors to `ProviderError` (HTTP 502).
- Update error messages in `/chat`, `/compare`, `/models` to mention Gemini rather than Ollama.

### 4) Wire Routes to Gemini
- Replace `OllamaProvider` usage in:
  - `backend/app/api/routes_models.py`
  - `backend/app/api/routes_chat.py`
  - `backend/app/api/routes_compare.py`
- Keep response schemas unchanged (`ModelInfo`, `ChatResponse`, `CompareResponse`).
- Optionally validate the requested model is one of the configured Gemini models and return 400 if unknown.

### 5) Dependencies and Documentation
- Add `google-genai` to `requirements.txt`.
- Update backend setup docs (`README.md`, `docs/architecture.md`) to reflect:
  - Gemini API key requirement
  - Model list configuration
  - Cloud dependency (no longer local-only)

## Verification Plan (Manual)
- `GET /models` returns configured Gemini models.
- `POST /chat` works with a system prompt + user input and returns text.
- `POST /compare` returns two results; handles partial failures cleanly.
- Error cases return clear messages if the API key is missing or the Gemini API is unreachable.

## Risks and Mitigations
- Missing/invalid API key: fail early with a clear 4xx/5xx message.
- Model name mismatch: restrict requests to configured model list.
- Latency or quota issues: surface a descriptive error and keep retries minimal.

## Out of Scope
- Frontend changes.
- Streaming responses or multi-turn chat history.
- RAG, tool calling, or image generation.
