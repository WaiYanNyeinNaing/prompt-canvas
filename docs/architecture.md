
# Prompt-Canvas | Architecture

## Overview

Prompt-Canvas is a **local-first web application** for designing, iterating, and comparing LLM prompt templates. The system follows a clear **layered architecture** to ensure separation of concerns, maintainability, and future extensibility. All LLM execution is performed locally via Ollama, abstracted behind a provider interface.

**High-level flow:**
**Frontend (React)** → **Backend API (FastAPI)** → **LLM Provider (Ollama)** → **Local Storage (Markdown)**

---

## Architectural Principles

* **Clear layer boundaries:** UI, API, provider, and storage are strictly separated.
* **Local-first execution:** No cloud dependency in MVP.
* **Provider abstraction:** LLM backends are swappable without UI changes.
* **Human-readable storage:** Prompt templates are editable outside the app.
* **Minimal surface area:** Avoid unnecessary complexity in MVP.

---

## Repository Structure

```
prompt-canvas/
  frontend/        # React + TypeScript web UI
  backend/         # FastAPI application
  prompts/         # Prompt templates (Markdown + YAML frontmatter)
  docs/            # Architecture, decisions, and project documentation
```

### Folder Responsibilities

* **frontend/**

  * UI components, layout, and client-side state
  * Calls backend APIs only
  * Contains no LLM or provider logic
  * Uses a mode-based layout (Config/Prompts tabs) with chat always visible

* **backend/**

  * FastAPI app and API routes
  * Core domain types (prompts, runs, comparisons)
  * Provider abstraction and implementations
  * Storage adapters for prompt templates

* **prompts/**

  * `.md` files representing prompt templates
  * YAML frontmatter stores metadata (name, tags, defaults)
  * Treated as the source of truth for prompt content

* **docs/**

  * Architecture documentation
  * Technical decisions (ADR)
  * Requirements and backlog references

---

## Core Components

* **Provider Interface**

  * Methods: `list_models()`, `generate()`
  * Initial implementation: `OllamaProvider`
* **Storage Layer**

  * File-system based prompt storage
  * Reads/writes Markdown with YAML frontmatter
* **Comparison Engine**

  * Executes identical inputs against multiple prompt templates
  * Returns structured results for side-by-side UI rendering

---

## Extension Points

* Additional LLM providers (OpenAI, Gemini)
* Alternative storage (SQLite for indexing/history)
* Advanced comparison and evaluation features

---

## Constraints

* Frontend must not call Ollama directly
* No cross-layer imports
* No new top-level directories without updating this document

---

This document is the **authoritative reference** for repository structure and architectural boundaries. Any deviation must be intentional and documented.
