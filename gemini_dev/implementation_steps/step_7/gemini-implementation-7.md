### 3) Error Handling and Status Mapping
- Map Gemini connectivity/timeouts to `ProviderUnavailableError` (HTTP 503).
- Map validation/auth/quota errors to `ProviderError` (HTTP 502).
- Update error messages in `/chat`, `/compare`, `/models` to mention Gemini rather than Ollama.

