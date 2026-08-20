# Decisions

This directory holds `mwd-aiom`'s own decision history. It starts empty of
inherited content — records here describe evidence and decisions produced by
work on *this* repository, not decisions carried over from elsewhere.

## Evidence ≠ Reflection ≠ Decision

These are three different things, recorded differently:

- **Evidence** is an objective finding produced by doing the work — a
  measurement, a validation result, a discovered constraint. Recorded as an
  **Observation**.
- **Reflection** is a considered judgment about how work went, worth
  remembering for how future work is approached. Recorded as a **Journal**
  entry.
- **Decision** is a choice between alternatives that binds future work,
  usually because it is expensive or risky to reverse. Recorded as an
  **ADR** (Architecture Decision Record).

Not every initiative produces all three, or any of them. A record is only
created when there is real content to capture — never to initialize
numbering or satisfy a template.

## ADR (`adr/`)

One file per decision, numbered sequentially (`0001-*.md`, `0002-*.md`, ...).
An ADR captures: the decision, the alternatives considered, and why the
choice was made. Status is one of `proposed`, `accepted`, `superseded`, or
`rejected`. A superseded ADR is not deleted — the record that supersedes it
is linked from it.

This repository starts with **no inherited ADRs**. Decisions already settled
by the approved AIOM architecture specification (for example: TypeScript,
local-first and file-native state) are not re-litigated here just because
they were exercised again — an ADR is only warranted for a genuinely new
implementation decision encountered while building this repository.

## Observations (`observations/`)

Objective, dated findings from implementation — what was actually true when
something was built or run, independent of what anyone concluded from it.

## Journal (`journal/`)

Dated reflective entries — what a piece of work revealed about how to
approach this repository going forward. Written when there is a genuine
milestone or lesson, not as a running log of activity.

## Conventions

- Filenames: `NNNN-short-slug.md` for ADRs, `YYYY-MM-DD-short-slug.md` for
  observations and journal entries.
- Keep entries concise. A record that isn't read isn't useful.
