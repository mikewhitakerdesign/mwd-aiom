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

## What is not implemented yet

This Seed is foundation only. It does not yet include Project Bootstrap,
Bootstrap Ready logic, Project Profile, `.aiom/`, Capability Bundle or
Atomic Capability definitions, capability activation records, Governed
Work Item templates, Owner Approval Artifact templates, schemas, parser or
validator logic, transition logic, a Runtime Probe, runtime adapters, or
any runtime-specific (e.g. Claude Code) instructions. See the repository
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
