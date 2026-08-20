---
seed_version: "0.1"
id: fixture-work-item
title: Intentionally invalid fixture
objective: Exercise the complete-item-still-blocked contradiction rule.
status: complete
stage: delivery
authority_requirement: none
validation_state: passed
blocker_state: blocked
blocker_reason: intentionally invalid — a complete item should not still be blocked
current_responsibility: orchestrator
---

## Objective

Intentionally invalid: `status` is `complete` but `blocker_state` is still
`blocked`.
