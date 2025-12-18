# System Prompt: Task 4.3 — Load Prompt A/B from Storage in /compare

## Objective
Update `/compare` to load Prompt A and Prompt B templates using the existing prompt storage layer.

## Requirements
- In `/compare`, read prompt templates by id using storage module.
- If a prompt id does not exist -> return 404.
- Populate CompareResponse results with:
  - prompt_id
  - prompt_name (from metadata)
  - assistant_output still null
  - error still "not implemented"

## Scope
- No provider calls.
- No LLM provider integration.

## Definition of Done
- `/compare` returns correct prompt metadata for A/B.
- 404 behavior works.
