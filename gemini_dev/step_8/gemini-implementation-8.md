### 4) Wire Routes to Gemini
- Replace `OllamaProvider` usage in:
  - `backend/app/api/routes_models.py`
  - `backend/app/api/routes_chat.py`
  - `backend/app/api/routes_compare.py`
- Keep response schemas unchanged (`ModelInfo`, `ChatResponse`, `CompareResponse`).
- Optionally validate the requested model is one of the configured Gemini models and return 400 if unknown.

