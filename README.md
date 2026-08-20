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

At this stage (**Repository Foundation**), this repository contains only
the repository, tooling, and governance scaffolding needed to do further
work safely:

- Provider-neutral repository guidance (`AGENTS.md`) and a Claude
  Code-specific pointer (`CLAUDE.md`)
- A TypeScript / Node.js / pnpm tooling baseline (lint, typecheck, test)
- A decisions structure (`docs/decisions/`) for this repository's own
  future ADRs, observations, and journal entries
- Minimal CI that runs the same validation available locally

It does **not** yet contain the AIOM Core Seed, Capability Bundles, Atomic
Capabilities, `.aiom/` project-state templates, schemas, a validator, or a
Runtime Probe. Nothing here should be read as an implementation of those
until a later initiative adds it.

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
  → AIOM Core Seed              (not yet implemented)
  → Project Bootstrap           (not yet implemented)
  → Project Profile             (not yet implemented)
  → Capability Bundles          (not yet implemented)
  → Atomic Capabilities         (not yet implemented)
  → Governed Work                (not yet implemented)
  → Validation / Approval / Runtime  (not yet implemented)
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

`v0.1 — Repository Foundation`

## Implementation roadmap

Planned bounded increments (this sequence may split further as
implementation evidence warrants):

1. Repository Foundation
2. AIOM Core Seed Foundation
3. Capability Architecture
4. Project State Templates & Schemas
5. Kernel Validation
6. Transition & Approval Kernel
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
