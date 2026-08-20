---
seed_version: "0.1"
id: wi-owner-approved-past-expiration
title: Fixture — approved approval whose structured expiration has passed
objective: Exercise the distinction between approval status and structured expiration — approved status alone is not enough once expiration has passed.
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
pending_approval_reference: appr-owner-approved-past-expiration
current_responsibility: owner
---

## Objective

Fixture work item: `appr-owner-approved-past-expiration` has status
"approved" but a structured `expiration` in the past relative to the
evaluation clock — this must still be mechanically non-authorizing.

## Context

Exists only to be evaluated by `tests/kernel/transition/gate.test.ts`.

## Notes

None.
