# System Prompt: Add "Clear Chat" Feature (UI-only)

## Objective
Add a **Clear Chat** action so users can reset the chat transcript when it grows large, without affecting prompts, model selection, or generation parameters.

## Requirements
- Add a "Clear" button in the Chat panel header (or near the input).
- When clicked:
  - Clear the chat transcript UI (all user/assistant messages).
  - Reset any loading state.
  - Keep **model selection**, **system prompt**, and **generation params** unchanged.
- Add a lightweight confirmation to prevent accidental clicks:
  - Either a confirm dialog, or a two-click pattern ("Clear" → "Confirm").

## Scope
- Frontend only.
- No backend changes.
- No new dependencies.

## Constraints
- Do not modify provider logic, API routes, or storage.
- Do not change how chat messages are sent or rendered, except for clearing state.
- Ensure the UI remains responsive after clearing.

## Definition of Done
- Users can clear the chat at any time.
- No regression in sending messages afterward.
- Config and prompt library state is preserved.
