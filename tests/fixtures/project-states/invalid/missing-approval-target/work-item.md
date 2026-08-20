---
seed_version: "0.1"
id: fixture-work-item
title: Intentionally invalid fixture
objective: Exercise the broken-approval-reference rule.
status: pending-approval
stage: approval
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: blocked
blocker_reason: waiting on an approval artifact that does not exist in this fixture
pending_approval_reference: nonexistent-approval
current_responsibility: owner
---

## Objective

Intentionally invalid: `pending_approval_reference` points to
`nonexistent-approval`, and no approval artifact with that id exists in
this directory.
