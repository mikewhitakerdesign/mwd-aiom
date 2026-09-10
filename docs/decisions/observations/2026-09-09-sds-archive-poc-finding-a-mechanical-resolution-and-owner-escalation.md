# A governed archive workflow resolved substantial mechanical and validation work without Owner intervention, escalating only genuine Owner/security decisions

**Date:** 2026-09-09
**Context:** Cross-project evidence from the Portfolio repository's governed case-study workflow (Stretto Default Solutions / DMM Portal, Archive Phase 2) — an external project, not part of this repository — reviewed here for what it reveals about AIOM Core's Owner-authority and escalation model, per a read-only repository investigation into governed workflow autonomy conducted in this repository.

## Finding

During Archive Phase 2 of the Portfolio repository's governed case-study workflow, a session executing under that project's own governed workflow contract:

- inventoried and reconciled 70 source files, established an authoritative artifact inventory, discovered stronger native sources that superseded weaker derivatives, and identified duplicates and variants — without Owner intervention;
- detected confidentiality-sensitive information concerning potentially real people and stopped, escalating for an Owner/security decision rather than proceeding on an assumption;
- once Owner-approved confidentiality rules were established, applied them consistently, produced sanitized derivatives outside the repository, and visually re-inspected the results, catching and correcting two incomplete redactions before repository capture;
- caught three incorrect file-identity mappings by re-verifying source files immediately before acting on them (see the companion finding on this session's bookkeeping risk);
- captured the approved archive, generated provenance/manifest records, and independently re-hashed all 50 archived files, reporting 50 checksum matches, zero mismatches, and zero missing files.

The session stopped or escalated only for: source files inaccessible from the filesystem, unresolved confidentiality treatment for potentially real people, and a repository/security policy decision requiring Owner judgment. It did not require Owner intervention for the mechanical, procedural, or validation work described above.

## Why this matters for AIOM Core

This is empirical evidence — from a real governed workflow rather than a synthetic fixture — that a specialist/orchestrator-level reasoning session can absorb substantial mechanical, evidence-driven, and validation work within an Owner-authorized scope, while correctly recognizing and escalating the categories of decision AIOM Core already reserves to the Owner (`seed/core.md#owner-authority`). The two genuine escalations here map cleanly onto that existing enumerated list — risk acceptance / sensitive-data handling, and a security/repository-policy decision — rather than requiring a new authority category to explain them.

It is the closest real-world precedent yet to Initiative 9's `cmr-site` escalation finding, where a genuine scope contradiction was "surfaced to the Owner rather than silently resolved or silently implemented" (see [`2026-08-21-initiative-9-greenfield-poc-closure.md`](./2026-08-21-initiative-9-greenfield-poc-closure.md)), and it is the first evidence of that pattern holding across a materially longer, higher-volume, and confidentiality-bearing piece of work than anything previously observed in this repository's own evidence base.

It also bears directly on a question ADR 0002 explicitly leaves open for proving-project evidence to answer: how much of what currently reads as "needs Owner approval" in a governed multi-phase workflow is a genuine authority boundary, versus conservative behavior emerging from prompting, agent interpretation, or operating habit. This finding is evidence toward the former being narrower, and the latter broader, than the checkpoint volume observed in that workflow would suggest on its own.

## Remaining limitation / falsification boundary

This is a single proving instance, from one external project, one workflow, one session lineage — the same evidentiary shape as Initiative 9's `cmr-site` findings, and subject to the same caveat: it is a real confirmation, not a statistically repeated one. It does not establish that every mechanical or procedural step in that workflow was correctly classified as non-authority-bearing, only that the specific escalations that did occur were each defensible against AIOM Core's existing Owner-authority categories. It also says nothing about Archive Phases 3–9 or the Case Study Workflow, which were not exercised as part of this evidence — the Portfolio repository's SDS work remains intentionally paused after Archive Phase 2.
