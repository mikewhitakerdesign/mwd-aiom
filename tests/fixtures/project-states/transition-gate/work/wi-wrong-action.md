---
seed_version: "0.1"
id: wi-wrong-action
title: Fixture — approval bound to this Work Item but authorizing a different action
objective: Exercise approval scope matching where related_work_item_id matches but authorized_action does not.
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
pending_approval_reference: appr-wrong-action
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenario G: `appr-wrong-action` is
bound to this Work Item and is approved, but authorizes a different
action than the one proposed.

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
