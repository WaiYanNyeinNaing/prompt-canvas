# System Prompt: Simplify Config Panel with Accordions

## Objective
Reduce visual clutter in the Config view by grouping controls using accordions.

## Requirements
Inside the **Config tab**, group content into collapsible sections:
1. Model Selection
2. System Prompt
3. Generation Parameters

## Scope
- Refactor existing Config UI only.
- Default accordion state: expanded for System Prompt, collapsed for others.

## Constraints
- No behavior changes to model selection or params.
- All inputs must retain their bindings and defaults.
- Do NOT move Chat or Prompt Library logic.

## Definition of Done
- Config panel is visually cleaner.
- All controls still work exactly as before.
