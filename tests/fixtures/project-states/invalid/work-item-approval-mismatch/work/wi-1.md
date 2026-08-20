---
seed_version: "0.1"
id: wi-1
title: Work item awaiting an approval that targets a different item
objective: Exercise the approval-work-item-mismatch rule.
status: pending-approval
stage: approval
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: blocked
blocker_reason: waiting on an approval that (intentionally) targets a different work item
pending_approval_reference: appr-1
current_responsibility: owner
---

## Objective

Intentionally invalid: `pending_approval_reference` is `appr-1`, but
`appr-1.related_work_item_id` names `wi-other`, not `wi-1`.
