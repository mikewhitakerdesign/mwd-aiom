---
# Project Profile template (AIOM Seed v0.1)
#
# Placeholder values are wrapped in angle brackets, e.g. <project name> —
# replace them with real durable facts during Bootstrap. Everything else
# (enum values, status literals) is a valid, schema-conformant default for
# a project that has not yet been assessed, not a placeholder to search for.
seed_version: "0.1"
project:
  name: <project name>
  intent: <one to two sentence statement of what this project is for>
owner:
  identity: <Owner identity>
existing_state_assessment:
  performed: false
lifecycle_position: not-yet-assessed
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
    value: unresolved
    provenance: unknown
  sensitive_or_high_consequence_data:
    value: unresolved
    provenance: unknown
bootstrap:
  ready: false
  unresolved_items:
    - <what remains before this project can be considered Bootstrap Ready>
  next_governed_action: <what a fresh runtime or session should do next>
---

## Context

<Prose: why this project exists, and any framing an Owner has already
given that doesn't belong in the structured fields above.>

## Existing-State Assessment

<Prose: narrative findings from inspecting any pre-existing repository,
product, or process state. Leave empty if none has been performed yet —
`existing_state_assessment.performed` above records that fact
structurally.>

## Unresolved Items

<Prose elaboration of the `bootstrap.unresolved_items` list above, where
more than a short label is useful.>
