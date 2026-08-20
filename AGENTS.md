# AGENTS.md

## What this repository is

`mwd-aiom` is the source repository for the AIOM Core Seed and Minimal
Executable Kernel — a human-governed, AI-assisted operating architecture for
bootstrapping, governing, validating, resuming, and evolving digital-product
and automation work.

This repository is currently at **Repository Foundation** stage (v0.1). The
AIOM Core Seed, Capability Bundles, Atomic Capabilities, project-state
templates and schemas, validator, and Runtime Probe do not exist yet.
Nothing in this repository implements the AIOM architecture until later
initiatives land it — see `README.md` for the current roadmap.

## How repository guidance is organized

Durable instructions for working on this repository are **provider-neutral**
and live here, in `AGENTS.md`. Any AI runtime working on this repository —
Claude Code or otherwise — should read this file first.

Runtime-specific files (e.g. `CLAUDE.md`) are thin pointers back to this
file. They must not fork governance policy per runtime.

As the AIOM Core Seed and its own governance/architecture instructions are
implemented in later initiatives, they will live under `seed/` and
`docs/decisions/`. This file will be updated to point to them rather than
duplicating their content.

## Authority and scope

- Technical capability does not grant authority. An AI runtime being able to
  execute a change is not the same as being authorized to make it.
- Consequential decisions — scope changes, architecture direction, schema
  design, what gets built next — remain Owner-authorized. When in doubt
  whether something is consequential, treat it as consequential.
- Work in this repository must be bounded to what was actually requested and
  validated before being considered complete. Do not pre-build future
  initiatives' content, directory structure, or files "to save time later."

## Working on this repository

- Run `pnpm validate` before considering any change complete. It aggregates
  lint, typecheck, and test.
- Prefer small, reviewable changes scoped to one initiative at a time.
- This repository is building its own decision history from zero. See
  `docs/decisions/README.md` for how evidence, reflection, and decisions are
  recorded here. Do not import decision records from other repositories —
  they belong to their own history.
- The implementation roadmap lives in `README.md`. Do not re-sequence or
  expand it without Owner sign-off.
- Except for this repository's zero-commit bootstrap initiative, all work
  proceeds on a feature branch with a pull request — not directly on `main`.
