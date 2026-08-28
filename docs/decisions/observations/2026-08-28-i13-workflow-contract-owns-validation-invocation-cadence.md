# Initiative 13 closes the validation-invocation-cadence gap in the project-agent workflow contract, not in the kernel

**Date:** 2026-08-28
**Context:** Initiative 13 — Session-Boundary State Validation

## Finding

Initiative 9 Finding 4 (`cmr-site` accumulated schema-invalid Work Item
frontmatter that the existing validator would have rejected, had it been
invoked) and Finding 8 (a fresh session's successful reasoning-based
reconstruction of `.aiom/` state was not evidence that the reconstructed
state was valid) both trace to the same gap: nothing required a reasoning
episode to invoke deterministic validation before treating persisted
`.aiom/` state as trustworthy. Investigation of this gap (the preceding
read-only pass) found no deterministic session concept anywhere in this
repository, no code path that could enforce one without new runtime
infrastructure, and no evidence that closing the gap required a new
public invocation operation, new persistent validation state, or new
kernel validation rules — `Validate`, `Transition`, and `Orchestrate`
already behave exactly as the gap's resolution requires; `Transition`
and `Orchestrate` already re-validate project state unconditionally
before evaluating a proposed transition.

The gap was therefore closed entirely in `seed/templates/project-agents.md`
— the project-facing workflow contract materialized into every
Bootstrap-managed project's own `AGENTS.md` — by replacing prose that
explicitly disclaimed any invocation-cadence requirement with a rule
requiring `mwd-aiom validate` before a fresh or resumed reasoning episode
treats existing state as trustworthy for understanding project status,
selecting work, making a governance decision, or proceeding with governed
work. No file under `src/` changed.

## Responsibility split

**The project-agent workflow contract owns *when* validation must be
invoked.** **The deterministic kernel owns *whether* project state is
valid** once invoked, and is unchanged. This is a direct application of
[0001-runtime-invocation-and-distribution-boundary](../adr/0001-runtime-invocation-and-distribution-boundary.md)'s
own stated boundary ("session-boundary invocation cadence... remains
Initiative 13's responsibility"), not a new architectural decision — no
ADR was written for it.

## What this mechanically guarantees, and what it does not

The rule's materialization into future Bootstrap-managed projects is
mechanically verified (a `tests/kernel/bootstrap/materialize.test.ts`
assertion confirms a freshly materialized project `AGENTS.md` contains
it). **Whether a given AI reasoning runtime actually reads and follows
that contract is not, and cannot be, mechanically guaranteed by this
change** — that remains a workflow-contract/behavioral-tier expectation,
identical in kind to every other instruction in `AGENTS.md`/`seed/`.

An already-bootstrapped project (including `cmr-site`, the project that
produced Finding 4) does **not** automatically receive the updated
contract: `materializeProjectInstructions` never overwrites an existing
project-root `AGENTS.md` (brownfield preservation). Reconciling an
existing project's copy is separate, project-level work, not performed
by this initiative.

The fallback path for when `mwd-aiom` cannot be invoked was written to
avoid repeating Finding 8's mistake: direct inspection of `.aiom/*` files
remains permitted, but the contract now states explicitly that such
inspection is not validation, that reasoning-based reconstruction
succeeding is not evidence the underlying state is valid, and that the
inability to validate must be escalated to the Owner rather than treated
as a silent substitute for a passing validation result.

## Acknowledged, unaddressed architecture ceiling

There is still no deterministic operation to create or update a Governed
Work Item — Bootstrap materializes exactly one, and
`seed/templates/work-item.md` exists to be hand-copied for any subsequent
one, with no mechanical gate at that point. This is exactly the mechanism
that produced Finding 4, and it is unchanged by this initiative. It was
already evident in the Initiative 9 closure record
([2026-08-21-initiative-9-greenfield-poc-closure](./2026-08-21-initiative-9-greenfield-poc-closure.md))
and is recorded here only to confirm it was considered and deliberately
left out of I13's scope, not overlooked — closing it would mean adding a
Work Item mutation API, which is a materially different kind of change
than validation-invocation cadence and is not promoted into a new
initiative by this work.
