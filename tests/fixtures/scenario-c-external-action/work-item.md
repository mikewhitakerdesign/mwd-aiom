---
seed_version: "0.1"
id: first-release-post
title: Publish the first automated release announcement
objective: Publish the drafted release announcement to the public blog.
status: pending-approval
stage: approval
completed_stages:
  - research
  - implementation
active_capability: external-action-execution
bundle_references:
  - external-action-integration
  - content-publication
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: blocked
blocker_reason: waiting on Owner decision for approval appr-release-post
pending_approval_reference: appr-release-post
next_permitted_transition: publish once appr-release-post is approved
current_responsibility: owner
created_at: "2026-08-05T10:30:00Z"
updated_at: "2026-08-19T14:00:00Z"
---

## Objective

Publish the drafted release announcement to the public blog.

## Context

The announcement copy is drafted and validated; the only remaining step is
Owner authorization to actually publish it externally. Being activated
(`external-action-execution: required`) does not itself authorize this
specific publication — see `appr-release-post`.

## Notes

None yet.
