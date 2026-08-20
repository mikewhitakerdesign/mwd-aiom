---
seed_version: "0.1"
project:
  name: Customer Dashboard Revamp
  intent: Rebuild the customer-facing usage dashboard on the current design system.
owner:
  identity: Priya (Product Owner)
existing_state_assessment:
  performed: true
  performed_at: "2026-07-01T12:00:00Z"
lifecycle_position: active-development
signals:
  repository_backed:
    value: "true"
    provenance: directly-inspected
  software_producing:
    value: "true"
    provenance: directly-inspected
  ui_bearing:
    value: "true"
    provenance: directly-inspected
  externally_acting:
    value: "false"
    provenance: owner-confirmed
    rationale: dashboard reads from the existing internal API only
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
    value: "false"
    provenance: ai-inferred
consequence_confirmations:
  consequential_external_action:
    value: "no"
    provenance: owner-confirmed
  sensitive_or_high_consequence_data:
    value: "no"
    provenance: owner-confirmed
bootstrap:
  ready: true
  next_governed_action: Continue implementation work under work item dashboard-revamp.
---

## Context

Existing repository already contains the dashboard's current implementation;
this work replaces its UI layer without changing the underlying API.

## Existing-State Assessment

Repository inspected directly: existing dashboard code, lint/typecheck/test
tooling, and CI already in place.

## Unresolved Items

None.
