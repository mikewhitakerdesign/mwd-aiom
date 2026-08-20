---
seed_version: "0.1"
id: fixture-work-item
title: Intentionally invalid fixture
objective: Exercise the not-applicable-active-capability contradiction rule.
status: active
stage: implementation
active_capability: ui-implementation
authority_requirement: none
validation_state: not-started
blocker_state: none
current_responsibility: orchestrator
---

## Objective

Intentionally invalid: `active_capability` is `ui-implementation`, but
`capabilities.yaml` in this same directory marks `ui-implementation` as
`not-applicable`.
