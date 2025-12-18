# Prompt-Canvas Coding Agent Instructions

## Purpose

This file defines mandatory rules for any AI coding assistant working on the Prompt-Canvas repository.
The goal is to produce clean, modular, reviewable code aligned with the project's architecture and scope.

## Project Snapshot (current)

- Local-first prompt playground using Gemini as the base provider.
- Backend: FastAPI API with provider abstraction.
- Frontend: Next.js + React + TypeScript.
- Prompt storage: Markdown files with YAML frontmatter in `prompts/`.

## Implemented Features

- API: `GET /models`, `POST /chat` (single-turn), `POST /compare` (A/B prompt compare), prompt CRUD.
- Provider: `Provider.list_models()`, `Provider.generate()` with `GeminiProvider` (API-key auth, configurable timeout).
- UI: Mode tabs (Config / Prompts / Compare), chat with Markdown rendering + clear/copy, prompt
  library CRUD + apply, compare UI with model lock, A/B selectors, run compare, and "Use This Prompt"
  promotion.

## Architecture & Constraints

- Flow: UI -> API -> Provider (no cross-layer shortcuts).
- Frontend calls backend directly at `http://127.0.0.1:8000` (CORS enabled).
- Gemini access depends on a configured API key.
- Single-turn chat only; no multi-turn history.

## Mandatory Rules

- Do not change architecture decisions documented in `docs/` or ADRs.
- Do not introduce new dependencies without explicit instruction.
- Do not collapse layers (frontend must not call Gemini directly).
- Do not implement non-MVP features unless explicitly requested.
- Prefer clarity over cleverness.

## Coding Guidelines

- Keep files small and single-responsibility.
- Use TypeScript types and Python type hints.
- No business logic in UI components.
- Provider logic lives in `backend/app/providers/`.
- Prompt persistence logic lives in `backend/app/storage/`.

## Backend Expectations

- FastAPI app must start cleanly.
- Endpoints return structured JSON.
- Handle errors explicitly.

## Frontend Expectations

- UI consumes backend APIs only.
- Keep state centralized.
- Components should be composable and testable.

## Development Style

- Implement one vertical slice at a time.
- Commit after each meaningful change.
- If unclear, add TODOs instead of guessing.

## Out of Scope

- Authentication or multi-user support
- Cloud deployment
- Advanced evaluation or analytics
- Prompt sharing or collaboration

## Definition of Done

- Code compiles and runs locally.
- Follows project structure and conventions.
- No unused files or dead code.
- Changes are minimal and intentional.
