---
seed_version: "0.1"
id: wi-durable-policy
title: Fixture — durable-policy approval with mechanically matchable scope
objective: Exercise durable-policy authorization where related_work_item_id and authorized_action both structurally match.
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
pending_approval_reference: appr-durable-policy
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenario I: `appr-durable-policy`
covers this Work Item's action through structurally matchable fields,
not through interpreting `scope` prose.

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
