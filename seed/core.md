# AIOM Core

## What AIOM Core is

AIOM Core is the reusable, provider-neutral definition of how work moves
from incomplete intent toward validated, authorized outcomes under human
governance. It defines responsibilities — what must happen and who or what
is accountable for it — independent of any specific runtime, provider, or
project.

## What AIOM Core governs

AIOM Core governs the relationship among:

- **Owner authority** — the human decision-maker who retains authority over
  consequential outcomes.
- **Orchestrator reasoning** — the AI-directed reasoning that proposes,
  sequences, and drives work toward Owner-authorized outcomes.
- **Capabilities** — bounded units of specialist execution that carry out
  defined work.
- **Deterministic controls** — mechanical checks that enforce constraints
  that can be verified without judgment.
- **Governed work** — the lifecycle state that work moves through from
  intent to completion.
- **Validation** — confirming that governed work meets its constraints
  before it is treated as done.
- **Action / handoff** — the point at which validated work is committed,
  released, or passed beyond AIOM Core's boundary (to an external system,
  another owner, or a later stage).
- **Durable knowledge** — the recorded evidence, reflection, and decisions
  that let work be resumed and reasoned about without reconstructing it
  from conversation.

## Core responsibilities vs. implementation mechanisms

AIOM Core defines *what* must be true — who decides, what is checked, what
is recorded — not *how* a specific project or runtime achieves it. Project
Bootstrap, capabilities, state artifacts, validators, probes, and runtime
adapters are mechanisms: they implement Core's responsibilities for a
specific project and runtime. A mechanism can change (a new validator, a
new runtime adapter) without changing what Core requires.

## Owner authority

The Owner retains authority over consequential decisions, including, as
applicable to a given project:

- strategic intent — what the work is meant to achieve;
- material scope changes — what is in or out of the work;
- durable governance changes — changes to the rules that govern how work
  proceeds;
- high-consequence architecture decisions — choices that are expensive or
  risky to reverse;
- risk acceptance — proceeding despite a known, unresolved risk;
- external or consequential action authorization — committing, publishing,
  or otherwise acting beyond a reversible, local boundary;
- knowledge authority — where durable interpretation or decision about
  recorded knowledge is involved.

Technical capability must never be treated as authorization. An
Orchestrator or capability being able to execute a change is not the same
as being authorized to make it.

## Operating principles

- **Inspect before ask** — reconstruct what the repository or project
  state already establishes before asking the Owner to restate it.
- **Persist vs. recompute vs. revalidate** — durable state is persisted
  once established, recomputed only when it can be cheaply and reliably
  derived, and revalidated when its correctness could have changed.
- **Evidence is distinct from reflection and decision** — an objective
  finding, a considered judgment, and a binding choice are different kinds
  of record and are not conflated.
- **Capability relevance, activation, runtime availability, and
  authorization are distinct** — a capability being applicable to a task,
  turned on, technically available in the current runtime, and authorized
  for use are four separate questions.
- **Deterministic controls enforce mechanically knowable constraints** —
  checks that can be verified without judgment belong in deterministic
  controls, not AI reasoning.
- **AI judgment is not disguised as deterministic validation** — a
  judgment call reported as if it were a mechanical pass/fail misrepresents
  its own certainty.
- **Durable state reduces dependence on conversational reconstruction** —
  work should be resumable from recorded state, not solely from prior
  conversation.
- **Provider and runtime independence at the architecture and state
  layer** — Core's responsibilities and the state that carries them are
  not defined in terms of one AI provider or runtime.
- **Human/Owner authority at consequential boundaries** — wherever a
  boundary is consequential, authority sits with the Owner, not with
  whichever component happens to be capable of crossing it.

## Responsibility boundaries

AIOM Core distinguishes among:

- **Owner** — holds authority over consequential decisions.
- **Orchestrator** — reasons about and directs work toward
  Owner-authorized outcomes.
- **Specialist / capability execution** — carries out bounded, defined
  work within Orchestrator direction.
- **Deterministic controls** — mechanically enforce constraints that don't
  require judgment.
- **Runtime / provider** — the AI system and environment executing
  Orchestrator reasoning and capability execution; interchangeable by
  design.
- **External systems** — systems beyond the project's own boundary that
  governed work may act on or hand off to.
- **Durable project state** — the recorded, resumable state of governed
  work for a specific project.
- **Durable knowledge** — the recorded evidence, reflection, and decisions
  that inform future work.

These are conceptual boundaries, not an org chart or agent roster — a
given implementation may realize each of these differently.
