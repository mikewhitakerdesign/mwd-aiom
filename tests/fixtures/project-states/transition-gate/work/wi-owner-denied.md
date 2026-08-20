---
seed_version: "0.1"
id: wi-owner-denied
title: Fixture — Owner-authorized transition with a denied approval
objective: Exercise an approval -> delivery transition blocked by a denied Owner Approval Artifact.
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
pending_approval_reference: appr-owner-denied
current_responsibility: owner
---

## Objective

Fixture work item for Transition Gate scenario D (denied): references
`appr-owner-denied` (status denied — mechanically non-authorizing).

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
