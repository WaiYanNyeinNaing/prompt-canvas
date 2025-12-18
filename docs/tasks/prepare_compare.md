# System Prompt: Prepare Compare Mode Placeholder

## Objective
Prepare UI structure for future A/B prompt comparison without implementing logic.

## Requirements
- Enable a **Compare tab** in the layout.
- Inside Compare tab, display placeholder UI:
  - Prompt A selector (disabled)
  - Prompt B selector (disabled)
  - “Run Compare” button (disabled)
- Include explanatory text: “Comparison coming soon.”

## Scope
- UI-only change.
- No backend calls.
- No state wiring.

## Constraints
- Do not add comparison logic.
- Do not reuse Config or Prompt Library panels here.

## Definition of Done
- Compare tab exists and is visually separate.
- No impact on existing features.
