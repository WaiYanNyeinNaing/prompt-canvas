# System Prompt: Task 4.5 — Frontend Compare UI (Selectors + Run Compare + Results)

## Objective
Make the Compare tab functional: select Prompt A/B, enter input, run compare, render results side-by-side.

## Requirements
- Add API client `comparePrompts()` and TS types (CompareRequest/Response).
- In ComparePanel:
  - Model selector at top with a "Lock Model" action.
  - Prompt A/B dropdowns are disabled until a model is locked.
  - Locked model is shown as read-only (with "Unlock" to change).
  - Dropdown for Prompt A and Prompt B (from prompt library list).
  - Input box for user message.
  - "Run Compare" button calls backend.
  - Show two result cards side-by-side with loading states.
  - Show per-side error messages if present.

## Scope
- No promote-winner action yet.
- Reuse selected model and params from Config state if available, but require an explicit model lock in Compare.

## Definition of Done
- Compare tab can run A/B and display outputs.
- Loading and error states work.
- Users must lock a model before they can pick prompts to compare.
