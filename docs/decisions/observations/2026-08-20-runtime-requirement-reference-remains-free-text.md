# A Capability Activation entry's `runtime_requirement_reference` remains unconstrained free-text prose; only a value that happens to equal a Runtime Requirement ID is mechanically comparable

**Date:** 2026-08-20
**Context:** Initiative 7 — Runtime Probe + Runtime-Neutral Orchestration, `src/kernel/runtime/requirements.ts`, `src/kernel/transition/capability.ts`

## Finding

Initiative 7's brief (Section 5) named the existing free-text runtime
requirement representation as a possible falsification point, and asked
for a bounded normalization if one could be derived from existing
canonical definitions without changing architecture. Inspecting the
schema layer before implementing confirmed the representation is exactly
as unconstrained as Initiative 5 had already found it to be when it
excluded matching against this same field (see
[`references.ts`](../../../src/kernel/validation/references.ts) and the
Initiative 5 completion report): `runtime_requirement_reference`
(`src/kernel/schemas/capability-activation.ts`), `runtime_requirement`
(Work Item), and `runtime_requirements` (Project Profile) are all
`z.string().min(1)` — free prose by design, not an enum. The Initiative 6
fixture capability activation entry for `persistent-continuation` records
its runtime requirement as `"requires outbound network access to the
scheduled monitoring endpoint"` — a real, in-repository example of what
this field actually looks like when a project records one.

A bounded normalization was possible without changing that architecture:
`src/kernel/runtime/requirements.ts` defines a small, stable,
provider-neutral Runtime Requirement ID vocabulary (`filesystem-read`,
`filesystem-write`, `process-execution`, `repository-read`,
`repository-write`, `network-access`), and the Transition Gate's runtime-
prerequisite check (`evaluateCapabilityRequirement` in
`src/kernel/transition/capability.ts`) compares a capability's recorded
`runtime_requirement_reference` against Runtime Evidence only when that
reference is an *exact* match for one of these IDs
(`isRuntimeRequirementId`). This preserves Initiative 5's judgment
boundary exactly: the comparison is still mechanical equality, never an
interpretation of whether a prose reference is "close enough" to a
requirement ID.

## Why this matters

The practical consequence is asymmetric. A project that records its
runtime requirement using one of the six canonical IDs directly (as the
new `tests/fixtures/project-states/runtime-orchestration/` fixture does)
gets full benefit: Runtime Probe evidence can resolve Initiative 6's
`runtime-prerequisite-unverified` indeterminate deterministically (see the
companion Falsification Gate C observation). A project that records its
runtime requirement as descriptive prose — which the existing Initiative
6 `persistent-continuation` fixture shows is exactly what the schema
already encourages and validates — gets none: the reference simply does
not match any known ID, and the gate falls back to exactly Initiative 6's
original behavior (indeterminate, never silently resolved). This is
correct and safe — a prose reference must never be guessed at — but it
means the seam resolution demonstrated by Initiative 7 depends on a
project *choosing* to record its runtime requirement in the canonical
vocabulary, which nothing in the schema or templates currently prompts it
to do.

## Remaining limitation / falsification boundary

Tightening `runtime_requirement_reference` (or the capability-level
"Runtime requirement (abstract)" prose in `capabilities.md`) into an enum
constrained to this vocabulary was intentionally not done here — that
would be a schema/Capability Architecture change, which Initiative 7's
brief (Sections 5 and 18) reserved for an Owner-level decision rather than
something to invent silently inside a bounded normalization layer. Until
that decision is made, whether a given project's recorded runtime
requirement is ever mechanically comparable remains a matter of
convention, not something the schema enforces.
