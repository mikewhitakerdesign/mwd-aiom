# The existing import.meta.url-relative canonical AIOM asset resolution survived compiled packaging and independent installation without kernel changes

**Date:** 2026-08-21
**Context:** Initiative 10 — Runtime Invocation Adapter; see [`docs/decisions/adr/0001-runtime-invocation-and-distribution-boundary.md`](../adr/0001-runtime-invocation-and-distribution-boundary.md)

## Finding

Before Initiative 10, `loadCapabilityIndex()`
(`src/kernel/validation/capability-index.ts`) and the Seed-asset
materializers (`src/kernel/bootstrap/seed-assets.ts`) located this
repository's `seed/` directory by resolving a fixed relative path from
each module's own `import.meta.url`. The Initiative 10 investigation
identified this as a coupling risk: an installed, compiled package would
only resolve `seed/` correctly if the distributed artifact preserved the
same relative directory depth between the compiled module and `seed/`
that already held in source form.

That risk did not materialize, and no kernel code change was made to
address it. The only change was a packaging guarantee —
`package.json`'s `"files"` field lists `["dist", "seed"]`, so `pnpm pack`
includes `seed/` as a sibling of `dist/` exactly as it already sits as a
sibling of `src/` at the repository root, and `tsconfig.build.json`
compiles `src/kernel/**` to `dist/kernel/**` preserving the same
directory depth. This was verified, not assumed, end to end:

1. `pnpm pack` produced a real tarball of the built package.
2. The tarball was installed via `npm install <tarball>` into a scratch
   consumer project with no relationship to this repository (a fresh
   `npm init -y` project in an unrelated temporary directory).
3. `loadCapabilityIndex()` correctly resolved and parsed
   `node_modules/mwd-aiom/seed/capabilities/{bundles,capabilities}.md`
   from that installed location — confirmed by a materialized
   `.aiom/capabilities.yaml` entry (`research-discovery`) resolving with
   no `unresolved-capability`-shaped validation error, and by the copied
   `.aiom/seed/capabilities/bundles.md` containing real, non-empty
   content (`"Capability Bundle"` present, not a truncated or missing
   file).
4. Seed materialization (`materializeSeedAssets`,
   `materializeProjectInstructions`) wrote `core.md`, `safeguards.md`,
   `capabilities/bundles.md`, `capabilities/capabilities.md`, and
   generated `AGENTS.md`/`CLAUDE.md` correctly into a genuinely external
   project directory, using only the installed package's own bundled
   `seed/` — never referencing this repository's own path.
5. `bootstrap`, `validate`, `transition`, and `orchestrate` were each
   run at least once through the installed CLI against externally
   materialized state (`bootstrap`/`validate` in the automated packaging
   test, `tests/packaging/pack.test.ts`; all four in a manual
   external-repository falsification exercise), with no operation
   depending on anything beyond the installed package.

Because this held without modification, Initiative 10 did not introduce a
new asset-resolution abstraction (e.g. a runtime asset-context object
passed into kernel functions, an environment variable, or a
caller-supplied override as the default path). The existing override
parameters (`buildCapabilityIndex(bundlesMarkdown, capabilitiesMarkdown)`,
`materializeSeedAssets(dir, seedSourceDir?)`,
`materializeProjectInstructions(dir, templatesDir?)`) remain unchanged and
continue to serve only as an escape hatch for an unusual caller, not as
the normal path.

## Why this matters

This is the single piece of evidence Initiative 10's architecture rests
on for the claim that canonical Seed/reference assets travel with the
runtime without requiring a caller to know `mwd-aiom`'s source layout. A
future editor should not read it more broadly than what was tested: the
verification covers `pnpm pack` / `npm install` of a `.tgz` tarball into a
Node/npm `node_modules` layout on this platform, with `tsc`'s default
`rootDir`/`outDir` behavior. It does not establish that the same relative-path
resolution survives every possible bundler, a different packaging format
(e.g. a single-file bundle that flattens directory structure), a
non-Node runtime, or a deployment environment that does not preserve a
package's own internal file layout (e.g. certain serverless bundling
pipelines). Any future change to how this package is built or
distributed should re-verify this assumption rather than assume it still
holds, ideally by re-running or extending
[`tests/packaging/pack.test.ts`](../../../tests/packaging/pack.test.ts).
