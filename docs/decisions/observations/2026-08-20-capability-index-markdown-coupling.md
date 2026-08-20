# Deterministic capability-index extraction from seed/capabilities/*.md succeeded, but couples the validator to that Markdown's exact structural conventions

**Date:** 2026-08-20
**Context:** Initiative 5 — Kernel Validation, `src/kernel/validation/capability-index.ts`

## Finding

Initiative 5's brief (Section 5) named deterministic extraction of the six
Capability Bundle IDs and eight Atomic Capability IDs from
`seed/capabilities/bundles.md` and `seed/capabilities/capabilities.md` as
a potential falsification point — a risk that reliable extraction from
prose Markdown would prove unreasonably brittle and force a duplicated,
manually maintained registry instead.

It did not prove brittle. Both files follow consistent, regular
structural conventions: entries separated by `\n---\n` horizontal rules,
a bundle's stable ID recorded as `**ID:** \`bundle-id\`` immediately under
its `## N. Bundle Name` header, and a capability's stable ID recorded
directly in its own `## N. \`capability-id\`` header with a
`**Bundle:** Bundle Name` (or `**Bundle:** cross-cutting (not owned by a
single bundle)`) field naming its owning bundle by the same name string
used in that bundle's header. A small regex-based extractor
(`buildCapabilityIndex`) parses both files against these conventions and
correctly resolves all 6 bundle IDs, all 8 capability IDs, and every
bundle/capability membership relationship, verified against the live
`seed/capabilities/*.md` content in
`tests/kernel/validation/capability-index.test.ts`. No second, manually
maintained capability catalog was created — `seed/capabilities/*.md`
remains the sole source of truth.

## Why this matters

This extraction is coupled to those Markdown files' exact structural
conventions (the `---` separators, the bold-label field format, the
matching of a capability's `**Bundle:**` prose value against a bundle's
header name), not to their content. A future edit to
`seed/capabilities/bundles.md` or `capabilities.md` that changes wording,
prose, or field values will not break capability-index resolution. An
edit that changes the *structural* conventions — e.g. removing an `---`
separator, renaming a bundle without updating a capability's `**Bundle:**`
field to match, or reformatting an ID out of backticks — could silently
break resolution (an unresolvable capability, or a capability that
appears to have no bundle) with no signal from the Markdown files
themselves; only `capability-index.test.ts`, run against a checkout that
includes the edit, would catch it.

This is a reasonable, bounded trade-off for a v0.1 proving implementation
that explicitly must not introduce a second canonical registry (see
`seed/capabilities/README.md`), not a defect. It is worth recording so a
future editor of `seed/capabilities/*.md` — human or AI — knows that
prose-only changes are safe, but structural changes to those two files
should be validated against `src/kernel/validation/capability-index.ts`'s
tests before being treated as complete.
