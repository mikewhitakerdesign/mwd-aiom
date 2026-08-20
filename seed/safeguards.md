# AIOM Core Seed — Safeguard Foundation

The minimum provider-neutral safeguard guidance that must hold before
later initiatives implement specific mechanisms (validators, approval
artifacts, runtime probes, and the like). This is a foundation, not a
comprehensive security framework — later initiatives implement the
mechanisms that enforce it.

## Authority

No component may treat its own technical capability as authorization.
Consequential decisions require Owner authorization — see
[core.md — Owner authority](./core.md#owner-authority).

## Scope

Work must be bounded to what is actually authorized. Expanding scope —
building ahead, or inferring additional authority from an adjacent grant —
is not permitted without a new Owner authorization.

## Consequential / external action

Any action that is hard to reverse, crosses the project's boundary, or
affects a system or party beyond the immediate, local, reversible work
requires Owner authorization before it is taken.

## Sensitive-data handling (architectural level)

Durable project state and durable knowledge must not become a vector for
exposing sensitive data beyond its intended audience. Where a project's
state or knowledge records could contain sensitive data, the mechanisms
that define and validate them (schemas, validators) must account for that
before such data is persisted. This Seed does not define specific handling
rules — only that they must exist before sensitive data is persisted.

## Validation

Governed work is not complete until it has been validated against its
constraints. Validation is distinct from the work itself and from the
Owner's decision to accept it.

## Failure / uncertainty escalation

When a component — Orchestrator, capability, or deterministic control —
cannot determine whether a consequential boundary applies, it escalates to
the Owner rather than proceeding on an assumption.

## Evidence / provenance preservation

Where a decision depends on evidence, that evidence must be preserved in a
form that lets the decision be reconstructed later, not only recalled from
conversation.
