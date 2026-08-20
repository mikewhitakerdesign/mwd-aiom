---
seed_version: "0.1"
project:
  name: Release Announcement Automation
  intent: Automatically draft and publish release announcements to the public blog.
owner:
  identity: Sam (Growth Lead)
existing_state_assessment:
  performed: true
  performed_at: "2026-08-05T10:00:00Z"
lifecycle_position: active-development
signals:
  repository_backed:
    value: "true"
    provenance: directly-inspected
  software_producing:
    value: "true"
    provenance: directly-inspected
  ui_bearing:
    value: "false"
    provenance: owner-confirmed
  externally_acting:
    value: "true"
    provenance: owner-confirmed
    rationale: publishes to the public blog, a system beyond this project's boundary
  persistent_state_dependent:
    value: "false"
    provenance: ai-inferred
  data_sensitive:
    value: "false"
    provenance: owner-confirmed
  regulated_high_risk_possible:
    value: "false"
    provenance: owner-confirmed
  long_running_continuous:
    value: "false"
    provenance: owner-confirmed
  content_heavy_narrative_heavy:
    value: "true"
    provenance: owner-confirmed
    rationale: the output is announcement copy
consequence_confirmations:
  consequential_external_action:
    value: "yes"
    provenance: owner-confirmed
  sensitive_or_high_consequence_data:
    value: "no"
    provenance: owner-confirmed
bootstrap:
  ready: false
  unresolved_items:
    - Owner approval for the first external publication is still pending
  next_governed_action: Await decision on approval appr-release-post before executing the external action.
---

## Context

The automation drafts release announcement copy from repository release
notes. Publishing that copy to the public blog crosses this project's
local boundary and is Owner-authorized by default.

## Existing-State Assessment

Repository already contains the release-notes source and a draft
publishing script; nothing has been published externally yet.

## Unresolved Items

Owner has not yet decided whether to authorize the first external
publication (see `appr-release-post`).
