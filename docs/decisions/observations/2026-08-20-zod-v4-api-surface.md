# `pnpm add zod` resolved to zod v4, whose API differs from common v3 examples

**Date:** 2026-08-20
**Context:** Initiative 4 — Project State Templates & Schemas, kernel schema/parsing layer

## Finding

Adding `zod` with no version pin (as instructed — "add only dependencies
required for this initiative") resolved to **zod 4.4.3**. Several APIs
commonly shown in v3-era examples differ in v4:

- `z.string().datetime()` is now `z.iso.datetime()`.
- The `safeParse()` return type is exported as `z.ZodSafeParseResult<T>`,
  not `z.SafeParseReturnType<T>`.
- `ctx.addIssue()` inside `.superRefine()` takes `{ code: 'custom', ... }`
  as a string literal, not `z.ZodIssueCode.custom`.
- A schema wrapped in `.superRefine()` is no longer a plain `ZodObject` —
  `.shape` is not available on it directly, which affects how field-level
  sub-schemas are extracted for isolated tests.

## Why this matters

Initiative 5 — Kernel Validation will extend this same schema layer
(`src/kernel/schemas/`). Anyone writing v3-flavored zod code against it —
including an AI runtime pattern-matching on older examples — will hit
type errors that look like project-specific mistakes but are actually
version-surface differences. Worth checking the installed `zod` version
before assuming v3 API shape.
