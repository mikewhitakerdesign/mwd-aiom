# AGENTS.md

## This project is AIOM-managed

This project's durable state is governed by MWD AIOM (see
`.aiom/seed/core.md`). Any AI runtime working on this project — Claude Code
or otherwise — should read this file, then `.aiom/seed/core.md` and
`.aiom/seed/safeguards.md`, before doing anything else. This file is
project-facing runtime-discovery guidance, generated at Bootstrap time — it
is not `mwd-aiom`'s own repository-development guidance, and it carries no
standing authority beyond what a specific session is actually granted.

## Where this project's durable state lives

- `.aiom/profile.md` — the Project Profile: what this project is, its
  Owner, its composable signals, and the two consequence confirmations
  (consequential external action; sensitive/high-consequence data).
- `.aiom/capabilities.yaml` — the Capability Activation Record: which
  Capability Bundles are relevant and which Atomic Capabilities are
  activated, each with its own status and provenance.
- `.aiom/work/` — Governed Work Items: the unit of in-flight, governed
  work. Read a Work Item's `stage`, `status`, `blocker_state`, and
  `authority_requirement` before acting on it.
- `.aiom/approvals/` — Owner Approval Artifacts: durable authorization
  evidence. A Work Item's `authority_requirement` is only satisfied by an
  `approved`, structurally matching Approval Artifact here — never by a
  capability being active or a runtime being available.
- `.aiom/seed/` — the reusable, provider-neutral AIOM Core Seed guidance
  this project depends on: `core.md` (Owner authority, operating
  principles, responsibility boundaries), `safeguards.md`, and
  `capabilities/bundles.md` / `capabilities/capabilities.md` (the
  Capability Architecture this project's `.aiom/capabilities.yaml`
  references by ID).

## Authority and scope

- Technical capability does not grant authority. Being able to execute a
  change is not the same as being authorized to make it — see
  `.aiom/seed/core.md#owner-authority`.
- Capability relevance, activation, runtime availability, and
  authorization are four distinct questions — see
  `.aiom/seed/capabilities/README.md` if present, or `.aiom/seed/core.md`.
- Consequential decisions remain Owner-authorized. When in doubt whether
  something is consequential, treat it as consequential.

## Validation and runtime evaluation

This project's durable state is designed to be validated and evaluated by
the deterministic AIOM kernel (Kernel Validation, the Transition &
Approval Gate, the Runtime Probe, and the Orchestrator) implemented in the
`mwd-aiom` source repository. As of this project's Bootstrap (AIOM v0.1),
that kernel is not yet published as an installable package — a runtime
working on this project without access to `mwd-aiom` should read
`.aiom/profile.md`, `.aiom/capabilities.yaml`, `.aiom/work/`, and
`.aiom/approvals/` directly and apply the same reasoning `.aiom/seed/`
describes, rather than assuming automated validation ran. Where `mwd-aiom`
is available, its `validateProjectState()` and `orchestrate()` functions
can evaluate this project's `.aiom/` directory directly.

## Current governed disposition

See the most recent Governed Work Item under `.aiom/work/` for what is
currently active and what — if anything — is blocking it.
