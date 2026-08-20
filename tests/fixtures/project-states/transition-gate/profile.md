---
seed_version: "0.1"
project:
  name: Transition Gate Fixture Project
  intent: A minimal shared project state used only to exercise Transition Gate scenarios; not a real project.
owner:
  identity: Fixture Owner
existing_state_assessment:
  performed: true
  performed_at: "2026-08-01T09:00:00Z"
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
  persistent_state_dependent:
    value: "true"
    provenance: owner-confirmed
  data_sensitive:
    value: "false"
    provenance: owner-confirmed
  regulated_high_risk_possible:
    value: "false"
    provenance: owner-confirmed
  long_running_continuous:
    value: "true"
    provenance: owner-confirmed
  content_heavy_narrative_heavy:
    value: "false"
    provenance: owner-confirmed
consequence_confirmations:
  consequential_external_action:
    value: "yes"
    provenance: owner-confirmed
  sensitive_or_high_consequence_data:
    value: "no"
    provenance: owner-confirmed
bootstrap:
  ready: true
  next_governed_action: Not applicable — this profile exists only to support Transition Gate fixtures.
---

## Context

Fixture-only project state for `tests/kernel/transition/`. Not a real
project; exists solely so the Transition Gate has a structurally valid,
referentially coherent base to evaluate proposed transitions against.

## Existing-State Assessment

Not applicable.

## Unresolved Items

None.
