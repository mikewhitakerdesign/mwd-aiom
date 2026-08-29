# 0002: Accept MWD AIOM v0.1 Baseline and Enter Proving-Project Use

**Status:** accepted
**Date:** 2026-08-29
**Context:** Baseline acceptance (Owner decision; not an initiative)

## Decision question

Should the architecture accumulated through Initiatives 1–15 be accepted as
a stable reference baseline (MWD AIOM v0.1) and used to govern real
proving-project work, or should structural architecture-building continue?

## Context

- Initiatives 1–15 are terminal (see `README.md`'s Implementation roadmap).
- A separate, hard read-only baseline assessment reconstructed and
  evaluated the cumulative architecture independent of this repository's
  own initiative-closure narratives.
- The assessment found no v0.1 structural blockers.
- The purpose of v0.1 is not architectural completeness. The purpose is to
  establish a coherent reference architecture and begin learning from real
  product/design/development use.

## Decision

- Accept the architecture at commit
  `49eac236c5df64e889b57b3422b922fe30cc15f5` as **MWD AIOM v0.1**. That
  commit is the architecture baseline; this ADR and the PR that carries it
  are baseline-acceptance documentation created after that architecture
  was already accepted, not a redefinition of the baseline.
- Enter proving-project use.
- Do not begin another structural architecture wave merely because known
  limitations remain.
- Future structural changes should be evidence-driven by proving-project
  use rather than speculative completion of a hypothetical fully
  autonomous architecture.

## Maturity framing

MWD AIOM v0.1 is appropriately characterized as approximately: a
human-governed, deterministically-gated workflow architecture with a
well-defined deterministic kernel and an AI-interpreted reasoning layer.

It is not:

- an autonomous multi-agent platform;
- fully executable governance;
- fully automated orchestration;
- an adaptive operating model.

The distinction between natural-language governance (recorded intent,
conventions, `AGENTS.md`) and mechanically enforced policy (the
deterministic kernel: validation, the Transition Gate, Approval Artifact
enforcement) remains load-bearing and is not blurred by this acceptance.

## Known limitations intentionally accepted into proving

These are accepted learning targets for the proving phase, not backlog
commitments. Proving-project evidence — not this ADR — determines whether
any of them warrant future architectural change:

1. `authority_requirement` correctness depends on properly declared
   governed state. Under-declaration as `none` is not independently
   detected by the deterministic authority boundary.
2. Work Items beyond Bootstrap do not currently have a deterministic
   create/update API.
3. Session-boundary validation invocation is governed procedurally by the
   workflow contract rather than mechanically enforced.
4. No real external Git/GitHub/deployment action is currently mechanically
   gated by Work Item delivery readiness.
5. Stale authorization/material-change detection is not currently
   implemented.
6. Cross-runtime portability is architecturally supported but has limited
   real-runtime empirical evidence.

None of these are converted into initiatives, assigned implementation
plans, scheduled, or implied to eventually all require implementation.

## Important authorization watchpoint

`authority_requirement` may be set to `none` by AI- or human-authored
governed state, and the deterministic authorization boundary does not
independently determine whether a piece of work's substantive nature
should instead require Owner authorization. This is deliberately accepted
as a known limitation to exercise during proving — not dismissed as
irrelevant, and not classified as a v0.1 blocker. The Owner remains the
human governance backstop during the proving phase.

## Proving intent

Proving projects are expected to stress areas such as: authority
classification; Work Item authoring; session continuity;
workflow/capability routing; Owner burden; state sufficiency; handoffs;
portability; external delivery; knowledge continuity.

The purpose is to discover from evidence what should become deterministic,
what should remain AI judgment, what should remain procedural, and where
Owner authority belongs. This is a set of areas to observe during proving,
not a roadmap of future work.

## Alternatives considered

- **Begin further structural architecture work (a hypothetical Initiative
  16) before any proving use.** Rejected — the assessment found no
  structural blocker requiring it, and further structural work without
  proving-project evidence would be speculative completion of a
  hypothetical autonomous architecture rather than evidence-driven.
- **Decline to accept a baseline and continue treating the architecture as
  unstable.** Rejected — Initiatives 1–15 are terminal and the assessment
  corroborated the existing repository evidence; withholding acceptance
  would block proving use without a concrete reason to do so.
- **Accept the baseline and enter proving-project use.** Chosen.

## Consequences

- v0.1 provides an immutable architectural reference point: commit
  `49eac236c5df64e889b57b3422b922fe30cc15f5`.
- Structural architecture work is no longer the default next action.
- Proving projects become the primary source of architectural evidence
  going forward.
- The known limitations above are intentionally carried into proving under
  human governance rather than resolved first.
- Future architecture changes should be traceable to observed
  proving-project evidence or another comparably strong justification, not
  to closing a known limitation on its own.
