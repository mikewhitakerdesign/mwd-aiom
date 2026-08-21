# 0001: Runtime Invocation and Distribution Boundary for the Deterministic AIOM Kernel

**Status:** accepted
**Date:** 2026-08-21
**Context:** Initiative 10 — Runtime Invocation Adapter

## Decision question

How should an external reasoning runtime (or any other caller) reliably invoke MWD AIOM's deterministic kernel operations — Bootstrap, Validate, the Transition Gate, and the Orchestrator — against a real external project, without importing `mwd-aiom` source, running its test harness, or knowing its repository layout?

## Context

Initiative 9 (Simple Greenfield Project POC) proved that a real reasoning runtime could Bootstrap a genuine external project (`cmr-site`) from sparse Owner context and that project-local durable state supported fresh-session continuation. It also produced the finding this ADR resolves: Bootstrap was invoked through an ad hoc, unreproducible temporary bridge assembled for that one experiment — a Vitest-based invocation relying on a relative TypeScript import into `mwd-aiom`'s own `src/kernel/`. No trace of that bridge survives in either repository's history (`mwd-aiom`'s reflog and `git fsck` show nothing; `cmr-site` was never committed at all), and it is not a mechanism a future session or Owner could reach for again without re-deriving it from scratch.

A dedicated repository investigation (this Initiative's preceding session) established the reason: `mwd-aiom` is a single, private, `"type": "module"` package with `tsconfig.json`'s `"noEmit": true` — nothing in the repository has ever compiled to JavaScript, there is no `package.json` `exports` map, no `bin`, no CLI, no MCP server, and no build step in CI. The only executable call pattern for `runBootstrap()` anywhere in the repository was — and, until this initiative, remained — a `.test.ts` file under Vitest using a relative source import. Two further coupling points were found: `loadCapabilityIndex()` (`src/kernel/validation/capability-index.ts`) and the Seed-asset materializers (`src/kernel/bootstrap/seed-assets.ts`) both resolve `mwd-aiom`'s own `seed/` directory via `import.meta.url`-relative paths, meaning even Bootstrap's materialization into an *external* project depended on `mwd-aiom`'s own source tree being physically present at the right relative offset.

## Decision

Adopt a three-layer architecture:

```
transport (mwd-aiom CLI, first; future: MCP, CI, another agent)
   ↓
Runtime Invocation Layer (src/invocation/) — runtime-neutral, transport-agnostic
   ↓
deterministic kernel (src/kernel/) — unchanged
```

The Invocation Layer (`src/invocation/`) is the sole external contract surface (`package.json`'s `exports` field points at `src/invocation/index.ts`, never at `src/kernel/index.ts`), and owns: runtime request validation (Zod schemas mirroring, not redesigning, the kernel's existing `BootstrapReasoningDecisions`/`ProposedTransition` TypeScript contracts), project-context resolution (external callers supply a project *root*; the layer alone knows `.aiom/` lives under it), runtime-evidence composition (JSON-serializable requirement IDs become a real `RuntimeAdapter` internally — a `RuntimeAdapter` object itself, carrying a function, is never accepted over the boundary), operation dispatch to exactly four kernel entry points (`runBootstrap`, `validateProjectState`, `evaluateTransition`, `orchestrate`), error normalization (no raw `ZodError` or filesystem exception ever reaches a caller), and runtime version identity.

`mwd-aiom` (the CLI binary name) is the first transport: a thin, JSON-in/JSON-out wrapper over `invoke()` that performs no interpretation of Owner intent or Bootstrap reasoning.

Canonical Seed/reference assets ship with the runtime artifact unchanged in mechanism: `seed/` is declared in `package.json`'s `"files"` alongside `"dist"`, preserving the same relative directory depth between compiled kernel modules and `seed/` that already existed in source form. **No kernel source change was required or made** for asset resolution to work from an installed package — this was verified, not assumed (see Consequences).

Distribution for v0.1 is `pnpm pack` / a local tarball install — the package remains `"private": true`; public npm publication is explicitly deferred.

## Alternatives considered

- **Continue direct source imports / a documented ad hoc bridge pattern.** Rejected — this is the status quo Initiative 9 already showed fails: nothing is reproducible without re-deriving a bridge each time, and it requires the caller to open and understand `mwd-aiom`'s source.
- **Library-only published package, no CLI.** Rejected as the *first* transport — a same-language (Node/TS) caller can still `import` `src/invocation/index.ts` directly (this is not precluded), but the primary anticipated caller in Initiative 9's own evidence is a reasoning runtime operating a shell, for which a CLI is the more direct fit; a library-only release would still leave that caller needing to write glue code.
- **Repository-local bridge scripts checked into each consumer project.** Rejected — this merely relocates Initiative 9's ad hoc bridge problem into every future consumer project instead of solving it once.
- **Runtime-neutral invocation layer + CLI as first transport.** **Chosen.**
- **MCP/service-based invocation.** Not chosen for v0.1 — no evidence from Initiative 9 or the repository investigation showed an MCP server was already informally in use or specifically demanded; building one now would be speculative relative to actual evidence. The layering chosen here (`src/invocation/`) is deliberately transport-agnostic so an MCP transport can be added later without re-deriving request validation, dispatch, or asset resolution.
- **Claude-specific execution integration (skills/hooks).** Rejected as the core mechanism — `AGENTS.md` is explicit that Claude Code is an implementation runtime, not part of the AIOM architecture, and no standing permissions are implied beyond a given session. A Claude-specific integration may *point at* the CLI later (documentation only), but must not become the invocation mechanism itself.

## Consequences

- The kernel's own internal contracts (`BootstrapReasoningDecisions`, `ProposedTransition` as plain TypeScript interfaces) are unchanged; a second, runtime-validated mirror now exists in `src/invocation/contracts/`, guarded against silent drift by dedicated tests (`tests/invocation/contracts/decisions.test.ts`, `transition.test.ts`) that assert a value typed against the kernel interface parses successfully and that the schema's inferred type remains assignable back to it.
- The external contract surface (`src/invocation/index.ts`, four operations: `bootstrap`, `validate`, `transition`, `orchestrate`) is deliberately smaller and more stable than `src/kernel/index.ts`'s full export set. No standalone `inspect` operation was added — `runBootstrap()` already runs `inspectRepository()` unconditionally and returns it, and no evidence from Initiative 9 or the repository's own test suite showed a use case for inspection independent of Bootstrap.
- Kernel governance outcomes (`ValidationResult.valid === false`, a `mechanically-blocked` Transition Gate outcome, an `indeterminate`/blocked Orchestrator disposition) are represented as successful invocations (`status: "ok"`) carrying the full structured kernel result — verified directly against each kernel result type's own documented semantics, not merely assumed. `status: "error"` is reserved for the invocation layer failing to produce a kernel result at all (malformed request, unsupported operation, invalid target, or an internal failure such as a kernel-internal `ZodError` from `materializeProjectState`'s serializers).
- **Canonical asset resolution was falsified end-to-end, not merely reasoned about.** A real `pnpm pack` tarball was installed into a scratch consumer directory with no relationship to the `mwd-aiom` source tree; the installed CLI (`node_modules/.bin/mwd-aiom`) materialized valid `.aiom/` state — including copied `seed/` content — into a separate external project directory, and a subsequent `validate` call against that state passed, all without any reference to the `mwd-aiom` source repository's own path appearing anywhere in the output (`tests/packaging/pack.test.ts`). This is the single most consequential proof this ADR rests on: the hardest-looking coupling problem required zero kernel code changes, only a packaging guarantee (`"files": ["dist", "seed"]`).
- `mwd-aiom`'s CLI surface and `package.json`'s `bin`/`exports` shape become a maintained interface going forward — changing them is no longer a purely internal refactor once external consumers exist.
- Public npm publication, a version-compatibility negotiation protocol, and CLI ergonomics beyond the minimal JSON contract (e.g. a human-friendly output mode) remain explicitly deferred, not designed against here.
- Session-boundary invocation cadence — *when* a live session must call `validate`/`transition`/`orchestrate` again after Bootstrap — remains Initiative 13's responsibility. This initiative makes those operations callable; it does not mandate when they are called, and no documentation produced here implies a required cadence.
- Approval Artifact enforcement coverage (I11), Work Item evidence/completion integrity (I12), governance-file provenance detection (I14), and the delivery authorization-chain gate (I15) are unaffected — no schema or validation-rule changes were made to satisfy those initiatives' concerns, even where they became easier to observe through the new CLI.
