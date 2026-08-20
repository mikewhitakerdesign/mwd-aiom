---
seed_version: "0.1"
id: wi-no-approval
title: Fixture — Owner authorization required, no covering approval
objective: Exercise Orchestrator Scenario 2 (valid state, approval required but missing).
status: pending-approval
stage: approval
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: none
current_responsibility: owner
---

## Objective

No Owner Approval Artifact in this project state references this Work Item — the Transition
Gate must report `no-covering-approval-found`, and the Orchestrator must classify this as
`awaiting-owner-authorization`, not a generic block.

## Context

Exists only to be evaluated by `tests/kernel/orchestration/orchestrate.test.ts`.

## Notes

None.
