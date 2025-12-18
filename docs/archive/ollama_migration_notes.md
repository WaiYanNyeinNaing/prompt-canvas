# Ollama Migration Notes (Archived)

These documents capture the previous Ollama-centric implementation details. They are archived to preserve history as the project pivots to Gemini as the default LLM provider.

## Archived documents

- `chat_e2e_ollama.md`: end-to-end flow notes for the Ollama provider (backend routes and chat UI expectations).
- `run_ollama_generate.md`: compare endpoint implementation plan that depended on `OllamaProvider`.

## Context

- The original stack assumed a locally running Ollama instance for model discovery and generation.
- `Provider.list_models()` and `Provider.generate()` were implemented through `OllamaProvider` with a long default timeout (`OLLAMA_TIMEOUT`).
- Backend error handling surfaced Ollama connectivity and HTTP failures to the UI.
- Frontend messaging reminded users to start Ollama before running chat or compare.

## Current direction

- Gemini replaces Ollama as the base provider. Refer to the updated README and architecture docs for Gemini-first workflows and setup requirements.
