# Capability Bundles (v0.1)

A Capability Bundle groups Atomic Capabilities that tend to become
relevant together, under a shared area of operating responsibility. A
bundle is a grouping of *relevance*, not a project type, a template, or a
guarantee that every capability it lists will be activated for a given
project — see [`README.md`](./README.md#relevance-activation-runtime-availability-and-authorization-are-distinct).

Each bundle below records: a stable ID, purpose, the kind of Project
Profile signal that could make it relevant, its candidate Atomic
Capabilities (defined in [`capabilities.md`](./capabilities.md)),
cross-cutting concerns it commonly intersects with, and what it explicitly
does not own.

These are the six approved v0.1 bundles. This is not a claim that every
project maps cleanly onto one bundle — most non-trivial projects will make
more than one relevant at once.

---

## 1. Repository / Versioned Delivery

**ID:** `repository-versioned-delivery`

**Purpose:** Maintaining version-controlled source and delivering change
as discrete, reviewable, auditable increments.

**Relevance signals:** the project maintains a version-controlled
repository; work must be delivered as scoped, reviewable change sets
(branches, commits, pull requests); more than one contributor, or
asynchronous work, needs a reconstructable history.

**Candidate Atomic Capabilities:** `repository-inspection`,
`bounded-delivery`.

**Commonly intersects with:** `research-discovery` (cross-cutting;
understanding existing repository state before acting); Knowledge Capture
(decision/observation records that accompany delivered change).

**Does not own:** implementing the functional change being delivered (see
Software Engineering); deployment or runtime operation of delivered code
(see Persistent Operation / Monitoring).

---

## 2. Software Engineering

**ID:** `software-engineering`

**Purpose:** Implementing, modifying, and validating software functionality
within a codebase against defined requirements.

**Relevance signals:** the project involves writing or modifying source
code; functional requirements exist independent of how the change is
delivered; automated checks (lint, type-check, test, build) exist or are
warranted.

**Candidate Atomic Capabilities:** `software-implementation`,
`deterministic-validation`.

**Commonly intersects with:** `research-discovery` (cross-cutting);
Repository / Versioned Delivery (the change this bundle produces is
typically delivered through that bundle, not by this one).

**Does not own:** repository/version-control mechanics (see Repository /
Versioned Delivery); user-facing interaction/visual design (see Web / UI
Experience); publishing or calling external systems (see External Action
/ Integration).

---

## 3. Web / UI Experience

**ID:** `web-ui-experience`

**Purpose:** Designing, implementing, and validating user-facing
interfaces and interaction experiences.

**Relevance signals:** the project presents a rendered or interactive
surface to users; there is a defined audience that directly interacts
with the output; visual or interaction design requirements exist.

**Candidate Atomic Capabilities:** `ui-implementation`.

**Commonly intersects with:** Accessibility (cross-cutting standard/gate,
primarily activated by this bundle's relevance); `research-discovery`
(cross-cutting).

**Does not own:** non-UI application logic (see Software Engineering);
authoring the underlying content it renders (see Content / Publication),
though it may render content it does not author.

---

## 4. Content / Publication

**ID:** `content-publication`

**Purpose:** Authoring, curating, and publishing informational or
narrative content intended for an audience, with a publication lifecycle
distinct from software delivery.

**Relevance signals:** the project produces documentation, articles,
structured written or media content; content has its own review/publish
lifecycle rather than being a byproduct of a code change.

**Candidate Atomic Capabilities:** `research-discovery` (cross-cutting;
typically heavily used here), and, where publication leaves the project's
own boundary, `external-action-execution`; where content is delivered
through a version-controlled pipeline, `bounded-delivery`.

**Commonly intersects with:** Web / UI Experience (may render this
bundle's content, without authoring it); Repository / Versioned Delivery
(where content lives in the same repository as code).

**Does not own:** the interface that renders published content (see Web /
UI Experience); implementing software functionality (see Software
Engineering).

---

## 5. External Action / Integration

**ID:** `external-action-integration`

**Purpose:** Taking action on, or exchanging data with, systems, services,
or parties beyond the project's own local, reversible boundary.

**Relevance signals:** the project needs to call external APIs or
services; the project needs to publish, post, or notify outside systems;
the project integrates with third-party platforms.

**Candidate Atomic Capabilities:** `external-action-execution`.

**Commonly intersects with:** `research-discovery` (cross-cutting;
understanding an external system's behavior before acting); Security /
Privacy (cross-cutting standard/gate, frequently activated alongside this
bundle where data crosses the boundary).

**Does not own:** authorization policy for when external action may
proceed — that is Owner authority per
[`../safeguards.md`](../safeguards.md#consequential--external-action), not
something this bundle grants; the internal implementation that prepares
what gets sent (see Software Engineering).

---

## 6. Persistent Operation / Monitoring

**ID:** `persistent-operation-monitoring`

**Purpose:** Work that continues, recurs, or must be observed and
maintained over time, beyond a single bounded session or delivery.

**Relevance signals:** the project requires scheduled or recurring
execution; the project requires ongoing monitoring, alerting, or state
continuation across sessions; the project has operational concerns beyond
a single delivery.

**Candidate Atomic Capabilities:** `persistent-continuation`.

**Commonly intersects with:** `research-discovery` (cross-cutting);
External Action / Integration (recurring work often needs to act on or
report to external systems); Repository / Versioned Delivery (the
recurring work usually delivers change through that bundle).

**Does not own:** the initial implementation of what is being operated or
monitored (see Software Engineering / Web / UI Experience); the mechanics
of the runtime scheduler or probe itself, which is a future runtime
adapter concern, not a Capability Bundle responsibility.
