# Bootstrap's ephemeral-mode Bootstrap Ready validation reuses Initiative 5's validator functions directly, with no filesystem round-trip

**Date:** 2026-08-20
**Context:** Initiative 8 — Bootstrap Execution + Synthetic End-to-End Proof, `src/kernel/bootstrap/candidate-state.ts`

## Finding

Initiative 8's brief (Section 11) required Bootstrap to support a genuinely
lightweight ephemeral/pre-project mode — "do NOT automatically create
`.aiom/` merely because Bootstrap was invoked" — while Section 12 still
requires deterministic Bootstrap Ready validation for that mode, not only
for materialized `aiom-managed` state. This created an apparent tension:
every existing deterministic check (`validateProjectState`,
`validate-project.ts`) is disk-based, reading a project-state directory
via `loadProjectState`.

Inspecting `src/kernel/validation/bootstrap.ts` and
`src/kernel/validation/references.ts` before implementing showed both
`validateBootstrapReadiness` and `validateReferences` already operate on
already-parsed data (a `ProjectProfile` object and a `LoadedProjectState`
shape respectively) — neither touches the filesystem itself; only
`loadProjectState` (`project-state.ts`) and its `validateProjectState`
wrapper do. `src/kernel/bootstrap/candidate-state.ts` exploits this
directly: `buildCandidateState()` assembles the same `LoadedProjectState`
shape from in-memory candidate artifacts (wrapping each in `ok(data)` from
the parsing layer, exactly as a real parse success would), and
`validateCandidateState()` calls `validateBootstrapReadiness` and
`validateReferences` unchanged. `runBootstrap()` uses this path whenever
`mode === 'ephemeral'` or `materializeTo` is omitted, and switches to the
real disk-based `validateProjectState()` only once state is actually
materialized (`tests/kernel/bootstrap/candidate-state.test.ts`,
`tests/kernel/bootstrap/bootstrap.test.ts`'s ephemeral-mode assertions).

## Why this matters

No validation logic was duplicated to support ephemeral mode — the same
two functions Initiative 5 built for disk-based validation now also
back Bootstrap's in-memory candidate validation, unchanged. This is
direct evidence that Initiative 5's "read-only, deterministic validator
over already-parsed data" design choice (not incidentally, but by
separating `loadProjectState`'s I/O from the validation functions
themselves) paid off for a consumer three initiatives later that its
brief never anticipated. It also means ephemeral-mode Bootstrap Ready
checking is exactly as strict as materialized-mode checking — there is no
weaker "ephemeral" validation path, only a different validation *target*
(in-memory vs. on-disk).

## Remaining limitation / falsification boundary

This pattern depends on `LoadedProjectState`'s shape staying a plain data
structure with no disk-specific fields beyond `path` (a string label, not
consulted for I/O by either validator). A future change that made
`loadProjectState` or the validators themselves disk-aware in a way that
mattered for correctness (not just labeling) would break this reuse
silently — nothing currently guards against that beyond the type system
and `candidate-state.test.ts`'s coverage.
