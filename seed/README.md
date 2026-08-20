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
  content a consuming project copies.

## What is not implemented yet

This Seed defines Core, safeguards, the Capability Architecture, and the
project-state artifact templates/schemas only. It does not yet include
Project Bootstrap, Bootstrap Ready validation logic, a full validator,
Transition Gate, cross-file referential integrity checks, a Runtime
Probe, runtime adapters, or any runtime-specific (e.g. Claude Code)
instructions. `.aiom/` is not created as live state anywhere in this
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
