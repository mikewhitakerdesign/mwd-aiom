# MWD AIOM

## What this is

`mwd-aiom` is the source repository for the AIOM Core Seed and Minimal
Executable Kernel — a human-governed, AI-assisted operating architecture for
bootstrapping, governing, validating, resuming, and evolving digital-product
and automation work.

This is an **experimental v0.1 proving implementation**, developed from
architecture approved through prior proof-of-concept work. It exists to
implement and validate that architecture in a reusable form — it is not
itself a finished product.

## What this repository contains

This repository currently contains:

- Provider-neutral repository guidance (`AGENTS.md`) and a Claude
  Code-specific pointer (`CLAUDE.md`)
- A TypeScript / Node.js / pnpm tooling baseline (lint, typecheck, test)
- A decisions structure (`docs/decisions/`) for this repository's own
  ADRs, observations, and journal entries
- Minimal CI that runs the same validation available locally
- The AIOM Core Seed foundation (`seed/`) — a reusable, provider-neutral
  reference for AIOM Core's responsibilities, Owner authority, operating
  principles, responsibility boundaries, and a safeguard foundation; see
  `seed/README.md`
- The Capability Architecture (`seed/capabilities/`) — reusable,
  provider-neutral Capability Bundle and Atomic Capability definitions;
  see `seed/capabilities/README.md`
- Project State Templates & Schemas (`seed/templates/`, `src/kernel/`) —
  reusable templates, TypeScript/Zod schemas, and a minimal
  Markdown-frontmatter/YAML parsing layer for the four durable
  project-local artifact types: Project Profile, Capability Activation
  Record, Governed Work Item, and Owner Approval Artifact; see
  `seed/templates/README.md`
- Kernel Validation (`src/kernel/validation/`) — a thin, read-only
  deterministic validator over that schema layer: cross-document
  referential integrity (Capability Bundle/Atomic Capability ID
  resolution, Work Item/Owner Approval Artifact reference coherence,
  duplicate-ID and Seed-version-consistency checks), Bootstrap Ready
  structural checks, and a small set of mechanically unambiguous
  contradiction checks. It validates project-state directories (fixtures,
  for v0.1), not a live `.aiom/` directory.
- Transition & Approval Kernel (`src/kernel/transition/`) — a read-only
  Transition Gate that deterministically evaluates one proposed Work Item
  transition at a time against a small, bounded, proving-only rule set:
  whether the transition's structural prerequisites (validation state,
  blocker state, source stage) hold, whether a referenced Atomic
  Capability is activated (never conflated with being authorized), and
  whether required Owner authorization is mechanically provable from an
  approved, structurally matching Owner Approval Artifact. It never
  decides whether a transition *should* happen, never grants authority,
  and never mutates project state — see `src/kernel/transition/gate.ts`.
- Runtime Probe (`src/kernel/runtime/`) — structured, evidence-backed,
  provider-neutral Runtime Evidence (`available` / `unavailable` /
  `unknown`) over a small, bounded Runtime Requirement ID vocabulary
  (`filesystem-read`, `filesystem-write`, `process-execution`,
  `repository-read`, `repository-write`, `network-access`), produced by a
  `RuntimeAdapter` behind which any provider-specific inspection mechanism
  must sit. A bounded, side-effect-safe Claude Code / Node.js adapter
  (`src/kernel/runtime/adapters/node.ts`) is the first proving adapter;
  Core/kernel consumers depend only on the `RuntimeAdapter` interface and
  `RuntimeEvidence`, never on provider identity. Evidence is ephemeral —
  produced per evaluation, never written into durable project state.
- Runtime-Neutral Orchestration foundation (`src/kernel/orchestration/`) —
  a read-only function that composes project validation, the Transition
  Gate, and, when supplied, Runtime Evidence into one of a small set of
  governed dispositions (e.g. `awaiting-owner-authorization`,
  `blocked-by-runtime`, `runtime-unknown`, `requires-qualitative-judgment`,
  `ready-for-governed-execution`). It reasons about what is known,
  blocked, or unresolved; it never grants authority, executes work, or
  duplicates validator/gate logic — see `src/kernel/orchestration/orchestrate.ts`.
- Project Bootstrap v0.1 (`seed/bootstrap.md`, `src/kernel/bootstrap/`) —
  the first executable Bootstrap flow: deterministic mechanics
  (`src/kernel/bootstrap/`) that validate, assemble, and — only in
  controlled synthetic/test destinations, never live in `mwd-aiom` —
  materialize a candidate Project Profile, Capability Activation Record,
  and first Governed Work Item from a reasoning contract
  (`BootstrapReasoningDecisions`), plus provider-neutral process guidance
  (`seed/bootstrap.md`) for whichever runtime performs that reasoning.
  Bootstrap composes Kernel Validation, the Transition Gate, the Runtime
  Probe, and the Orchestrator; it performs no bundle-relevance,
  capability-activation, or Bootstrap-Ready reasoning itself — see
  `seed/README.md` and `src/kernel/bootstrap/types.ts`.
- Project-facing runtime discovery (`seed/templates/project-agents.md`,
  `seed/templates/project-claude.md`) — the minimal, generated
  AGENTS.md/CLAUDE.md pointer a Bootstrap-materialized project receives,
  so a fresh runtime can locate that project's own `.aiom/` state and
  `.aiom/seed/` guidance without this repository's development
  instructions or prior conversational context.

No project other than a controlled synthetic Bootstrap test destination
has a live `.aiom/` directory — `mwd-aiom` itself never does. Capability
relevance, activation, runtime availability, and authorization remain
distinct — this repository defines what capabilities are, not which are
turned on for a given project; the Kernel Validation validator checks
that recorded decisions reference known IDs coherently, not whether those
decisions themselves are correct; the Transition Gate checks structural
eligibility and provable authorization, not whether a transition is
strategically wise; the Runtime Probe reports only mechanically
discoverable facts about the current runtime, never authorization; the
Orchestrator composes those facts into a bounded disposition, never an
execution decision; and Bootstrap determines governed project
configuration, never the product itself — it does not generate
application source code and does not select a framework or stack unless
later governed work and project evidence justify that choice.

## What this is not

- Not an application starter or product template
- Not a web-app starter
- Not an autonomous multi-agent platform
- Not a fixed Bootstrap questionnaire or project generator — Bootstrap
  inspects before asking and determines operating configuration, not
  application source code
- Not an autonomous product manager — Bootstrap surfaces one Next
  Governed Action and stops at Owner-authority boundaries; it does not
  build a backlog or decide strategic work on the Owner's behalf
- Not architecturally tied to Claude Code — Claude Code is the first proving
  runtime, not part of the AIOM definition
- Not a copy of, or a fork from, the Portfolio proof-of-concept repository

## Architecture direction

The intended shape of the full architecture, most of which is **not yet
implemented**:

```
AIOM Core
  → AIOM Core Seed              (foundation implemented — see seed/)
  → Project Bootstrap           (v0.1 implemented — see seed/bootstrap.md, src/kernel/bootstrap/)
  → Project Profile             (template + schema implemented — see seed/templates/)
  → Capability Bundles          (definitions implemented — see seed/capabilities/)
  → Atomic Capabilities         (definitions implemented — see seed/capabilities/)
  → Capability Activation Record (template + schema implemented — see seed/templates/)
  → Governed Work                (template + schema implemented — see seed/templates/)
  → Owner Approval Artifact      (template + schema implemented — see seed/templates/)
  → Kernel Validation            (deterministic validator implemented — see src/kernel/validation/)
  → Transition Gate              (implemented — see src/kernel/transition/)
  → Runtime Probe                (implemented — see src/kernel/runtime/)
  → Runtime-Neutral Orchestration (foundation implemented — see src/kernel/orchestration/)
  → Project Action / Handoff    (not yet implemented)
```

AIOM Core defines responsibilities — how Owner authority, AI reasoning,
bounded capabilities, deterministic controls, lifecycle state, controlled
handoff, and durable knowledge interact to move work from incomplete intent
toward validated, authorized outcomes. Modules, adapters, configuration,
runtimes, and project implementations define the mechanisms that carry
those responsibilities out. This repository builds the shared, versioned
mechanisms; individual projects consume them.

## Current status

- AIOM/repository implementation version: **experimental v0.1**
- Current implementation progress: **Initiative 11 — Approval Artifact
  Enforcement Coverage — complete**; see
  `docs/decisions/observations/2026-08-21-authority-evidence-warning-mirrors-approval-scope-structural-boundary.md`
  for the recorded evidence.
- Next roadmap increment: **Initiative 12 — Work Item Evidence and
  Completion Integrity** (not started)

## Implementation roadmap

Planned bounded increments (this sequence may split further as
implementation evidence warrants):

1. Repository Foundation — done
2. AIOM Core Seed Foundation — done
3. Capability Architecture — done
4. Project State Templates & Schemas — done
5. Kernel Validation — done
6. Transition & Approval Kernel — done
7. Runtime Probe + Runtime-Neutral Orchestration — done
8. Bootstrap Execution + Synthetic End-to-End Proof — done
9. Simple Greenfield Project POC — done
10. Runtime Invocation Adapter — done
11. Approval Artifact Enforcement Coverage — done
12. Work Item Evidence and Completion Integrity
13. Session-Boundary State Validation
14. Governance-File Provenance Detection
15. Delivery Authorization-Chain Gate

Initiatives 10–15 follow directly from Initiative 9's closing evidence
(`docs/decisions/observations/2026-08-21-initiative-9-greenfield-poc-closure.md`)
and are not yet designed. Sequencing:

1. **Runtime Invocation Adapter** (10) — first, since 11–15 all assume a
   supported way to invoke Bootstrap/kernel operations against a real
   external project exists.
2. **Approval Artifact Enforcement Coverage** (11) and **Work Item
   Evidence and Completion Integrity** (12) — next, and may proceed in
   parallel with each other; both extend existing validation/schema
   coverage and do not depend on each other.
3. **Session-Boundary State Validation** (13) — after 10, since it needs
   a supported invocation path to routinely re-run against live state.
4. **Governance-File Provenance Detection** (14).
5. **Delivery Authorization-Chain Gate** (15) — last, since a delivery
   gate over the authority/evidence chain presumes 11–13 exist to produce
   a trustworthy chain to check.

### Initiative 10 — Runtime Invocation Adapter — done

- **Problem:** real sessions and Owners have no supported way to invoke
  Bootstrap and kernel operations against an external project — Initiative
  9 used an ad hoc reasoning-to-contract bridge assembled for the
  experiment, not a repeatable mechanism.
- **Initiative 9 evidence:** finding 1 (no clean external Bootstrap/runtime
  invocation path).
- **Scope boundary:** invocation/packaging only — does not redesign
  Bootstrap's reasoning contract or kernel logic.
- **Major dependency:** none outstanding; can start first.
- **Success condition:** a session or Owner can invoke Bootstrap against a
  real external project through a supported mechanism, without an
  ad hoc bridge assembled per project. Met — see
  `docs/decisions/adr/0001-runtime-invocation-and-distribution-boundary.md`;
  falsified against a `pnpm pack`-installed artifact in a genuinely
  separate scratch project (`tests/packaging/pack.test.ts` and a manual
  external-repository POC covering all four operations).
- **ADR:** yes —
  `docs/decisions/adr/0001-runtime-invocation-and-distribution-boundary.md`.

### Initiative 11 — Approval Artifact Enforcement Coverage — done

- **Problem:** general project validation does not ensure that Work Items
  carrying an Owner-authority requirement have a valid, matching Owner
  Approval Artifact.
- **Initiative 9 evidence:** finding 3 (validation does not cover all
  Owner-authority integrity requirements).
- **Scope boundary:** extends validation coverage; does not change the
  Transition Gate's existing, separately-evidenced authority logic (see
  the closure observation's correction section).
- **Major dependency:** none blocking; ran independently of Initiative 12.
- **Success condition:** validation flags a Work Item with an
  authority requirement lacking a valid covering Approval Artifact,
  without invoking the Transition Gate to do so. Met — a new
  `src/kernel/validation/authority.ts` module, composed into
  `validateProjectState`, emits a warning-severity
  `owner-authorization-unproven` issue whenever a Work Item declares
  `authority_requirement: owner-authorization-required` and no
  successfully parsed, `approved`, unexpired Owner Approval Artifact is
  bound to it via `related_work_item_id`; `ValidationResult.valid`
  remains `true` on the warning alone, and Transition Gate/Orchestrator
  behavior is unchanged (see
  `docs/decisions/observations/2026-08-21-authority-evidence-warning-mirrors-approval-scope-structural-boundary.md`).
- **ADR:** no — extended an existing validation rule; no new
  architectural decision was required.

### Initiative 12 — Work Item Evidence and Completion Integrity

- **Problem:** completion and evidence claims on a Work Item are too
  weakly structured to validate reliably; `cmr-site` reached invalid
  frontmatter state without detection.
- **Initiative 9 evidence:** finding 4 (schema-invalid Work Item
  frontmatter went undetected) and finding 5 (evidence/completion
  integrity is insufficiently structured).
- **Scope boundary:** Work Item evidence/completion schema and validation
  only; does not redesign the broader Work Item lifecycle.
- **Major dependency:** none blocking; can run in parallel with
  Initiative 11.
- **Success condition:** a Work Item shaped like `cmr-site`'s
  `define-cmr-v1-scope.md` fails validation instead of passing silently.
- **ADR likely:** possibly — evidence-contract changes to a durable
  artifact schema may warrant one; to be decided when this initiative is
  actually scoped, not now.

### Initiative 13 — Session-Boundary State Validation

- **Problem:** nothing requires a live session to revalidate durable
  project state at meaningful boundaries, so a session can operate
  against `.aiom/` state that has silently drifted invalid.
- **Initiative 9 evidence:** finding 2 (no routine reconnection to the
  kernel after Bootstrap) and finding 8 (fresh sessions trust durable
  state more than they verify it).
- **Scope boundary:** when/how existing validation is invoked during a
  session; does not add new validation rules itself (those come from
  Initiatives 11–12).
- **Major dependency:** Initiative 10, for a supported invocation path to
  call.
- **Success condition:** a session boundary (e.g. session start, before a
  transition) routinely triggers existing validation against current
  `.aiom/` state, and surfaces drift rather than silently trusting it.
- **ADR likely:** no, expected to be an invocation/process change; to be
  confirmed when scoped.

### Initiative 14 — Governance-File Provenance Detection

- **Problem:** implementation tooling can mutate AIOM/governance-adjacent
  files without any mechanism detecting or flagging the change.
- **Initiative 9 evidence:** finding 6 (tooling mutated governance-adjacent
  files outside AIOM awareness).
- **Scope boundary:** detection/flagging only; does not itself prevent or
  roll back such mutations.
- **Major dependency:** benefits from Initiative 13's session-boundary
  hook existing, though not strictly blocked by it.
- **Success condition:** an unexpected change to a governance-adjacent
  file is surfaced at a session boundary rather than passing unnoticed.
- **ADR likely:** no, expected to be a detection mechanism; to be
  confirmed when scoped.

### Initiative 15 — Delivery Authorization-Chain Gate

- **Problem:** no implemented delivery-time mechanism verifies that the
  authority/evidence chain for the work being delivered is actually valid.
- **Initiative 9 evidence:** finding 7 (no implemented Git Delivery gate
  exists; the Initiative 9 readiness audit was manual, not enforced).
- **Scope boundary:** a delivery-time gate; does not redesign the
  authority/evidence chain itself (that is Initiatives 11–12's scope).
- **Major dependency:** Initiatives 11 and 12, so the gate has a
  trustworthy authority/evidence chain to check.
- **Success condition:** delivery is mechanically blocked when the
  authority/evidence chain for the delivered work is invalid or missing,
  not just withheld by manual audit.
- **ADR likely:** yes — a delivery-time gate is an architectural decision,
  to be made when this initiative actually begins.

## Validation

Requires Node.js 22+ and pnpm (see `.nvmrc` and the `packageManager` field
in `package.json`).

```sh
pnpm install
pnpm validate
```

`pnpm validate` runs, in order:

- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest

CI (`.github/workflows/ci.yml`) runs the same `pnpm validate` command after
a frozen-lockfile install; it does not contain independent validation logic.
