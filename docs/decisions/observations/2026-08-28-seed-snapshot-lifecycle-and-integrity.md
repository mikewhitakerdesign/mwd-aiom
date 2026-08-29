# Materialized `.aiom/seed/*` was never validated by the deterministic kernel, its lifecycle was undefined, and a sound integrity check exists only under a same-version condition

**Date:** 2026-08-28
**Context:** Initiative 14 — Seed Snapshot Integrity (originally scoped as "Governance-File Provenance Detection")

## Why this record exists

Initiative 9's finding 6 ("tooling mutated governance-adjacent files outside
AIOM awareness") motivated a roadmap entry for general provenance
detection. A dedicated investigation found that claim too thin to build
from directly — it is a single, unelaborated observation from one
external, never-committed proving project (`cmr-site`), with no second
occurrence anywhere in this repository's evidence, and general mutation
*attribution* (who/what/why changed a file, or whether a change was
authorized) is not mechanically decidable with anything this architecture
has or could cheaply add. The investigation did surface a separate,
concrete, previously undocumented gap, recorded below as objective
findings 1–5. The Owner then resolved the open lifecycle question those
findings raised — recorded separately, at the end, as decision context
rather than as an independently discovered fact.

## Findings

1. **Materialized `.aiom/seed/*` was consumed by project-facing reasoning
   guidance but was not loaded or validated by the deterministic kernel.**
   `loadCapabilityIndex()` (`src/kernel/validation/capability-index.ts`)
   always reads the installed `mwd-aiom` package's own
   `seed/capabilities/*.md`, never a project's materialized
   `.aiom/seed/capabilities/*.md` copy; `loadProjectState`
   (`src/kernel/validation/project-state.ts`) never reads `.aiom/seed/`
   at all. The copy existed purely for an AI reasoning runtime's
   convenience (per the pointer in a materialized project's own
   `AGENTS.md`, generated from `seed/templates/project-agents.md`), with
   nothing cross-checking it.

2. **`.aiom/seed/*`'s lifecycle and version semantics were previously
   undefined.** No document specified whether the materialized copy was
   intended as a pinned snapshot, a live mirror, or a refreshable
   artifact with an upgrade process. `materializeSeedAssets`
   (`src/kernel/bootstrap/seed-assets.ts`) unconditionally overwrites it
   on every materialization call with no guard, while the sibling
   project-root `AGENTS.md`/`CLAUDE.md` pointer files use the opposite,
   brownfield-preservation pattern in the same file — an inconsistency
   nothing had reconciled.

3. **`seed_version` and the package/runtime version are distinct, unrelated
   values.** `SEED_VERSION` (originally `src/kernel/bootstrap/types.ts`,
   now `src/kernel/schemas/common.ts`) is a hardcoded constant (`'0.1'`)
   that has never changed since it was introduced; `package.json`'s
   `"version"` (`'0.1.0'`, exposed via `resolveRuntimeVersion()` in
   `src/invocation/version.ts`) is resolved independently and used only
   for `aiom.version` in invocation responses. Nothing in the codebase
   cross-references the two.

4. **The installed package retains no historical canonical Seed assets.**
   `package.json`'s `"files"` field ships exactly one `seed/` tree — the
   current one — with no version-indexed subdirectories, no Git tags
   (`git tag -l` returns empty), and no changelog. A project's installed
   `mwd-aiom` package cannot reconstruct the canonical Seed content that
   applied at any earlier `seed_version`.

5. **Therefore, comparing a materialized `.aiom/seed/*` snapshot against
   the installed package's current canonical `seed/` is mechanically
   sound only when the project's recorded `seed_version` equals the
   installed package's `SEED_VERSION`.** Outside that condition, the
   installed package cannot distinguish local mutation from legitimate
   Seed evolution (finding 4), so no comparison can be attempted without
   risking a false positive on every ordinary `mwd-aiom` upgrade.

## Resolution: the Owner's decided `.aiom/seed/*` lifecycle

Given findings 1–5, the Owner resolved the previously undefined lifecycle
question (finding 2) by adopting a **pinned Bootstrap-time snapshot**
model for `.aiom/seed/*`: not a live mirror, not automatically refreshed
when the installed package changes, and not governed by any Seed
upgrade/migration mechanism. This is the decision this initiative
implements against — `src/kernel/validation/seed-snapshot-integrity.ts`
performs the finding-5 comparison only when `seed_version` matches, and
performs no comparison, upgrade recommendation, or staleness signal
otherwise. Seed version-management (what should happen when a project's
`seed_version` falls behind the installed package) remains a distinct,
unaddressed concern, deliberately left out of this initiative.
