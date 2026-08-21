# Initiative 9 proved sparse-context Bootstrap and fresh-session continuation, but showed live project sessions were never actually reconnected to the deterministic kernel after Bootstrap

**Date:** 2026-08-21
**Context:** Initiative 9 — Simple Greenfield Project POC, external proving project `cmr-site`

## Experiment purpose

Initiative 9 set out to test three hypotheses that none of Initiatives 1–8
could test in isolation, because all of them exercised `mwd-aiom`'s own
kernel directly against fixtures, not a real external project driven by an
Owner with no AIOM background:

- **Sparse-context Bootstrap hypothesis** — that a real reasoning runtime
  can bootstrap a greenfield project from sparse Owner context, without the
  Owner needing to explain AIOM architecture first.
- **Plain-language Owner UX hypothesis** — that an Owner can drive
  Bootstrap and subsequent governed work using ordinary project language,
  not AIOM vocabulary.
- **Fresh-session continuation hypothesis** — that project-local durable
  state (`.aiom/`) supports a new session resuming the project with no
  access to prior conversational history.

## What was tested

The proving sequence exercised against the external project `cmr-site`
(outside this repository, never merged into it):

1. an external, empty repository as the Bootstrap destination;
2. a sparse Bootstrap invocation from minimal Owner-supplied context;
3. a live reasoning-to-contract bridge translating that context into a
   `BootstrapReasoningDecisions`-shaped input;
4. materialization of a candidate Project Profile, Capability Activation
   Record, and first Governed Work Item into `cmr-site`;
5. a fresh-session continuation test immediately after materialization;
6. Owner decisions on project scope and technical stack, made in a live
   session;
7. a newsletter-feature contradiction, surfaced and escalated to the Owner
   rather than resolved unilaterally;
8. implementation work in `cmr-site` against the accepted scope;
9. a validation pass over the resulting project state;
10. a governance audit of accumulated `.aiom/` state;
11. a Git Delivery readiness audit;
12. a final fresh-session continuation test against `cmr-site`'s dirty
    (uncommitted) working state.

## Confirmed successes

- Sparse-context reasoning Bootstrap materialized a coherent Project
  Profile, Capability Activation Record, and first Governed Work Item from
  minimal Owner input, without the Owner explaining AIOM concepts.
- Fresh-session durable continuation held a second time, now against a real
  external project rather than a synthetic fixture (extending
  [fresh-agent-resume-from-materialized-aiom-state](./2026-08-20-fresh-agent-resume-from-materialized-aiom-state.md),
  and now also across a dirty working tree, which that prior evidence did
  not cover).
- Owner escalation worked: a genuine contradiction (the newsletter feature)
  was surfaced to the Owner rather than silently resolved or silently
  implemented.
- Where the deterministic kernel was actually invoked, it performed
  correctly — its results were not the source of any finding below.
- Git Delivery was withheld at the readiness audit rather than performed
  against known-invalid state.

## Confirmed gaps / findings

1. **No clean external Bootstrap/runtime invocation path.** Bootstrap was
   driven by an ad hoc reasoning-to-contract bridge assembled for this
   experiment, not a supported, repeatable invocation mechanism a session
   or Owner could reach for on any external project.
2. **No routine connection from live project sessions back to the
   deterministic kernel after initial Bootstrap.** Once `cmr-site` existed,
   subsequent live sessions did not routinely re-invoke Kernel Validation,
   the Transition Gate, or the Orchestrator against its evolving state.
3. **General project validation does not cover all Owner-authority
   integrity requirements.** Validation as it exists checks structural and
   referential coherence; it does not comprehensively enforce every
   Owner-authorization requirement a Work Item can carry.
4. **`cmr-site` produced schema-invalid Work Item state.**
   `define-cmr-v1-scope.md` contains Work Item frontmatter values that
   would have failed parsing under the actual Work Item schema had the
   live validator been invoked against it. This is the sharpest single
   piece of evidence in this initiative: durable state accumulated by
   natural-language self-attestation, not deterministic validation, and
   the invalidity went undetected until this audit.
5. **Work Item completion/evidence integrity is insufficiently
   structured.** What counts as valid completion or evidence for a Work
   Item is not structured tightly enough to be validated reliably rather
   than asserted in prose.
6. **Tooling can mutate governance-adjacent files outside AIOM
   awareness.** Implementation tooling operating on `cmr-site` was able to
   change files adjacent to governance state without any mechanism
   noticing or flagging the change.
7. **No implemented Git Delivery gate exists yet.** The Git Delivery
   readiness audit that withheld delivery was a manual audit, not an
   enforced mechanism — nothing would have stopped delivery had the audit
   not been performed.
8. **Fresh sessions trust durable state more strongly than they
   independently verify its integrity.** The fresh-session continuation
   tests (item 5 and item 12 above) showed a fresh session reconstructing
   project understanding from `.aiom/` state — but reconstruction succeeded
   even though that state included the schema-invalid Work Item from
   finding 4, meaning successful reconstruction is not evidence of valid
   reconstruction.
9. **Natural-language governance is currently more expressive than
   enforceable.** Across findings 2–8, the pattern is the same: AIOM v0.1's
   natural-language policy layer (Seed guidance, Owner-facing process
   documents) can describe governance requirements clearly, but the
   deterministic controls that would enforce those requirements are not
   reliably connected during live project execution after Bootstrap.

## Correction: the Transition Gate's authority logic itself is not broken

The findings above are gaps in **invocation, coverage, and integration**,
not evidence that the Transition Gate's own authority logic is unsound.
Where the Gate was actually invoked in this and prior initiatives (see
[falsification-gate-c-runtime-independence-and-orchestration](./2026-08-20-falsification-gate-c-runtime-independence-and-orchestration.md)),
its structural-eligibility and provable-authorization checks performed
correctly and within their stated scope. Initiative 9 does not extend or
challenge that prior evidence — it shows the Gate has no routine path to
being invoked at all against a live project once Bootstrap has completed,
which is a distinct problem from the Gate deciding wrongly when it runs.

## CMR disposition

- The `cmr-site` scaffold produced by this experiment may be preserved as
  a project; nothing about this closure requires discarding it.
- Its governance state (including the schema-invalid Work Item
  frontmatter in finding 4) needs manual reconciliation before any first
  legitimate Git Delivery from that project — this closure does not
  perform that reconciliation.
- `cmr-site` does not need to wait for all, or any, of the follow-up
  initiatives below before continuing as a project.
- Manual reconciliation of `cmr-site`'s governance state is separate work
  from this closure and is not performed in this session; `cmr-site` was
  not modified in the course of writing this record.

## Remaining limitations / falsification boundary

This evidence is bounded to one external project (`cmr-site`), one
Bootstrap invocation, and one reasoning runtime session lineage. It does
not show whether these gaps hold across a second independent external
project, a second runtime provider, or a project whose Owner is less
available for escalation than this one was. The successes above (sparse
Bootstrap, fresh-session continuation, escalation) are each single
confirmations, not statistically repeated evidence.
