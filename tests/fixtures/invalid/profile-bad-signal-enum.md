---
seed_version: "0.1"
project:
  name: Bad Signal Enum Example
  intent: This profile uses an invalid signal value.
owner:
  identity: Test Owner
existing_state_assessment:
  performed: false
lifecycle_position: research
signals:
  repository_backed:
    value: "maybe"
    provenance: unknown
  software_producing:
    value: "unknown"
    provenance: unknown
  ui_bearing:
    value: "unknown"
    provenance: unknown
  externally_acting:
    value: "unknown"
    provenance: unknown
  persistent_state_dependent:
    value: "unknown"
    provenance: unknown
  data_sensitive:
    value: "unknown"
    provenance: unknown
  regulated_high_risk_possible:
    value: "unknown"
    provenance: unknown
  long_running_continuous:
    value: "unknown"
    provenance: unknown
  content_heavy_narrative_heavy:
    value: "unknown"
    provenance: unknown
consequence_confirmations:
  consequential_external_action:
    value: "unresolved"
    provenance: unknown
  sensitive_or_high_consequence_data:
    value: "unresolved"
    provenance: unknown
bootstrap:
  ready: false
---

## Context

Intentionally invalid: `signals.repository_backed.value` is `"maybe"`, which
is not one of `true` / `false` / `unknown` / `not-applicable`.
