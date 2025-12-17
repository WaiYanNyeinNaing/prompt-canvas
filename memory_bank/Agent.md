# Prompt-Canvas Coding Agent Instructions
# Purpose

This file defines mandatory rules for any AI coding assistant working on the Prompt-Canvas repository.
The goal is to produce clean, modular, reviewable code aligned with the project’s architecture and scope.

# Project Context

Prompt-Canvas is a local-first web LLM playground for designing, iterating, and comparing prompt templates.

# Frontend: React + TypeScript

# Backend: FastAPI

LLM Provider: Ollama (via provider abstraction)

Prompt Storage: Markdown files with YAML frontmatter

Architecture: UI → API → Provider (no cross-layer shortcuts)

# Mandatory Rules

Do not change architecture decisions documented in /docs or ADRs.

Do not introduce new dependencies without explicit instruction.

Do not collapse layers (frontend must not call Ollama directly).

Do not implement non-MVP features unless explicitly requested.

Prefer clarity over cleverness. Readability beats brevity.

# Coding Guidelines

Keep files small and single-responsibility.

Use TypeScript types and Python type hints.

No business logic in UI components.

Provider logic lives in backend/app/providers/.

Prompt persistence logic lives in backend/app/storage/.

Prompt templates are stored as .md files with YAML frontmatter.

# Backend Expectations

FastAPI app must start cleanly.

Define provider interface (list_models(), generate()).

Implement OllamaProvider behind the interface.

Endpoints return structured JSON responses.

Handle errors explicitly.

# Frontend Expectations

UI consumes backend APIs only.

No hard-coded provider logic.

Keep state centralized.

Components should be composable and testable.

Development Style

Implement one vertical slice at a time.

Commit after each meaningful change.

If unclear, add TODOs instead of guessing.

# Out of Scope

Authentication or multi-user support

Cloud deployment

Advanced evaluation or analytics

Prompt sharing or collaboration

Definition of Done

Code compiles and runs locally

Follows project structure and conventions

No unused files or dead code

Changes are minimal and intentional