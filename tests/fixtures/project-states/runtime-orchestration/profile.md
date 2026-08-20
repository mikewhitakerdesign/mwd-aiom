---
seed_version: "0.1"
project:
  name: Runtime Orchestration Fixture
  intent: Fixture project state exercising Initiative 7 Orchestrator scenarios (Section 20).
owner:
  identity: fixture-owner
existing_state_assessment:
  performed: false
lifecycle_position: not-yet-assessed
signals:
  repository_backed:
    value: "true"
    provenance: directly-inspected
  software_producing:
    value: unknown
    provenance: unknown
  ui_bearing:
    value: unknown
    provenance: unknown
  externally_acting:
    value: "true"
    provenance: owner-confirmed
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
    value: "yes"
    provenance: owner-confirmed
  sensitive_or_high_consequence_data:
    value: unresolved
    provenance: unknown
bootstrap:
  ready: false
  unresolved_items:
    - fixture only; never intended to reach Bootstrap Ready
  next_governed_action: none — this directory exists only for Initiative 7 Orchestrator tests
---

## Context

Exists only to be evaluated by `tests/kernel/orchestration/orchestrate.test.ts` and
`tests/kernel/transition/gate.test.ts`'s runtime-seam scenario. Not a template for a real project.
