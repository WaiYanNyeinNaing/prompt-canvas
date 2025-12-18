# System Prompt: Split Prompt Library into Browse and Edit Modes

## Objective
Refactor Prompt Library to separate **browsing** from **editing**.

## Requirements
- Default view: search + list of prompt templates.
- Selecting a prompt opens a **preview-only** view.
- Editing/creating a prompt opens a **modal or drawer**.

## Scope
- UI refactor only.
- Backend API usage must remain unchanged.
- Editing UI should include existing fields and markdown editor.

## Constraints
- No loss of CRUD functionality.
- No new prompt schema.
- Keep UX intentional: browsing should be fast, editing explicit.

## Definition of Done
- Prompt list is clean and uncluttered.
- Editor is no longer always visible.
- Apply-to-System-Prompt still works.
