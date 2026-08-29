# Initiative 15 closes without implementation: the `approval-to-delivery` Transition authority boundary already implements the narrowest mechanically sound invariant identified by the investigation, and predates the initiative

**Date:** 2026-08-29
**Context:** Initiative 15 — Delivery Authorization-Chain Gate, read-only architectural investigation

## Finding

Initiative 15's roadmap entry (`README.md`) traced to a single source: finding 7
of `docs/decisions/observations/2026-08-21-initiative-9-greenfield-poc-closure.md`
— *"No implemented Git Delivery gate exists yet. The Git Delivery readiness
audit that withheld delivery was a manual audit, not an enforced mechanism."*
This is a single, unelaborated observation from one external, never-committed
proving project (`cmr-site`), with no second occurrence anywhere in this
repository's evidence — the same evidentiary shape Initiative 14 originally
over-scoped from before a dedicated investigation narrowed it.

A dedicated read-only investigation conducted under this initiative found
that the existing `approval-to-delivery` Transition authority boundary
already implements the narrowest mechanically sound authorization invariant
identified by the I15 investigation:

- `src/kernel/transition/rules.ts` defines `approval-to-delivery` as the
  sole transition rule with `authorityBoundary: true` among the five rules
  in `TRANSITION_RULES` (confirmed by
  `tests/kernel/transition/rules.test.ts`, "marks only the approval ->
  delivery transition as crossing the authority boundary").
- `src/kernel/transition/gate.ts`'s `evaluateAuthorityBoundary` mechanically
  blocks that transition (`mechanically-blocked` outcome, `no-covering-approval-found`
  / `approval-not-found` / `approval-work-item-mismatch` errors) unless a
  structurally covering, `status: 'approved'`, unexpired Owner Approval
  Artifact is found for the Work Item.
- This mechanism was implemented by **Initiative 6 — Transition & Approval
  Kernel**, and has not been modified since. Initiative 6 did not
  anticipate Initiative 15; Initiative 15 did not implement, add, or
  modify this mechanism. Initiative 15's contribution is the investigation
  that identified this pre-existing mechanism as the narrowest invariant
  currently justified by repository evidence, and connected it to the
  later delivery-authorization hypothesis for the first time.

No file under `src/` or `tests/` changed as a result of Initiative 15.

## What this does not establish

This mechanism operates only on a Work Item's own self-reported `stage`
field reaching the schema value `'delivery'`
(`src/kernel/schemas/work-item.ts`'s `workItemStageSchema`, itself
documented as "a bounded, proving-only stage vocabulary — not universal
AIOM lifecycle architecture"). Nothing in this repository connects that
field to any real Git/GitHub or other external-delivery action: no Work
Item ↔ commit/branch/PR mapping exists, no CI step or invocation
touchpoint calls `evaluateTransition`/`orchestrate` at merge or deploy
time, and this repository's own CI (`.github/workflows/ci.yml`) enforces
only `validate` (lint/typecheck/build/test of `mwd-aiom`'s own code) and
`pr-attribution` — neither reads or reacts to a consuming project's
`.aiom/` state.

## Explicitly deferred, not designed, not scheduled

Two concerns raised during the investigation were evaluated and
deliberately left unimplemented and unscheduled, pending future evidence:

1. **Real Git/GitHub or other external-delivery enforcement** — wiring the
   existing Work-Item-level boundary to an actual merge/push/PR/deploy
   event. A future proving project would need to surface a concrete,
   recurring, or consequential failure before such enforcement is
   designed.
2. **Stale-authorization / material-change detection** — whether an
   approved Work Item's underlying work has changed since approval is not
   mechanically detectable today (`OwnerApprovalArtifact` records no
   content hash, revision, or other immutable reference to the work it
   authorizes). Solving this would require content hashing, revision
   pinning, or provenance mechanisms not currently justified by evidence.

Neither concern is represented here, or anywhere else in this closure, as
solved, partially implemented, scheduled, or committed future work.

## Falsification boundary

This finding is bounded to the current state of `src/kernel/transition/`
and the single-project, single-session evidence base that motivated
Initiative 15. It does not evaluate whether a second proving project
would surface a different or stronger case for either deferred concern.
