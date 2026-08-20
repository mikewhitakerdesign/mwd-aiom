---
seed_version: "0.1"
id: wi-other
title: An unrelated work item, present only so appr-1's reference resolves
objective: Exists only so this fixture isolates the approval-work-item-mismatch rule.
status: active
stage: implementation
authority_requirement: none
validation_state: not-started
blocker_state: none
current_responsibility: orchestrator
---

## Objective

Unrelated work item, present only so that `appr-1.related_work_item_id`
resolves to a real Work Item — isolating this fixture to the
approval-work-item-mismatch rule rather than also tripping
broken-work-item-reference.
