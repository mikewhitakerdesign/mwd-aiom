---
seed_version: "0.1"
id: wi-validation-incomplete
title: Fixture — validation not yet passed
objective: Exercise the deterministic validation-state prerequisite on the validation -> approval transition.
status: active
stage: validation
completed_stages:
  - research
  - implementation
authority_requirement: none
validation_state: in-progress
blocker_state: none
current_responsibility: specialist-capability
---

## Objective

Fixture work item for the validation-prerequisite structural test:
`validation_state` is "in-progress", not "passed", so validation ->
approval must be mechanically blocked regardless of authorization.

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
