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

At this stage (**AIOM Core Seed Foundation**), this repository contains:

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

It does **not** yet contain a Runtime Probe, and no project — including
this one — has a live `.aiom/` directory. Capability relevance,
activation, runtime availability, and authorization remain distinct —
this repository defines what capabilities are, not which are turned on
for a given project; the Kernel Validation validator checks that recorded
decisions reference known IDs coherently, not whether those decisions
themselves are correct; and the Transition Gate checks structural
eligibility and provable authorization, not whether a transition is
strategically wise. Nothing here should be read as an implementation of
relevance, activation, runtime-availability, or "should this proceed"
decision logic until a later initiative adds it.

## What this is not

- Not an application starter or product template
- Not a web-app starter
- Not an autonomous multi-agent platform
- Not architecturally tied to Claude Code — Claude Code is the first proving
  runtime, not part of the AIOM definition
- Not a copy of, or a fork from, the Portfolio proof-of-concept repository

## Architecture direction

The intended shape of the full architecture, most of which is **not yet
implemented**:

```
AIOM Core
  → AIOM Core Seed              (foundation implemented — see seed/)
  → Project Bootstrap           (not yet implemented)
  → Project Profile             (template + schema implemented — see seed/templates/)
  → Capability Bundles          (definitions implemented — see seed/capabilities/)
  → Atomic Capabilities         (definitions implemented — see seed/capabilities/)
  → Capability Activation Record (template + schema implemented — see seed/templates/)
  → Governed Work                (template + schema implemented — see seed/templates/)
  → Owner Approval Artifact      (template + schema implemented — see seed/templates/)
  → Kernel Validation            (deterministic validator implemented — see src/kernel/validation/)
  → Transition Gate              (implemented — see src/kernel/transition/)
  → Runtime Probe                (not yet implemented)
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
- Current implementation progress: **Initiative 6 — Transition & Approval
  Kernel — complete**
- Next roadmap increment: **Initiative 7 — Runtime Probe +
  Runtime-Neutral Orchestration**

## Implementation roadmap

Planned bounded increments (this sequence may split further as
implementation evidence warrants):

1. Repository Foundation — done
2. AIOM Core Seed Foundation — done
3. Capability Architecture — done
4. Project State Templates & Schemas — done
5. Kernel Validation — done
6. Transition & Approval Kernel — done
7. Runtime Probe + Runtime-Neutral Orchestration
8. Fixtures, Documentation & End-to-End v0.1 Proof

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
