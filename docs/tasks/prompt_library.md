✅ Task 3: Prompt Library (Markdown + YAML frontmatter)

This is the next real feature. And it sets you up for A/B comparison.

What we build in Task 3 (MVP)

Store prompts as .md files under prompts/

YAML frontmatter metadata: id, name, tags, model_defaults, timestamps

Backend endpoints:

GET /prompts (list + search query)

GET /prompts/{id} (read)

POST /prompts (create)

PUT /prompts/{id} (update)

DELETE /prompts/{id}

Frontend Prompt Library panel:

list + search

open/edit prompt

“Apply to System Prompt” button

No versioning, no sharing, no database. Just clean file-backed CRUD.

Coding-agent prompt for Task 3 (Markdown)
# Task 3: Implement Prompt Library (Markdown + YAML frontmatter)

## Objective
Add a prompt library that stores prompt templates as Markdown files with YAML frontmatter.
Provide CRUD + search via FastAPI and a simple UI panel to browse/apply templates.

## Storage Format
Each template is a `.md` file with YAML frontmatter:

---
id: customer_support_v1
name: Customer Support Assistant
tags: [support, tone]
model_defaults:
  temperature: 0.3
  top_p: 0.9
  top_k: 40
  max_tokens: 256
updated_at: 2025-12-17
---

<markdown body is the system prompt>

## Backend (FastAPI)
### Storage module
- Implement `backend/app/storage/prompts_fs.py`:
  - `list_prompts(query: str|None) -> list[PromptMeta]`
  - `get_prompt(id: str) -> PromptTemplate`
  - `create_prompt(template: PromptTemplate) -> PromptTemplate`
  - `update_prompt(id: str, template: PromptTemplate) -> PromptTemplate`
  - `delete_prompt(id: str) -> None`
- Store files in repo `/prompts/` (or configurable path via env).
- Parse YAML frontmatter + markdown body.
- Enforce unique `id`. Validate safe filename generation.

### Types
- Add types in `backend/app/core/types.py`:
  - `PromptMeta { id, name, tags, updated_at }`
  - `PromptTemplate { id, name, tags, model_defaults, body_md, updated_at }`

### API Routes
- Add `backend/app/api/routes_prompts.py`:
  - `GET /prompts?query=` -> `{ prompts: PromptMeta[] }`
  - `GET /prompts/{id}` -> `{ prompt: PromptTemplate }`
  - `POST /prompts` -> create
  - `PUT /prompts/{id}` -> update
  - `DELETE /prompts/{id}` -> delete
- Error handling:
  - 404 if not found
  - 409 if id exists on create
  - 400 on invalid YAML/frontmatter

## Frontend (React + TS)
### API client
- Add functions in `frontend/src/api/client.ts`:
  - `listPrompts(query?: string)`
  - `getPrompt(id)`
  - `createPrompt(payload)`
  - `updatePrompt(id, payload)`
  - `deletePrompt(id)`
- Add TS types: PromptMeta, PromptTemplate

### UI
- Implement `PromptLibraryPanel.tsx`:
  - Search box + list results
  - Select prompt to view/edit (name, tags, markdown body)
  - Button: "Apply to System Prompt" (sets left panel system prompt text area to prompt.body_md)
  - Basic create/update/delete actions (MVP UI is fine)

## Constraints
- No database.
- Keep file I/O isolated to storage module.
- No versioning or sharing features in this task.

## Definition of Done
- Prompts can be created, listed, searched, edited, deleted.
- Prompts persist as `.md` files with YAML frontmatter.
- UI can apply a saved prompt into the system prompt field.