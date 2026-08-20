---
seed_version: "0.1"
project:
  name: Fixture Project
  intent: Minimal fixture used to exercise the Bootstrap Ready structural rules.
owner:
  identity: Test Owner
existing_state_assessment:
  performed: true
  performed_at: "2026-08-01T00:00:00Z"
lifecycle_position: active-development
signals:
  repository_backed:
    value: unknown
    provenance: unknown
  software_producing:
    value: unknown
    provenance: unknown
  ui_bearing:
    value: unknown
    provenance: unknown
  externally_acting:
    value: unknown
    provenance: unknown
  persistent_state_dependent:
    value: unknown
    provenance: unknown
  data_sensitive:
    value: unknown
    provenance: unknown
  regulated_high_risk_possible:
    value: unknown
    provenance: unknown
  long_running_continuous:
    value: unknown
    provenance: unknown
  content_heavy_narrative_heavy:
    value: unknown
    provenance: unknown
consequence_confirmations:
  consequential_external_action:
    value: "no"
    provenance: owner-confirmed
  sensitive_or_high_consequence_data:
    value: "no"
    provenance: owner-confirmed
bootstrap:
  ready: true
---

## Context

Intentionally invalid: `bootstrap.ready` is `true`, but no
`bootstrap.next_governed_action` is represented.
