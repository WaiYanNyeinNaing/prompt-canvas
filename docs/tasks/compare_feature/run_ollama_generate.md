# System Prompt: Task 4.4 — Execute A/B Compare via OllamaProvider.generate()

## Objective
Implement the actual A/B generation in `/compare` using OllamaProvider.

## Requirements
- For each prompt template:
  - messages = [ {role:"system", content: prompt.body_md}, {role:"user", content: user_input} ]
  - call provider.generate(model, messages, params)
  - measure latency_ms per run
- If Ollama unreachable -> return 503 (overall error).
- If one run fails but the other succeeds:
  - return 200
  - set per-item error field for the failed side only

## Scope
- No streaming.
- Sequential execution is acceptable (parallel optional).

## Definition of Done
- `/compare` returns real outputs for A and B.
- Per-item errors are handled cleanly.
