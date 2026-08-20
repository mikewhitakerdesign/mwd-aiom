---
seed_version: "0.1"
id: wi-owner-expired
title: Fixture — Owner-authorized transition with an expired-status approval
objective: Exercise an approval -> delivery transition blocked by an approval whose status is expired.
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
pending_approval_reference: appr-owner-expired
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenario D (expired): references
`appr-owner-expired` (status expired — mechanically non-authorizing).

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
