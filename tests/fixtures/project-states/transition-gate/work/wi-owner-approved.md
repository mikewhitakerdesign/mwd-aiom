---
seed_version: "0.1"
id: wi-owner-approved
title: Fixture — Owner-authorized transition with an approved covering approval
objective: Exercise an approval -> delivery transition covered by an approved one-time Owner Approval Artifact.
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
pending_approval_reference: appr-owner-approved
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenario B: approval -> delivery,
covered by `appr-owner-approved` (status approved, matching action).

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
