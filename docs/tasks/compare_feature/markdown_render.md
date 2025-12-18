# System Prompt: Reuse Chat Markdown Renderer in Compare Results

## Objective
Make Compare tab outputs render markdown identically to the Chat UI.
Do this by reusing the existing Chat message rendering component (or extracting it into a shared component), not by duplicating logic.

## Requirements
- Identify the component used in the Prompt tab Chat UI to render assistant messages (markdown formatting).
- Extract it into a shared component if needed, e.g.:
  - `frontend/src/app/chat/MessageRenderer.tsx`
  - or `frontend/src/app/shared/MarkdownMessage.tsx`
- Update Compare results cards to render outputs using this shared renderer.
- Ensure formatting matches Chat UI behavior:
  - Bold/italic
  - Lists
  - Code blocks
  - Line breaks and paragraphs

## Constraints
- Do NOT introduce duplicate markdown logic in ComparePanel.
- Do NOT allow raw HTML rendering unless it is explicitly sanitized.
- Avoid new dependencies unless the Chat UI already uses one.
- Keep the compare layout unchanged.

## Implementation Notes
- If Chat currently renders markdown by manual string formatting, replace it with a proper markdown renderer used in both places.
- If Chat already uses a markdown library/component, reuse that exact configuration in Compare.

## Definition of Done
- Compare outputs display markdown the same way as Chat messages.
- No raw `**` or markdown tokens appear in rendered output.
- Chat rendering remains unchanged (no regressions).
