# System Prompt: Improve Compare Tab Layout for Wide Side-by-Side Results

## Objective
Refactor the Compare tab layout to make A/B outputs wide and easy to compare.

## Requirements
- In Compare tab, remove or hide the right-side Chat panel area.
- Build a full-width Compare page:
  1) Top "Compare Controls" section (full width):
     - Model selector with "Lock Model" action (comes before prompt selection)
     - Prompt A dropdown
     - Prompt B dropdown
     - Selected model displayed read-only while locked (with "Unlock" to change)
     - "Run Compare" button
     - Add "Swap A/B" button (optional but recommended)
     - User input textarea (full width)
  2) Results section (full width):
     - Two equal-width columns (Prompt A result, Prompt B result)
     - Each column has:
       - title (prompt name + id)
       - output area with independent vertical scrolling
       - "Use This Prompt" button
- Outputs should be significantly larger than current boxes.
- Keep all existing compare functionality working.
- Disable prompt selectors until a model is locked.

## Navigation / Linking
- When user clicks "Use This Prompt" in Compare:
  - Apply that prompt to the active System Prompt (and defaults if present)
  - Switch UI to the primary chat workflow tab (Config or Prompts, whichever contains system prompt/chat context)
  - Show a small confirmation message (toast or inline text)

## Constraints
- No backend changes.
- No new dependencies.
- Do not change compare API contract or prompt storage.

## Definition of Done
- Compare results are wide and easy to read side-by-side.
- User input + controls feel clean and not cramped.
- "Use This Prompt" updates active prompt and brings user back to chat workflow context.
- Users must lock a model before choosing prompts to compare.
