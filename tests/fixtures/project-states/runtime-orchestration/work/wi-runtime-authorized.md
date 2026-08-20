---
seed_version: "0.1"
id: wi-runtime-authorized
title: Fixture — Owner-approved transition whose active capability records a runtime requirement
objective: Exercise Orchestrator Scenarios 3-5 (valid + approved, varying only Runtime Evidence).
status: pending-approval
stage: approval
authority_requirement: owner-authorization-required
active_capability: external-action-execution
validation_state: passed
blocker_state: none
current_responsibility: owner
---

## Objective

Owner authorization is already satisfied by `appr-covers-runtime.yaml`. The only variable across
the three scenarios that use this Work Item is the Runtime Evidence map the caller supplies to
`orchestrate()` for the `network-access` requirement recorded on the `external-action-execution`
capability in `capabilities.yaml` — available, unavailable, and unknown/absent.

## Context

Exists only to be evaluated by `tests/kernel/orchestration/orchestrate.test.ts`.

## Notes

None.
