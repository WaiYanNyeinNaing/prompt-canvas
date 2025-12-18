## Implementation Plan

### 1) Provider Strategy and Configuration
- Create a `GeminiProvider` implementing `Provider` in `backend/app/providers/`.
- Read `GEMINI_API_KEY` from the environment to initialize `genai.Client`.
- Decide model list strategy for `/models`:
  - Preferred: `GEMINI_MODELS` (comma-separated) with a default like `gemini-3-flash-preview`.
  - Alternative: call `client.models.list()` and filter Gemini-3 text-capable models.
- Optional: add `GEMINI_TIMEOUT` to cap request duration if the SDK allows timeout configuration.

