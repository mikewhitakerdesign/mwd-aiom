---
seed_version: "0.1"
id: wi-owner-superseded
title: Fixture — Owner-authorized transition with a superseded approval
objective: Exercise an approval -> delivery transition blocked by a superseded Owner Approval Artifact.
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
pending_approval_reference: appr-owner-superseded
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenario D (superseded): references
`appr-owner-superseded` (status superseded — mechanically non-authorizing).

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
