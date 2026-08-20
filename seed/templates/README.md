# Project State Templates (v0.1)

## What this is

Reusable, provider-neutral starting points for the four durable,
project-local state artifacts a future Project Bootstrap will create under
a consuming project's own `.aiom/` directory:

- [`project-profile.md`](./project-profile.md) → `.aiom/profile.md`
- [`capabilities.yaml`](./capabilities.yaml) → `.aiom/capabilities.yaml`
- [`work-item.md`](./work-item.md) → `.aiom/work/<work-item-id>.md`
- [`approval.yaml`](./approval.yaml) → `.aiom/approvals/<approval-id>.yaml`

Each template parses and validates against its schema in
`src/kernel/schemas/`, but is intentionally incomplete: string fields wrap
placeholder prose in `<angle brackets>`; structured fields (enums,
statuses) carry the most honest default for a project that has not yet
been assessed — usually `unknown`, `unresolved`, or `deferred`, not a
guess. IDs use obviously fake placeholders (`example-bundle-id`,
`example-work-item`, `example-approval`) rather than bracketed prose,
because ID fields are validated as kebab-case identifiers and must remain
schema-conformant.

None of these templates encode Proper Copper, Portfolio, or any other
specific project's domain assumptions — they are provider- and
project-neutral by design.

## Design notes carried over from Falsification Gate A

- **No `profile_version` field.** Git history already provides revision
  history for repository-backed files; `seed_version` alone identifies
  which Seed a profile targets (per `AGENTS.md`'s versioning convention).
- **Signals use four states, confirmations use three.** The nine
  composable Project Profile signals (`true` / `false` / `unknown` /
  `not-applicable`) can be genuinely not-applicable to a given project.
  The two fixed consequence confirmations (`yes` / `no` / `unresolved`)
  are universal by definition — every project has a yes/no/unresolved
  answer for consequential external action and sensitive data, so a
  `not-applicable` state would carry no meaning there.
- **Bundle relevance and capability activation have different provenance
  requirements.** A bundle is never itself activated or authorized — see
  `seed/capabilities/README.md` — so bundle-relevance provenance is
  optional. Capability activation status feeds real decisions about what
  gets turned on, so its provenance is required.
- **`lifecycle_position` is an open string, not an enum.** The
  architecture explicitly does not freeze a universal product-development
  lifecycle. A project may use whatever value is meaningful to it (e.g.
  `research`, `active-development`, `paused`); the schema only requires a
  non-empty string.
- **Work Item `stage` is a bounded, proving-only vocabulary**
  (`research` / `implementation` / `validation` / `approval` / `delivery`
  / `handoff`), not universal AIOM lifecycle architecture. It is expected
  to be revisited once Initiative 5+ exercises real transitions.
- **`current_responsibility` reuses AIOM Core's own responsibility
  boundaries** (`owner` / `orchestrator` / `specialist-capability`, see
  `seed/core.md#responsibility-boundaries`) instead of inventing a
  parallel assignee vocabulary.
- **No stale runtime truth.** Where a `runtime_requirement*` field exists
  on the Project Profile or a Work Item, it records a stable, abstract
  requirement (e.g. "requires repository-write"), never a probe result —
  the Runtime Probe (`src/kernel/runtime/`) produces ephemeral evidence
  per evaluation, kept separate from this durable field, not written back
  into it. These free-text fields remain unconstrained prose by design;
  only a value that happens to equal one of the Runtime Probe's bounded
  Runtime Requirement IDs (see
  [`../../src/kernel/runtime/requirements.ts`](../../src/kernel/runtime/requirements.ts))
  is mechanically comparable against evidence — see the Initiative 7
  completion report for why this was not tightened into an enum.
