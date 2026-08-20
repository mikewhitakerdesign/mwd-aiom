---
seed_version: "0.1"
id: wi-external-no-approval
title: Fixture — activated capability with no applicable approval at all
objective: Prove activation is not authorization — the capability is required/active, but no Owner Approval Artifact references this Work Item.
status: pending-approval
stage: approval
completed_stages:
  - research
  - implementation
  - validation
active_capability: external-action-execution
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: none
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenarios E/F: `active_capability`
is `external-action-execution`, activation status `required` — the
capability check must pass — but no approval exists for this Work Item,
so the authority-boundary check must still block the transition.

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
