# pnpm blocks dependency build scripts by default (pnpm 11)

**Date:** 2026-08-20
**Context:** Repository Foundation — first `pnpm install`

## Finding

With pnpm 11 (installed here as 11.17.0), `pnpm install` ignores postinstall
build scripts for dependencies by default and reports
`[ERR_PNPM_IGNORED_BUILDS]` rather than failing silently. In this
repository, Vitest's transitive dependency `esbuild` needs its postinstall
script to fetch its platform binary.

Running `pnpm approve-builds esbuild` records the approval in a generated
`pnpm-workspace.yaml` (`allowBuilds: { esbuild: true }`) and runs the
script. That file must be committed — without it, a fresh
`pnpm install --frozen-lockfile` (as used in CI) re-applies the same
default-deny behavior.

## Why this matters

A future contributor or CI run doing a clean install could see Vitest fail
in a confusing way (missing esbuild binary) if `pnpm-workspace.yaml` is
ever removed or regenerated without the approval, since the failure surfaces
at `vitest run` rather than at `pnpm install`.
