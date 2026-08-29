# MWD AIOM

## What this is

`mwd-aiom` is the source repository for the AIOM Core Seed and Minimal
Executable Kernel — a human-governed, AI-assisted operating model (AIOM) for
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

The intended shape of the full architecture model, most of which is **not yet
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
- Current implementation progress: **Initiative 15 — Delivery
  Authorization-Chain Gate — closed, no implementation** (see the
  Initiative 15 roadmap entry below for the investigation finding and
  disposition).
- The dedicated AIOM v0.1 baseline assessment remains the next step and
  is not performed as part of Initiative 15 closure.

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
12. Work Item Evidence and Completion Integrity — done
13. Session-Boundary State Validation — done
14. Seed Snapshot Integrity — done
15. Delivery Authorization-Chain Gate — closed, no implementation

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
4. **Seed Snapshot Integrity** (14).
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

### Initiative 12 — Work Item Evidence and Completion Integrity — done

- **Problem:** a Work Item's `status` field could claim `complete` while
  its own `validation_state` field recorded that validation had not
  passed, and general project validation did not treat that combination
  as invalid.
- **Initiative 9 evidence:** finding 5 (Work Item completion/evidence
  integrity is insufficiently structured). Finding 4 (the schema-invalid
  `cmr-site` frontmatter) was investigated and attributed to Initiative
  13 instead: the Work Item schema already would have rejected that
  frontmatter had the validator been invoked, so that finding is a
  validation-invocation gap, not a Work Item structural gap.
- **Scope boundary:** narrower than the initiative's roadmap name. This
  increment implements Work Item completion-state integrity only — a
  `status: complete` Work Item must have `validation_state: passed`. It
  does not introduce a structured Work Item evidence model, evidence
  artifacts, or evidence-sufficiency validation; does not give
  `completion_handoff_criteria` any validated meaning; does not add a
  `status`/`stage` rule; and does not change the Work Item schema,
  Transition Gate, Orchestrator, or Bootstrap. The repository does not
  currently define enough structured evidence semantics to validate
  evidence sufficiency deterministically, so that broader scope was not
  attempted.
- **Major dependency:** none blocking; ran independently of Initiative 11.
- **Success condition:** a Work Item declaring `status: complete` with a
  `validation_state` other than `passed` fails validation instead of
  passing silently. Met — `src/kernel/validation/references.ts` now emits
  an error-severity `complete-item-validation-not-passed` issue for that
  combination, alongside and independent of the existing
  `complete-item-still-blocked` rule.
- **ADR:** no — extended an existing validation rule with the same shape
  as `complete-item-still-blocked`; no new architectural decision was
  required.

### Initiative 13 — Session-Boundary State Validation — done

- **Problem:** nothing required a reasoning episode to revalidate durable
  project state before treating it as trustworthy at a meaningful
  re-entry point, so a session could operate against `.aiom/` state that
  had silently drifted invalid. Not a literal runtime/chat session
  concept — no deterministic session abstraction exists or was created;
  the actual boundary is persisted-state re-entry, and the existing
  `Validate` operation is reused as-is.
- **Initiative 9 evidence:** finding 2 (no routine reconnection to the
  kernel after Bootstrap), finding 4 (`cmr-site` accumulated
  schema-invalid Work Item frontmatter that a validator invocation would
  have rejected — a validation-invocation-cadence gap, not a schema
  gap), and finding 8 (fresh sessions trust durable state more than they
  verify it).
- **Scope boundary:** when/how the existing `Validate` operation is
  invoked during a reasoning episode; adds no new public invocation
  operation, no new validation rule, and no persistent validation state
  (session ID, timestamp, hash, or receipt). Does not add deterministic
  Work Item create/update operations — their absence remains an
  acknowledged architecture/enforcement ceiling, out of this
  initiative's scope.
- **Major dependency:** Initiative 10, for a supported invocation path to
  call. Met.
- **Success condition:** the project-facing workflow contract
  (`seed/templates/project-agents.md`, materialized into every
  Bootstrap-managed project's own `AGENTS.md`) requires validating
  current `.aiom/` state before a fresh or resumed reasoning episode
  treats it as trustworthy for understanding project status, selecting
  work, making a governance decision, or proceeding with governed
  work — surfacing drift rather than silently trusting it. Met — a
  reasoning episode that follows the materialized contract revalidates
  at re-entry; Transition/Orchestrate already self-validate and need no
  redundant call; a fallback where `mwd-aiom` cannot be invoked requires
  treating state as explicitly unverified rather than substituting
  successful reasoning-based reconstruction for validation. This is a
  workflow-contract requirement, not a mechanically enforced one — AI
  runtime compliance itself is not mechanically guaranteed; see
  `docs/decisions/observations/2026-08-28-i13-workflow-contract-owns-validation-invocation-cadence.md`.
- **ADR:** no — a direct application of ADR 0001's own boundary
  (session-boundary invocation cadence "remains Initiative 13's
  responsibility"), not a new architectural decision.

### Initiative 14 — Seed Snapshot Integrity — done

- **Originally scoped as "Governance-File Provenance Detection."** A
  dedicated investigation (this initiative's preceding sessions) found
  that Initiative 9 finding 6 ("tooling mutated governance-adjacent files
  outside AIOM awareness") is a single, unelaborated observation from one
  external, never-committed proving project (`cmr-site`), with no second
  occurrence anywhere in this repository's evidence, and that general
  mutation *attribution* (who/what/why a file changed, or whether a
  change was authorized) is not mechanically decidable with anything this
  architecture has or could cheaply add — no actor identity exists
  anywhere in the invocation chain, and Git author identity does not
  equal causal mechanism. The investigation did surface one concrete,
  previously undocumented, mechanically decidable gap: `.aiom/seed/*`
  (the copy of Seed guidance Bootstrap materializes into every project)
  is consumed by the project-facing reasoning runtime but was never read
  or validated by the deterministic kernel, so it could silently drift
  from its own source with nothing noticing. The initiative was narrowed
  to that gap and renamed accordingly.
- **Problem:** a project's materialized `.aiom/seed/*` snapshot could
  diverge from the canonical Seed content it was materialized from, with
  no mechanism detecting it.
- **Initiative 9 evidence:** finding 6, narrowed as described above.
- **Approved `.aiom/seed/*` lifecycle:** a pinned Bootstrap-time snapshot
  — not a live mirror of the installed `mwd-aiom` package, not
  automatically refreshed when the package changes, and not currently
  governed by any Seed upgrade/migration mechanism. No such mechanism was
  designed or added by this initiative.
- **Scope boundary:** deterministic comparison only when a project's
  recorded `seed_version` is internally consistent and equals the
  installed package's `SEED_VERSION` — the only condition under which the
  installed package's own `seed/` is provably the exact canonical content
  the snapshot was materialized from. The installed package retains no
  historical Seed assets (no version-indexed registry, no Git tags, no
  changelog), so when Seed versions differ, no comparison is attempted
  and no conclusion is drawn — that case is Seed version-management, a
  separate, unaddressed concern this initiative deliberately leaves out.
  No mutation attribution, authorization inference, or delivery gating is
  performed; the project root `AGENTS.md`/`CLAUDE.md` pointer files are
  excluded, since their brownfield-preservation semantics mean they are
  *expected* to diverge from their template after Bootstrap.
- **Major dependency:** none blocking; reuses Initiative 13's re-entry
  validation boundary and Initiative 11's advisory-warning precedent.
- **Success condition:** when a project's Seed version matches the
  installed package's, `mwd-aiom validate` reports a warning-severity
  `seed-snapshot-mismatch` issue for any materialized `.aiom/seed/*` file
  that is missing or no longer byte-matches its canonical counterpart,
  without making `ValidationResult.valid` false and without changing
  Transition or Orchestrate eligibility. Met — see
  `src/kernel/validation/seed-snapshot-integrity.ts`, composed into
  `validateProjectState` (`src/kernel/validation/validate-project.ts`).
- **ADR:** no — an advisory validation rule of the same shape as
  Initiative 11's, plus a behavior-neutral relocation of the
  `SEED_VERSION` constant (`src/kernel/bootstrap/types.ts` →
  `src/kernel/schemas/common.ts`, re-exported unchanged) to avoid a
  `bootstrap` → `validation` → `bootstrap` dependency cycle; neither
  constitutes a new architectural decision. See
  `docs/decisions/observations/2026-08-28-seed-snapshot-lifecycle-and-integrity.md`.

### Initiative 15 — Delivery Authorization-Chain Gate — closed, no implementation

- **Original problem statement:** no implemented delivery-time mechanism
  verifies that the authority/evidence chain for the work being delivered
  is actually valid.
- **Initiative 9 evidence:** finding 7 (no implemented Git Delivery gate
  exists; the Initiative 9 readiness audit was manual, not enforced) — a
  single, unelaborated observation from one external, never-committed
  proving project (`cmr-site`), with no second occurrence anywhere in
  this repository's evidence.
- **Investigation finding:** a dedicated read-only architectural
  investigation (this initiative's own session) established that the
  existing `approval-to-delivery` Transition authority boundary
  (`src/kernel/transition/rules.ts`, evaluated in
  `src/kernel/transition/gate.ts`) already implements the narrowest
  mechanically sound authorization invariant identified by the I15
  investigation: it mechanically blocks a Work Item from becoming
  eligible to reach `stage: 'delivery'` without a covering, approved,
  unexpired Owner Approval Artifact. That mechanism was implemented by
  Initiative 6 (Transition & Approval Kernel) and has not changed since.
  Initiative 6 did not anticipate Initiative 15; Initiative 15 did not
  implement, add, or modify this mechanism — it investigated the later
  delivery-authorization hypothesis and found this pre-existing
  mechanism to be the narrowest invariant currently justified by
  repository evidence.
- **Disposition: closed, no new behavioral implementation.** No file
  under `src/` or `tests/` changed as a result of this initiative.
- **Explicitly deferred, not designed, not scheduled:** connecting this
  Work-Item-level boundary to any real Git/GitHub or other
  external-delivery action (merge, push, PR, deploy) remains an
  unimplemented, evidence-triggered concern — a future proving project
  would need to surface a concrete failure before such enforcement is
  designed. Detecting whether an approved Work Item's underlying work
  has materially changed since approval (stale authorization) is
  likewise explicitly outside this initiative's scope and unimplemented.
  Neither concern is represented here as solved, partially implemented,
  or committed future work.
- **Major dependency:** none — this initiative concluded via
  investigation, not implementation.
- **ADR:** no — no new architectural decision was adopted; the
  investigation concluded the existing architecture (Initiative 6)
  already covers the narrow invariant that can currently be justified.

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
