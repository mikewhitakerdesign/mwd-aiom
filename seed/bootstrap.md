# Project Bootstrap Process Guidance (AIOM Seed v0.1)

## What this is

Provider-neutral guidance for the reasoning role Project Bootstrap needs
(see [`../src/kernel/bootstrap/`](../src/kernel/bootstrap/) — the
deterministic mechanics — and its `BootstrapReasoningDecisions` contract in
[`../src/kernel/bootstrap/types.ts`](../src/kernel/bootstrap/types.ts)).
This file is for whichever runtime performs that reasoning — Claude Code,
another capable AI runtime, or a human filling out the contract by hand —
not for `mwd-aiom`'s own development (see root [`AGENTS.md`](../AGENTS.md)
for that).

Bootstrap is the discovery-and-configuration process that turns incomplete
Owner/project context into enough trustworthy AIOM state to identify the
Next Governed Action. It is not a generator, not a fixed questionnaire, and
does not assume implementation is the next step.

## Process

1. **Inspect first.** If a project path exists, read what is mechanically
   available — files, directories, Git state, existing documentation,
   existing `.aiom/` state — before asking the Owner anything it would
   answer. Treat inspected evidence as `directly-inspected`, never as
   `owner-confirmed`.
2. **Identify evidence and provenance for everything you record.** Every
   Project Profile signal and consequence confirmation needs a
   `provenance`: `owner-stated`, `owner-confirmed`, `directly-inspected`,
   `ai-inferred`, `workflow-discovered`, `externally-verified`, or
   `unknown`. Do not write `owner-confirmed` for anything the Owner did not
   actually confirm.
3. **Infer cautiously.** Where evidence is suggestive but not conclusive,
   record `ai-inferred` with a rationale, not a guess disguised as
   certainty. `unknown` is a legitimate, honest answer.
4. **Surface unknowns rather than resolving them silently.** Add anything
   genuinely unresolved to Bootstrap's unresolved-items list instead of
   picking a value to keep the record looking complete.
5. **Ask only what is consequential or genuinely unresolvable.** The two
   fixed consequence confirmations —
   *will this project perform consequential external actions?* and
   *will this project handle sensitive/private/high-consequence data?* —
   can never be resolved by inference; they require the Owner directly.
   Deterministic Bootstrap code enforces this: any attempt to resolve
   either from non-Owner provenance is overridden back to `unresolved`.
   Beyond those two, ask only what materially changes the next governed
   action — not a full intake form.
6. **Build a candidate Project Profile** from what you now know: project
   name/intent, Owner identity, whether an Existing-State Assessment was
   performed, `lifecycle_position` (an open string — do not invent a
   project-type enum), the nine composable signals, and the two
   consequence confirmations.
7. **Assess Capability Bundle relevance** (see
   [`capabilities/bundles.md`](./capabilities/bundles.md)) against the
   Profile. This is a reasoned judgment, not a deterministic derivation —
   record `relevant: true/false/unknown` with a rationale per bundle. A
   relevant bundle does not itself activate anything.
8. **Assess Atomic Capability activation** (see
   [`capabilities/capabilities.md`](./capabilities/capabilities.md)) for
   the current work need — not by activating everything a relevant bundle
   lists. Use `required` / `recommended` / `on-demand` / `deferred` /
   `not-applicable` per capability, with provenance and rationale.
   Activation is never authorization, and activating
   `external-action-execution` does not itself authorize anything.
9. **Decide whether durable state is justified.** Durable `.aiom/` state is
   warranted when reliable continuation, authority, or durable knowledge
   requires it — not merely because Bootstrap was invoked. A lightweight
   research-only request can stay ephemeral.
10. **Evaluate Bootstrap Ready qualitatively.** Judge whether: intent is
    sufficient to identify a next governed action; any Existing-State
    Assessment performed is adequate for current risk/scope; the
    consequence questions are resolved where necessary; capability
    configuration is sufficient for the next action; remaining uncertainty
    is explicitly represented; and required Owner decisions were actually
    obtained. Record this judgment structurally — deterministic validation
    then separately checks that the recorded state is internally
    consistent. Neither role substitutes for the other.
11. **Identify the smallest useful Next Governed Action** — research,
    clarifying an Owner decision, inspecting an existing system, design,
    or implementation planning, as the situation actually warrants.
    Implementation is not the default. Do not invent a backlog; one Work
    Item is enough.
12. **Stop at authority boundaries.** If Bootstrap itself reaches a point
    that needs Owner authorization, surface it — a `pending` Owner
    Approval Artifact records the need, never a fabricated `approved` one.

## What this guidance is not

Not a script to follow word-for-word regardless of context, not a
replacement for reading [`core.md`](./core.md) and
[`safeguards.md`](./safeguards.md) first, and not itself an implementation
— see [`../src/kernel/bootstrap/`](../src/kernel/bootstrap/) for the
deterministic mechanics this reasoning feeds.
