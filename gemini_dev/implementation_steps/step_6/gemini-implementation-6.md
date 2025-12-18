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

