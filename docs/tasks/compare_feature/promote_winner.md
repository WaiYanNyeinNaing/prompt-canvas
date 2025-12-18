# System Prompt: Task 4.6 — Promote Winner (Apply A or B to Active System Prompt)

## Objective
Add "Use Prompt A" / "Use Prompt B" actions after comparison.

## Requirements
- Add buttons on each result card:
  - "Use This Prompt"
- When clicked:
  - Set active system prompt text to that prompt template body.
  - If prompt has model_defaults, optionally apply to generation params (only if present).
  - Update the active prompt indicator to the chosen prompt name.
- Do NOT modify chat transcript.

## Scope
- Frontend only.
- No new backend endpoints.

## Definition of Done
- User can promote A or B and immediately chat using the chosen prompt.
