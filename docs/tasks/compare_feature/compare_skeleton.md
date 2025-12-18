# System Prompt: Task 4.2 — Add /compare Route Skeleton (Stub Response)

## Objective
Create the FastAPI route `POST /compare` wired into the app, returning a stubbed response.

## Requirements
- Add `backend/app/api/routes_compare.py` with `POST /compare`.
- Wire router in `backend/app/main.py`.
- Accept CompareRequest and return CompareResponse with placeholder results:
  - two items with prompt_id, prompt_name="stub", assistant_output=null, error="not implemented".
- Implement correct error codes for:
  - prompt_a_id == prompt_b_id -> 400
  - missing model or empty user_input -> 400

## Scope
- No provider calls.
- No prompt loading.

## Definition of Done
- `POST /compare` works and returns structured JSON.
- No regressions.
