# Capability Architecture

## What this is

The Capability Architecture is the reusable, provider-neutral definition of
the **Capabilities** AIOM Core describes in [`../core.md`](../core.md):
bounded units of specialist execution that carry out defined work. It sits
between AIOM Core (which defines the responsibility) and a future Project
Bootstrap / Orchestrator (which will decide, per project, which of these
are relevant, active, runtime-available, and authorized).

This is definitions only. It does not decide anything about any specific
project.

## The chain this fits into

```
Project Profile                  (not yet implemented)
  → Capability Bundle relevance  (bundles defined here; relevance decision not yet implemented)
  → Atomic Capability activation (capabilities defined here; activation not yet implemented)
  → Standards / Gates            (referenced here; enforcement not yet implemented)
  → Adapters / Runtime           (not yet implemented)
  → Project Configuration / Governed Work  (not yet implemented)
```

This initiative implements the two boxes above that are reusable and
provider-neutral: **Capability Bundle** definitions and **Atomic
Capability** definitions. Everything else in the chain remains future
work — see "What is not implemented yet" below.

## Relevance, activation, runtime availability, and authorization are distinct

This is a direct application of the operating principle in
[`../core.md`](../core.md#operating-principles):

- **Relevance** — a Project Profile signal suggests a Capability Bundle or
  Atomic Capability could apply to a project. Defined here as a bundle's
  or capability's relevance/adoption signals.
- **Activation** — a future Project Bootstrap decides a capability is
  actually turned on for a specific project. Not implemented here.
- **Runtime availability** — an active runtime/provider can technically
  execute an activated capability. Not implemented here.
- **Authorization** — the Owner has authorized a specific use, especially
  where it is consequential or crosses the project's boundary. Never
  implied by the previous three — see each capability's "Authority"
  section in [`capabilities.md`](./capabilities.md).

A bundle being relevant to a project does not mean every candidate
capability in it becomes active. A capability being active does not mean
it is runtime-available. Runtime availability does not mean it is
authorized to act.

## Where definitions live

- [`bundles.md`](./bundles.md) — the six v0.1 Capability Bundle
  definitions.
- [`capabilities.md`](./capabilities.md) — the eight v0.1 Atomic
  Capability definitions.

Each bundle names its candidate Atomic Capabilities; each capability names
its bundle membership (or cross-cutting status). Membership is recorded
once, in `capabilities.md`, rather than duplicated in both files.

## Cross-cutting concerns

Some concerns are not owned by a single bundle:

- **Research / Discovery** — the `research-discovery` Atomic Capability
  (see [`capabilities.md`](./capabilities.md)) is cross-cutting: it is
  usable on its own, independent of any bundle being relevant.
- **Accessibility** — a cross-cutting standard/gate, primarily activated
  by Web / UI Experience relevance signals, but not owned exclusively by
  that bundle.
- **Security / Privacy** — a cross-cutting standard/gate activated by
  data-sensitive or high-consequence signals, applicable across any
  bundle where those signals are present.
- **Knowledge Capture** — not a Capability Bundle or Atomic Capability. It
  is a Core safeguard/knowledge responsibility — see
  [`../safeguards.md`](../safeguards.md#evidence--provenance-preservation).

This Seed does not yet define how these standards/gates are mechanically
enforced — only that Capability definitions may reference them coherently.

## What is not implemented yet

Project Profile signals detection, Capability activation records and
logic, Standards/Gates enforcement mechanisms, runtime adapters/bindings,
schemas, a validator, and Project Bootstrap all remain future work. See
the repository root [`README.md`](../../README.md) for the roadmap.
