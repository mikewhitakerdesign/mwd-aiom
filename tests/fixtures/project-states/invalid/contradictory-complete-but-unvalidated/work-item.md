---
seed_version: "0.1"
id: fixture-work-item
title: Intentionally invalid fixture
objective: Exercise the complete-item-validation-not-passed contradiction rule.
status: complete
stage: delivery
authority_requirement: none
validation_state: failed
blocker_state: none
current_responsibility: orchestrator
---

## Objective

Intentionally invalid: `status` is `complete` but `validation_state` is
`failed`, not `passed`.
