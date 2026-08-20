# Atomic Capabilities (v0.1)

An Atomic Capability is a reusable, provider-neutral unit of specialist
execution, in the sense [`../core.md`](../core.md) uses the term: a
bounded capability that carries out defined work under Orchestrator
direction, not an agent, tool, or provider binding.

This is the v0.1 **proving set** — eight capabilities chosen to validate
the architecture, not a complete or universal catalog. A capability's
existence here is a definition, not a grant: a project encountering one of
these signals does not thereby have the capability activated, available,
or authorized — see
[`README.md`](./README.md#relevance-activation-runtime-availability-and-authorization-are-distinct).

Each capability records: stable ID, name, responsibility, bundle
membership (or cross-cutting), relevance/adoption signals, an abstract
runtime requirement, authority characteristics, applicable standards/gates,
evidence expectations, and explicit exclusions. Runtime requirements are
stated at the capability level (e.g. `repository-write`), never as a named
provider or tool — a concrete example is only ever given as a clearly
labeled illustration.

---

## 1. `repository-inspection`

**Name:** Repository Inspection

**Responsibility:** Reading and reconstructing the current state of a
version-controlled repository — structure, history, status — sufficient
to reason about it before acting.

**Bundle:** Repository / Versioned Delivery

**Relevance signals:** the project maintains a version-controlled
repository; work requires understanding existing structure or history
before changing it.

**Runtime requirement (abstract):** repository-read.

**Authority:** read-only. Does not itself grant authority to change
anything, and does not replace an Owner-authorized decision about what to
do with what was found.

**Standards/gates:** none specific beyond accurate representation of what
was found.

**Evidence expectations:** findings that are used to justify later action
should be reproducible from repository state, not solely recalled from
conversation (see [`../safeguards.md`](../safeguards.md#evidence--provenance-preservation)).

**Excludes:** writing or committing changes (see `bounded-delivery`);
implementing functional changes (see `software-implementation`).

---

## 2. `bounded-delivery`

**Name:** Bounded Delivery

**Responsibility:** Producing and delivering a scoped, reviewable change
(e.g. a branch, commit, or pull request) against a version-controlled
repository, within an authorized boundary.

**Bundle:** Repository / Versioned Delivery

**Relevance signals:** work must be delivered as a discrete, reviewable,
auditable increment; the repository requires structured change history.

**Runtime requirement (abstract):** repository-write.

**Authority:** having repository-write available is a runtime-availability
fact, not an authorization. Delivering a consequential change — merging,
or pushing to a shared branch — remains Owner-authorized per
[`../safeguards.md`](../safeguards.md#consequential--external-action); the
capability existing or being active does not itself authorize that step.

**Standards/gates:** `deterministic-validation` should gate delivery
wherever validation is defined for the change being delivered.

**Evidence expectations:** the resulting change set (diff, commit, pull
request) is itself the evidence trail; no separate record is required
solely to prove delivery occurred.

**Excludes:** deciding what should be built (Orchestrator/Owner);
authoring the functional content of the change (see
`software-implementation`).

---

## 3. `software-implementation`

**Name:** Software Implementation

**Responsibility:** Authoring or modifying source code to implement
defined functional behavior within a codebase.

**Bundle:** Software Engineering

**Relevance signals:** functional requirements exist that must be
expressed as code; existing code must be modified to change behavior.

**Runtime requirement (abstract):** code-authoring access within a
workspace.

**Authority:** implementing code is not itself authorization to deliver or
merge it. Delivery remains subject to `bounded-delivery` and, where
consequential, Owner review.

**Standards/gates:** `deterministic-validation` applies wherever lint,
type-check, test, or build constraints are defined for the codebase.

**Evidence expectations:** the resulting code and its validation results
serve as evidence of correctness; no separate narrative record is
required.

**Excludes:** repository/delivery mechanics (see `bounded-delivery`);
user-facing interaction/visual implementation (see `ui-implementation`),
though the two often overlap in practice on the same change.

---

## 4. `deterministic-validation`

**Name:** Deterministic Validation

**Responsibility:** Running mechanical checks — lint, type-check,
automated tests, build — that verify defined constraints without
requiring judgment.

**Bundle:** Software Engineering

**Relevance signals:** the project defines constraints that can be
mechanically checked; a validation command or pipeline exists, or is
warranted.

**Runtime requirement (abstract):** an execution environment capable of
running the defined checks.

**Authority:** a passing check is not itself Owner approval. Validation
and acceptance are distinct, per
[`../core.md`](../core.md#operating-principles) and
[`../safeguards.md`](../safeguards.md#validation).

**Standards/gates:** this capability is the mechanism a future
Standards/Gates layer builds on; this initiative defines it only at the
capability level, not as an enforcement framework.

**Evidence expectations:** validation results must be preserved or
reportable, not merely asserted to have passed.

**Excludes:** deciding what to do when validation fails (Orchestrator/
Owner); performing the implementation being validated (see
`software-implementation`).

---

## 5. `ui-implementation`

**Name:** UI Implementation

**Responsibility:** Implementing or modifying a user-facing interface or
interaction surface to meet defined design/experience requirements.

**Bundle:** Web / UI Experience

**Relevance signals:** the project presents a rendered or interactive
surface to users; interaction or visual design requirements exist.

**Runtime requirement (abstract):** an environment capable of building or
rendering the relevant interface surface.

**Authority:** implementing a UI change does not itself authorize
publishing or deploying it.

**Standards/gates:** Accessibility (cross-cutting standard/gate) applies
wherever this capability is active.

**Evidence expectations:** the surface should be confirmed to behave as
intended (manually or through automated checks) before being treated as
done, not merely inferred from the code.

**Excludes:** general non-UI application logic (see
`software-implementation`); authoring the content it renders (see the
Content / Publication bundle, which owns no atomic capability of its own
in this v0.1 set).

---

## 6. `research-discovery`

**Name:** Research / Discovery

**Responsibility:** Gathering, reading, and synthesizing information —
from a repository, external sources, or prior durable state — needed to
reason about a task before acting.

**Bundle:** cross-cutting (not owned by a single bundle).

**Relevance signals:** any task where relevant facts are not already
established; in practice at least partially relevant to nearly all work,
which is why it is defined as cross-cutting rather than bundle-owned.

**Runtime requirement (abstract):** read access to the information source
relevant to the task at hand (repository, external source, or prior
durable state, as applicable) — no specific source is assumed.

**Authority:** research informs decisions; it does not itself authorize
acting on what it finds.

**Standards/gates:** none specific; findings that materially inform a
consequential decision should meet the evidence/provenance expectation in
[`../safeguards.md`](../safeguards.md#evidence--provenance-preservation).

**Evidence expectations:** significant findings should be preserved (e.g.
as an Observation) when they materially inform later decisions, not
solely recalled from conversation.

**Excludes:** modifying project state — that is the role of the
implementation/delivery capabilities this capability informs. Usable on
its own, independent of any bundle being relevant (e.g. a pure research
task with no repository or delivery involved).

---

## 7. `external-action-execution`

**Name:** External Action Execution

**Responsibility:** Taking action on, or exchanging data with, a system
beyond the project's own local, reversible boundary — publishing,
notifying, or calling an external service.

**Bundle:** External Action / Integration

**Relevance signals:** the work requires affecting or communicating with
an external system or party.

**Runtime requirement (abstract):** outbound access to the relevant
external system.

**Authority:** **Owner-authorized by default.** This capability crosses
the project's local/reversible boundary as defined in
[`../safeguards.md`](../safeguards.md#consequential--external-action).
Being technically available or active does not make a specific use
authorized; each use requires Owner authorization unless a future,
explicitly approved durable policy states otherwise.

**Standards/gates:** the safeguards.md consequential/external-action rule
applies directly; Security / Privacy (cross-cutting standard/gate) applies
wherever data crosses the boundary with this capability.

**Evidence expectations:** the action taken, and its authorization, should
be reconstructable after the fact, not solely recalled from conversation.

**Excludes:** deciding policy for which external actions are pre-
authorized in general — that would require a future, explicitly approved
durable Owner policy, which is not established by this definition.

---

## 8. `persistent-continuation`

**Name:** Persistent Continuation

**Responsibility:** Maintaining or resuming work that spans beyond a
single bounded session — recurring execution, ongoing monitoring, or
state that must persist and be reconstructable across sessions.

**Bundle:** Persistent Operation / Monitoring

**Relevance signals:** work must recur on a schedule, run unattended, or
be resumable later without conversational context.

**Runtime requirement (abstract):** an execution context capable of
persisting or resuming state, or recurring, independent of a single
interactive session.

**Authority:** persistence or recurrence does not itself authorize the
actions taken during a resumed run. Each resumed action remains subject to
the same authority rules that would apply if taken interactively —
including, where applicable, `external-action-execution`'s default of
Owner authorization.

**Standards/gates:** relies on durable state being resumable, per the
"persist vs. recompute vs. revalidate" operating principle in
[`../core.md`](../core.md#operating-principles).

**Evidence expectations:** state that enables resumption must be recorded
durably, not held only in an active session.

**Excludes:** defining the scheduling/runtime mechanism itself (a future
runtime adapter concern, not owned here); the work performed during a
resumed run (owned by whichever other capability that work belongs to).
