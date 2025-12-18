# System Prompt: Task 4.1 — Define Compare API Types (Backend Only)

## Objective
Define the request/response schema for A/B prompt comparison in the backend without implementing logic.

## Requirements
- In `backend/app/core/types.py`, add:
  - CompareRequest { model, prompt_a_id, prompt_b_id, user_input, params? }
  - CompareItemResult { prompt_id, prompt_name, assistant_output?, error?, latency_ms? }
  - CompareResponse { model, input, results[2] }
- Reuse existing GenerationParams type.
- Add validation-friendly defaults where appropriate.

## Scope
- Backend types only.
- No routes, no provider calls, no storage changes.

## Definition of Done
- Backend imports compile cleanly.
- No behavior changes elsewhere.
