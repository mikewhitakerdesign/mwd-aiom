---
seed_version: "0.1"
id: wi-qualitative
title: Fixture — mechanically clear except for prose approval conditions
objective: Exercise Orchestrator Scenario 6 (mechanically clear but qualitative judgment remains).
status: pending-approval
stage: approval
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: none
current_responsibility: owner
---

## Objective

`appr-covers-qualitative.yaml` is approved and structurally covers this Work Item and action, but
declares non-empty `conditions` prose the gate cannot mechanically evaluate — this must resolve to
`indeterminate` / `requires-qualitative-judgment`, distinct from the runtime-unknown scenarios,
which have no bearing on this Work Item (it names no capability).

## Context

Exists only to be evaluated by `tests/kernel/orchestration/orchestrate.test.ts`.

## Notes

None.
