# Falsification Gate C evidence: Runtime Probe evidence resolves Initiative 6's runtime seam without Runtime Evidence becoming authority, and the runtime/orchestration boundary stayed provider-neutral

**Date:** 2026-08-20
**Context:** Initiative 7 — Runtime Probe + Runtime-Neutral Orchestration, `src/kernel/runtime/`, `src/kernel/orchestration/`

## Observed evidence: the Initiative 6 runtime seam resolves as evidence, not as authority

Initiative 6 (`src/kernel/transition/capability.ts`) intentionally emitted
an unconditional `runtime-prerequisite-unverified` indeterminate for any
`required` capability recording a runtime requirement, since no Runtime
Probe existed to consult. `evaluateCapabilityRequirement` and
`evaluateTransition` now accept an optional, ephemeral `runtimeEvidence`
map; omitting it reproduces Initiative 6's exact original behavior
(verified by a dedicated test asserting byte-identical indeterminate
output with no evidence argument). Three new tests in
`tests/kernel/transition/gate.test.ts` ("Initiative 7: Runtime Evidence
resolves the runtime-prerequisite seam") exercise the same fixture Work
Item (`wi-runtime-authorized`, capability `external-action-execution`,
`runtime_requirement_reference: network-access`) through
`evaluateTransition` directly:

- evidence `available` → outcome becomes `mechanically-eligible`, zero
  issues;
- evidence `unavailable` → outcome becomes `mechanically-blocked` with a
  new `runtime-requirement-unavailable` error, never silently treated as
  indeterminate;
- evidence `unknown` → outcome stays `indeterminate`, matching Initiative
  6's original stance that `unknown` must never be conflated with either
  available or unavailable.

A fourth test in that suite confirms runtime availability never
substitutes for missing Owner authorization: the same `available`
evidence, applied to a Work Item with no covering approval, still blocks
on `no-covering-approval-found`. `tests/kernel/transition/capability.test.ts`
covers the same four outcomes as isolated unit tests of
`evaluateCapabilityRequirement`, plus: a capability recording no runtime
requirement never manufactures one regardless of evidence supplied (Gate
C question 8/Section 19-G), and a `deferred` capability stays blocked for
activation reasons regardless of runtime evidence being `available`
(Gate C question 7).

## Observed evidence: the Orchestrator composed existing results into a bounded disposition without duplicating them

`src/kernel/orchestration/orchestrate.ts`'s `orchestrate()` calls
`evaluateTransition` exactly once and classifies its `outcome` and
`issues` into one of seven dispositions
(`src/kernel/orchestration/types.ts`) by issue *code*, never by
re-running validation or re-evaluating transition/authorization/capability
logic itself. `tests/kernel/orchestration/orchestrate.test.ts` exercises
all six scenarios from the Initiative 7 brief (Section 20) against a
dedicated fixture project state
(`tests/fixtures/project-states/runtime-orchestration/`), and confirms:

- an invalid project state, an authorization gap, a runtime-unavailable
  capability, a runtime-unknown capability, a fully-clear transition, and
  a mechanically-clear-but-qualitative-conditions transition each resolve
  to a distinct, correctly-labeled disposition;
- the `ready-for-governed-execution` result carries no field asserting
  the work should be executed — its shape is exactly `disposition`,
  `workItemId`, `transitionId`, `gateOutcome`, `issues`,
  `requiredOwnerAction`, `requiredRuntimeCapability`,
  `qualitativeJudgmentRemains` (checked via `Object.keys`), mirroring the
  same discipline Initiative 6's Scenario H test applied to
  `TransitionGateResult`;
- evaluating the same transition twice produces identical output (the
  "read-only guarantee" test) — nothing under `src/kernel/orchestration/`
  or `src/kernel/runtime/` writes to disk.

## Falsification Gate C — question-by-question

| # | Question | Result | Classification |
|---|---|---|---|
| 1 | Did AIOM Core require knowledge of Claude Code? | No — `RuntimeAdapter`/`RuntimeEvidence` carry no provider identity Core logic branches on; only `RuntimeAdapter.name` exists, for provenance/debugging only. | Passed |
| 2 | Did project-state schemas require provider-specific fields? | No schema changed. | Passed |
| 3 | Did Capability Architecture require provider names? | No — `seed/capabilities/*.md` unchanged. | Passed |
| 4 | Could Runtime Evidence be produced by another provider/runtime using the same Core representation? | Architecturally yes (see cross-runtime portability thought test below) — not yet empirically exercised by a second real adapter. | Architecture-compatible; unknown pending empirical test |
| 5 | Did runtime availability accidentally become authorization? | No — the "runtime availability never substitutes for missing Owner authorization" test above confirms `available` evidence does not clear an authorization-boundary block. | Passed |
| 6 | Did authorization accidentally imply runtime availability? | No — Orchestrator Scenario 3/4 fixtures keep an approved covering approval present while varying only runtime evidence, and still block/uncertain correctly. | Passed |
| 7 | Did capability activation accidentally imply runtime availability? | No — the `deferred`-capability-with-available-evidence unit test still blocks on activation, not runtime. | Passed |
| 8 | Did the Runtime Probe need consequential external actions to prove capability? | No — every real-adapter check (`src/kernel/runtime/adapters/node.ts`) is read-only, a version/existence check, or a bounded local temp-file round-trip; `repository-write` and `network-access` are deliberately left `unknown` rather than probed with a side effect. | Passed |
| 9 | Did Runtime Probe mutate durable project state? | No — `RuntimeEvidence` is an ephemeral, caller-assembled value; nothing under `src/kernel/runtime/` reads or writes `.aiom/`-shaped state. | Passed |
| 10 | Did the Orchestrator duplicate validator logic? | No — `orchestrate()` never calls `validateProjectState` directly; it only reads `evaluateTransition`'s already-computed result. | Passed |
| 11 | Did the Orchestrator duplicate Transition Gate logic? | No — see above; classification is by issue code, not by re-deriving eligibility. | Passed |
| 12 | Did the Orchestrator grant authority? | No — `awaiting-owner-authorization` only reports the gap; nothing creates or approves an Owner Approval Artifact. | Passed |
| 13 | Did the Orchestrator select strategic work on behalf of the Owner? | No — `orchestrate()` only classifies one caller-supplied `ProposedTransition`; it does not choose which transition to propose. | Passed |
| 14 | Did the Orchestrator execute work? | No — no state mutation anywhere in `src/kernel/orchestration/`; see the read-only guarantee test. | Passed |
| 15 | Could the Orchestrator distinguish invalid, unauthorized, runtime-blocked, runtime-unknown, and mechanically-ready states? | Yes — all five distinct dispositions, plus a sixth (`blocked-by-unmet-prerequisite`) and a seventh (`requires-qualitative-judgment`) the six named scenarios required. | Passed |
| 16 | Could a mechanically-ready state still require qualitative/Owner judgment? | Yes, structurally represented — Scenario 6's `requires-qualitative-judgment` is a distinct disposition from `ready-for-governed-execution`, and `ready-for-governed-execution`'s own doc comment states it is never a command to execute. | Passed |
| 17 | Did implementation require a daemon, service, CLI, database, queue, or workflow engine? | No — `orchestrate()` and `probeRuntime()` are plain functions; no new dependency was added (`package.json` unchanged). | Passed |
| 18 | Did implementation require a fifth durable project-state artifact? | No — `RuntimeEvidence` is explicitly ephemeral (see `evidence.ts`'s doc comment); the four durable artifact shapes are unchanged. | Passed |
| 19 | Can a fresh runtime understand the structured outputs without prior conversational explanation? | Not independently re-tested this initiative (see the companion fresh-session-continuity assessment) — but `OrchestrationResult` and `RuntimeEvidence` are self-describing typed structures with doc comments, consistent with `TransitionGateResult`'s prior standard. | Expected v0.1 limitation (unverified this run) |
| 20 | Is Claude Code still accurately describable as the first proving runtime, not part of the AIOM definition? | Yes — the only Claude-Code-specific code is `adapters/node.ts`, entirely behind `RuntimeAdapter`; every other new module is provider-neutral. | Passed |

## Cross-runtime portability thought test

*If a second runtime could inspect files, execute bounded commands, and
return the same provider-neutral Runtime Evidence structure, would
Core/kernel/orchestration require modification?* No file under
`src/kernel/transition/`, `src/kernel/orchestration/`, or the rest of
`src/kernel/runtime/` (outside `adapters/node.ts`) imports or references
anything Claude-Code-specific — they depend only on the `RuntimeAdapter`
interface and the `RuntimeEvidence`/`RuntimeRequirementId` types.
`tests/kernel/runtime/probe.test.ts`'s Scenario H test constructs two
independently-configured simulated adapters and confirms a Core consumer
(`evaluateRuntimeRequirements`) produces identical output from either,
without inspecting which one produced the evidence. This is real evidence
at the interface level, produced with simulated adapters as the brief
directs (Section 22: "Do not integrate another provider... simulated
second adapter/evidence producer can satisfy the same interface"). It
does **not** constitute empirical proof that a second *real* runtime
(a different provider, a different sandboxing model, a different
operating system) can produce this evidence — that remains unexercised.
**Classification: architecture-compatible, not yet empirically proven.**

## Remaining limitations / falsification boundaries

This evidence is bounded to what was actually exercised this initiative:
a six-ID requirement vocabulary chosen for the eight existing Atomic
Capabilities' abstract requirements plus the one fixture scenario built
for this initiative; one real adapter (Claude Code / Node.js) and two
simulated adapters, never a second independently-implemented real
runtime; and orchestration exercised only against fixture project-state
directories, never live `.aiom/` state or an actual Runtime Probe
invocation feeding a real Owner decision. It does not yet show whether
this separation holds once Project Bootstrap creates live state, once
capability relevance/activation *decision logic* exists (today that
remains an Owner/AI judgment recorded by hand in the Capability Activation
Record, not derived), or once a second real runtime adapter is actually
built and probed side-by-side with `adapters/node.ts`.
