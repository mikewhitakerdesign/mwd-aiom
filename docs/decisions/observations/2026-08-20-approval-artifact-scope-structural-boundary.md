# The Owner Approval Artifact schema supports deterministic authorization coverage only through a narrow structured subset

**Date:** 2026-08-20
**Context:** Initiative 6 — Transition & Approval Kernel, `src/kernel/transition/scope.ts`

## Finding

Initiative 6's brief (Section 10) named Approval Artifact scope matching
as the central falsification point: can the Transition Gate mechanically
determine whether an approval covers a proposed transition without
resorting to semantic/prose interpretation? Inspecting the Initiative 4
`ownerApprovalArtifactSchema` (`src/kernel/schemas/approval.ts`) before
writing the gate confirmed that four of its content-bearing fields —
`target_context`, `requested_decision`, `scope`, and `authorized_action`
— are all unconstrained `z.string().min(1)` prose. Of these, only
`authorized_action` is even optional; `scope` is required on every
approval but is explicitly documented (in `seed/templates/approval.yaml`)
as "what this authorization covers, and what it does not" — free text by
design, not a structured scope expression.

The Transition Gate's coverage matching (`evaluateApprovalCoverage`)
therefore reads only: `status` (enum — must be `approved`),
`related_work_item_id` (a stable-ID reference — matched exactly, and its
*absence* is treated as a definite "does not cover," not ambiguity),
`expiration` (an ISO datetime, compared against a caller-supplied clock),
`authorized_action` (matched only by exact string equality against the
proposed transition's `action` label — never parsed or interpreted), and
`conditions` (an array of prose strings whose *presence* forces an
explicit `indeterminate` outcome, since their *content* cannot be
mechanically evaluated). `scope` and `target_context` are never read by
the gate at all; a test (`tests/kernel/transition/scope.test.ts`,
"never reads scope to decide coverage") sets `scope` to prose that
directly contradicts the approval's actual coverage and confirms the
gate's decision is unaffected.

## Why this matters

Two concrete downstream limitations follow directly from this structural
boundary, both consistent with limitations the brief anticipated as
acceptable for v0.1 (Sections 11–12), not defects requiring redesign:

- **`related_work_item_id` is optional, so a true class-based
  durable-policy approval cannot be mechanically expressed.** An Owner
  wanting to pre-authorize "this bounded class of future actions,
  regardless of which Work Item" has no structured field to record that
  class in — omitting `related_work_item_id` to signal breadth is
  indistinguishable, to the gate, from an approval that simply lacks
  proof of scope, and is treated as not covering anything. Every
  approval the gate can mechanically apply, including `durable-policy`
  and `recurring-case-by-case` ones, must in practice be tied to exactly
  one Work Item.
- **`authorized_action` coverage is exact-string-match only.** There is
  no shared, structured action/transition vocabulary between a proposed
  transition's `action` label and an approval's `authorized_action` —
  both are free strings that happen to support equality comparison. A
  functionally identical action recorded with different wording between
  the two artifacts (e.g. a rephrase during Owner review) would
  mechanically read as "wrong action," collapsing to `not-covered`
  rather than surfacing as ambiguity, because it is a definite string
  mismatch, not qualitative content the gate can flag as
  `indeterminate`.

## Remaining limitation / falsification boundary

The gate never silently guessed: every place these structural gaps bite,
the affected coverage outcome is deterministic and explainable from the
comparison performed. But if a later initiative wants durable-policy
approvals that genuinely cover a *class* of transitions rather than one
Work Item's one action, the Owner Approval Artifact schema itself would
need a structured scope expression (e.g. a bundle/capability-ID-based
class descriptor) — that is a schema change, and per Initiative 6's
brief (Section 12), was intentionally left unbuilt rather than invented
silently inside this deterministic gate.
