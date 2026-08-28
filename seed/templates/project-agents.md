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
Approval Gate, the Runtime Probe, and the Orchestrator). As of AIOM v0.1
(Initiative 10), that kernel has a supported invocation path: the
`mwd-aiom` command, installed from the `mwd-aiom` runtime package,
exposes four operations —

- `mwd-aiom bootstrap --project <path> --input <request.json>`
- `mwd-aiom validate --project <path>`
- `mwd-aiom transition --project <path> --input <request.json>`
- `mwd-aiom orchestrate --project <path> --input <request.json>`

— each returning one structured JSON document (`{"aiom", "operation",
"status", "result"}` on success; `{"aiom", "operation", "status",
"error"}` otherwise) suitable for a reasoning runtime to parse directly,
without opening or importing the `mwd-aiom` source repository. `--project`
always takes this project's root, not a raw `.aiom/` path — the command
resolves the state directory itself. A blocked, invalid, or indeterminate
result is still a normal, successful invocation (`"status": "ok"`); it is
the kernel's authoritative answer, not a failure to produce one.

Constructing the structured input `bootstrap`/`transition`/`orchestrate`
expect (in particular, the reasoning decisions Bootstrap needs) remains
this session's own responsibility — the command validates and executes
that input, it does not interpret Owner intent or perform Bootstrap
reasoning itself.

## State re-entry: validate before trusting persisted state

Before a fresh or resumed reasoning episode treats this project's existing
`.aiom/` state as trustworthy input — to understand project status, select
or continue a Work Item, make a governance decision, or proceed with
governed work — it must invoke `mwd-aiom validate --project <path>` and
confirm the result before continuing. Any reported error blocks governed
continuation until the underlying state is corrected and validation is
re-run successfully; a result carrying only warnings (for example
`owner-authorization-unproven`) does not block continuing.

This governs re-entry into existing state; it does not require re-running
`validate` immediately before `transition` or `orchestrate`, since both
already perform deterministic project-state validation internally as part
of evaluating any proposed transition. A `bootstrap` invocation's own
returned `validation` result must be honored the same way — unresolved
errors there must be resolved before treating the newly materialized state
as governed-ready.

Where `mwd-aiom` is not installed or otherwise cannot be invoked, a session
may still read `.aiom/profile.md`, `.aiom/capabilities.yaml`,
`.aiom/work/`, and `.aiom/approvals/` directly and apply the same
reasoning `.aiom/seed/` describes — but that reading is inspection, not
validation, and must not be treated as if deterministic validation had run
or passed. Successful reasoning-based reconstruction of project
understanding is not evidence that the underlying state is actually
valid. In this case the session must explicitly treat `.aiom/` state as
unverified, escalate the inability to perform deterministic validation to
the Owner rather than silently proceeding, and must not treat governed
work as ready to continue on the strength of that reasoning alone.

## Current governed disposition

See the most recent Governed Work Item under `.aiom/work/` for what is
currently active and what — if anything — is blocking it.
