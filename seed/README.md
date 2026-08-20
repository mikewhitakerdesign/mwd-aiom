# AIOM Core Seed

## What this is

The AIOM Core Seed is the smallest reusable, provider-neutral expression
of AIOM Core: durable operating guidance that any future AIOM-managed
project can depend on, independent of runtime or provider.

## What currently exists

- [`core.md`](./core.md) — the AIOM Core reference: what Core is, what it
  governs, Owner authority, operating principles, and responsibility
  boundaries.
- [`safeguards.md`](./safeguards.md) — the minimum safeguard foundation
  those responsibilities require before later mechanisms implement them.
- [`capabilities/`](./capabilities/README.md) — the reusable Capability
  Architecture: Capability Bundle and Atomic Capability definitions a
  future Project Bootstrap and Orchestrator will use to reason about what
  a project may need. See
  [`capabilities/README.md`](./capabilities/README.md) for what relevance
  means here, how it differs from activation, and where the bundle
  ([`capabilities/bundles.md`](./capabilities/bundles.md)) and capability
  ([`capabilities/capabilities.md`](./capabilities/capabilities.md))
  definitions live.
- [`templates/`](./templates/README.md) — reusable, provider-neutral
  templates and TypeScript/Zod schemas for the four durable,
  project-local state artifacts (Project Profile, Capability Activation
  Record, Governed Work Item, Owner Approval Artifact) that a future
  Project Bootstrap will create under a consuming project's own `.aiom/`
  directory. See [`templates/README.md`](./templates/README.md). The
  schemas and parsing layer live in `src/kernel/` at the repository root,
  not under `seed/`, since they are executable code rather than Seed
  content a consuming project copies. `src/kernel/validation/` — see
  below — is executable code in the same sense.

## What currently exists (continued): Kernel Validation

`src/kernel/validation/` is a thin, read-only deterministic validator
over the schema layer above: it resolves Capability Bundle/Atomic
Capability ID references (derived from `capabilities/bundles.md` and
`capabilities/capabilities.md`, not a second registry), checks Work
Item/Owner Approval Artifact reference coherence, duplicate IDs, and
Seed-version consistency across a project-state directory, checks
Bootstrap Ready structural (not substantive) consistency, and flags a
small set of mechanically unambiguous state contradictions. It does not
decide Capability Bundle relevance, Atomic Capability activation, or
authorization — it only checks that already-recorded decisions reference
known IDs and don't mechanically contradict each other.

## What currently exists (continued): Transition & Approval Kernel

`src/kernel/transition/` is a read-only Transition Gate over the same
schema layer and over Kernel Validation's project-state loader: given one
proposed Work Item transition (an ephemeral, programmatic input, not a
new durable artifact type), it evaluates the transition against a small,
bounded, proving-only rule set (`src/kernel/transition/rules.ts`) covering
source/target stage relevance, validation and blocker prerequisites,
Atomic Capability activation status, and — where a transition crosses the
authorization boundary — whether an approved, structurally matching Owner
Approval Artifact exists (`src/kernel/transition/scope.ts`). Coverage
matching reads only structured Approval Artifact fields
(`related_work_item_id`, `status`, `expiration`, `authorized_action` by
exact string equality); it never interprets `scope` or `target_context`
prose, and a non-empty `conditions` array yields an explicit
`indeterminate` outcome rather than a guess. The gate never grants
authority, never decides whether a transition should occur, and never
mutates project state — it answers only whether a transition is
mechanically eligible, mechanically blocked, or indeterminate given
already-recorded state.

## What currently exists (continued): Runtime Probe

`src/kernel/runtime/` produces structured, evidence-backed Runtime
Evidence — `available` / `unavailable` / `unknown` per Runtime Requirement
ID (see [`requirements.ts`](../src/kernel/runtime/requirements.ts) for the
bounded, provider-neutral vocabulary: `filesystem-read`,
`filesystem-write`, `process-execution`, `repository-read`,
`repository-write`, `network-access`), produced by any adapter
implementing the `RuntimeAdapter` interface. Provider-specific inspection
lives entirely behind that interface — Core/kernel consumers depend only
on `RuntimeAdapter` and `RuntimeEvidence`, never on which adapter produced
them. The bounded, real Claude Code / Node.js adapter
(`src/kernel/runtime/adapters/node.ts`) performs only read-only,
version/existence, or temporary/local bounded checks; it never pushes,
deploys, or takes any other consequential external action just to prove a
capability, and reports `unknown` rather than guessing wherever a
mechanical check would itself require a side effect (e.g.
`repository-write`, `network-access`). Evidence is ephemeral — assembled
per evaluation and never written into durable project state; a Runtime
Probe result is not a fifth durable artifact.

## What currently exists (continued): Runtime-Neutral Orchestration foundation

`src/kernel/orchestration/` is a read-only function
(`orchestrate()`) that composes Kernel Validation, the Transition Gate,
and, when supplied, Runtime Evidence into one of a small set of governed
dispositions (`blocked-by-invalid-state`, `blocked-by-unmet-prerequisite`,
`awaiting-owner-authorization`, `blocked-by-runtime`, `runtime-unknown`,
`requires-qualitative-judgment`, `ready-for-governed-execution`). It
duplicates none of the logic in the modules it composes — every fact in
its output is read directly off the `TransitionGateResult` it wraps. It
never grants authority, never selects work on the Owner's behalf, and
never executes the proposed transition: `ready-for-governed-execution`
means only that no deterministic prerequisite this repository currently
checks blocks the transition, never that the transition should be taken.

## What is not implemented yet

This Seed defines Core, safeguards, the Capability Architecture, the
project-state artifact templates/schemas, a deterministic validator over
that schema layer, a read-only Transition Gate, a Runtime Probe, and a
Runtime-Neutral Orchestration foundation. It does not yet include Project
Bootstrap or any runtime-specific (e.g. Claude Code) project-instruction
templates. `.aiom/` is not created as live state anywhere in this
repository — the templates under `templates/` and the fixtures under
`tests/fixtures/` are the only instances that exist. See the repository
root [`README.md`](../README.md) for the full implementation roadmap.

## Relationship to mwd-aiom

`mwd-aiom` is the source repository that builds and versions the AIOM Core
Seed, and, in later initiatives, the rest of the Minimal Executable
Kernel. The Seed is content meant to be consumed by other,
AIOM-managed projects — it is distinct from this repository's own
governance (root [`AGENTS.md`](../AGENTS.md) and
[`CLAUDE.md`](../CLAUDE.md)), which governs development of `mwd-aiom`
itself, not the projects that will eventually depend on the Seed.

## How consuming projects will use this

A future Project Bootstrap initiative will derive or adapt a consuming
project's own runtime instructions (its `AGENTS.md`, `CLAUDE.md`, etc.)
from this Seed. Consuming projects should not simply copy this
repository's root `AGENTS.md` / `CLAUDE.md` unchanged — those files govern
work on `mwd-aiom` itself, not on a project built with AIOM.
