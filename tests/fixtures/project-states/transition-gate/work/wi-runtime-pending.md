---
seed_version: "0.1"
id: wi-runtime-pending
title: Fixture — capability with a runtime requirement but no probe evidence
objective: Exercise the indeterminate outcome when a required capability records a runtime requirement that no Runtime Probe evidence exists to confirm.
status: active
stage: research
authority_requirement: none
validation_state: not-started
blocker_state: none
current_responsibility: orchestrator
---

## Objective

Fixture work item for Transition Gate scenario K: authority_requirement
is "none" so only the runtime-prerequisite check is exercised. The
proposed transition names `persistent-continuation` (status required,
with a `runtime_requirement_reference`) as the capability.

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.
Initiative 7 (Runtime Probe) has not been implemented — this must never
be assumed available.

## Notes

None.
