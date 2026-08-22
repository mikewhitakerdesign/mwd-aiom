# General validation's authority-evidence warning reads the same narrow structured subset of an Owner Approval Artifact as the Transition Gate

**Date:** 2026-08-21
**Context:** Initiative 11 — Approval Artifact Enforcement Coverage,
`src/kernel/validation/authority.ts`

## Finding

Initiative 11 extends `validateProjectState` (via a new
`validateAuthorityEvidence` module) so that a Work Item declaring
`authority_requirement: owner-authorization-required` surfaces a
warning-severity `owner-authorization-unproven` issue when no
successfully parsed, `approved`, unexpired Owner Approval Artifact is
bound to it through `related_work_item_id`.

Deciding what counts as "sufficient evidence" for this general-validation
predicate required the same structural-boundary judgment already made and
recorded for the Transition Gate in
`2026-08-20-approval-artifact-scope-structural-boundary.md`: an Owner
Approval Artifact's `authorized_action`, `conditions`, `scope`,
`target_context`, and `mode` fields are unconstrained prose (or, for
`conditions`, an array of prose whose *content* isn't mechanically
checkable). The Transition Gate reads none of them to decide coverage of
a specific transition beyond exact-match `authorized_action`; general
validation, which has no transition/action context at all, reads even
less — only `related_work_item_id`, `status`, and `expiration`, the three
fields both mechanically checkable and independent of any particular
proposed transition.

This is an existential rule, not a scoring one: exactly one qualifying
approval (approved, unexpired, correctly bound) suppresses the warning,
regardless of how many other approvals exist in any other state
(`pending`, `denied`, `expired`, `superseded`, or bound to a different
Work Item).

## Why this matters

The warning is deliberately weaker proof than the Transition Gate's own
`evaluateAuthorityBoundary` (`src/kernel/transition/gate.ts`) — it never
checks whether a specific proposed transition's `authorized_action` or
`conditions` are satisfied, only whether *any* durable, unexpired,
approved evidence exists for the Work Item at all. That asymmetry is
intentional: general validation runs without transition context, so it
cannot and does not attempt to answer the Transition Gate's narrower
question. The two checks are structurally independent — this warning
never feeds into `evaluateApprovalCoverage` or `evaluateAuthorityBoundary`,
and Transition Gate outcomes are unaffected by it (confirmed by the
unmodified `tests/kernel/transition/gate.test.ts` and
`tests/kernel/orchestration/orchestrate.test.ts` suites, which pass
unchanged against the new validation warning).

## Remaining limitation / falsification boundary

`ValidationIssue` carries only two severities (`error`/`warning`, per
`src/kernel/validation/result.ts`), so this warning cannot express
"indeterminate" the way `GateIssue` can. A Work Item with a malformed
Approval Artifact bound to it (one that fails to parse) is therefore
treated identically to a Work Item with no bound approval at all — both
surface the same `owner-authorization-unproven` warning, and the
pre-existing `parse-error` issue for the malformed artifact remains the
authoritative signal for *why*. This is consistent with Initiative 5's
existing convention (only successfully parsed documents are read for
referential/authority checks) and was not something this initiative
needed to change.
