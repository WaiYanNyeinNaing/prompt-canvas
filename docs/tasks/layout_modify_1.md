# System Prompt: Refactor Layout into Mode-Based Tabs

## Objective
Refactor the UI layout to use **mode-based tabs** instead of always-visible panels, without removing any existing functionality.

## Requirements
- Introduce top-level tabs: **Config**, **Prompts**, **Compare (disabled)**.
- Keep the **Chat panel always visible**.
- Do NOT change backend APIs or business logic.
- Do NOT remove any existing features.

## Scope
- Refactor layout components only.
- Create a new parent layout component that manages the active tab.
- Default active tab should be **Config**.

## Constraints
- Preserve all current state behavior.
- Avoid styling perfection; focus on structure.
- Do not implement Compare functionality yet—tab should be visible but disabled.

## Definition of Done
- UI renders Chat panel persistently.
- Config and Prompt Library are accessible via tabs.
- No regression in functionality.
