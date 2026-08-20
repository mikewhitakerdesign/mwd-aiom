# Falsification Gate B (Initiatives 5–6) evidence: the deterministic kernel stayed non-orchestrating across both referential validation and transition/authorization evaluation

**Date:** 2026-08-20
**Context:** Initiative 6 — Transition & Approval Kernel, reviewed against Initiative 5 — Kernel Validation at Initiative 6's completion.

## Observed evidence

Falsification Gate B asks, across two initiatives, whether deterministic
machinery can verify structural correctness and authorization without
itself becoming a source of authority or a decision-maker about whether
work should proceed. Initiative 5 (Kernel Validation) answered the
referential-integrity half; Initiative 6 (Transition & Approval Kernel)
answered the transition/authorization half. Both are now backed by
passing tests, not only by design intent:

- **Capability activation never became authorization.**
  `tests/kernel/transition/gate.test.ts`'s "E/F: activation is not
  authorization" test evaluates a Work Item whose required capability
  (`external-action-execution`, status `required`, no unmet runtime
  requirement) passes the gate's capability check with zero issues, and
  independently asserts the overall outcome is still
  `mechanically-blocked` because no covering Owner Approval Artifact
  exists — the same test asserts no `capability-*` issue is present, so
  a green capability check cannot be mistaken for the reason the
  transition failed.
- **Free-form approval scope never forced semantic interpretation.**
  `tests/kernel/transition/scope.test.ts`'s "never reads scope to decide
  coverage" test sets an approval's `scope` field to prose that
  contradicts its actual coverage and confirms the gate's decision is
  unchanged — see the companion Observation,
  [approval-artifact-scope-structural-boundary](./2026-08-20-approval-artifact-scope-structural-boundary.md).
- **Ambiguity produced a distinct third outcome, not a guess.** Scenario
  J (prose-only `conditions`) and scenario K (a capability's runtime
  requirement with no Runtime Probe evidence to consult, since
  Initiative 7 has not built one) both resolve to `indeterminate` — a
  outcome the gate's type system (`GateOutcome`) makes structurally
  distinct from both `mechanically-eligible` and `mechanically-blocked`,
  not a severity level layered onto one of them.
- **Mechanical eligibility never asserted strategic correctness.**
  Scenario H's test inspects the result object's own shape
  (`Object.keys(result)`) to confirm `mechanically-eligible` carries no
  field claiming the work is worth doing — only `outcome`, `workItemId`,
  `transitionId`, and `issues`.
- **The gate never wrote anything.** `tests/kernel/transition/gate.test.ts`'s
  read-only test runs the same evaluation twice against the same fixture
  directory and asserts identical results, and no file under
  `src/kernel/transition/` performs a write, a capability activation, an
  approval-status mutation, or a next-transition selection — the entire
  module reads Initiative 5's existing loader and validator and computes
  a result, nothing else.

## Current implication

Across two initiatives and two structurally different deterministic
mechanisms — cross-document reference resolution (Initiative 5) and
transition/authorization coverage evaluation (Initiative 6) — the kernel
has not, in either case, needed to become a decision-maker to do its job.
Both mechanisms stayed within "verify already-recorded state," and both
needed an explicit escape hatch (Initiative 5's warnings; Initiative 6's
`indeterminate` outcome) for the cases where mechanical certainty ran
out, rather than resolving that uncertainty by guessing in either
direction.

## Remaining limitations / falsification boundaries

This evidence remains bounded to what has actually been exercised: a
proving-only, five-transition rule set over Initiative 4's stage
vocabulary; fixture project-state directories, not live `.aiom/` state;
and no Runtime Probe to supply real runtime-availability evidence for the
`indeterminate` runtime-prerequisite case to ever resolve. It does not
yet show whether this separation holds once Initiative 7 introduces
actual runtime evidence, once a real Orchestrator consumes
`TransitionGateResult` to decide what to do next, or once transitions are
actually executed rather than only evaluated.
