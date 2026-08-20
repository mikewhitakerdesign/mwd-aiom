# A cold agent with zero conversation history correctly reconstructed a Bootstrap-materialized project's governed state from `.aiom/` alone

**Date:** 2026-08-20
**Context:** Initiative 8 — Bootstrap Execution + Synthetic End-to-End Proof, Section 25 fresh-session resume test

## Finding

Initiative 8's brief (Section 25) required proof that an AIOM-managed
project's durable state supports resumption without depending on the
Bootstrap session's own conversational history — and asked for an actual
fresh-runtime test where launching one programmatically is possible,
rather than only a manual protocol.

Two proofs were produced. First, `tests/kernel/bootstrap/resume.test.ts`
mechanically proves the deterministic half: after `runBootstrap()`
materializes a Scenario-B-shaped project to a temp directory, a second,
independent code path — fresh calls to `loadProjectState`,
`validateProjectState`, and `orchestrate()`, touching only the directory
path, never the original `BootstrapResult` object — reconstructs the
Project Profile, Capability Activation Record, and Work Item, and
confirms `validateProjectState` reports valid and `orchestrate()` returns
`ready-for-governed-execution` for the next transition.

Second, and going beyond a mechanical proof: a real fresh agent was
spawned via the Agent tool (general-purpose, no `isolation` — a new
in-process agent with no memory of this conversation, per the tool's own
contract) and given only a scratch directory path containing a
Bootstrap-materialized project, with no other context. Asked to answer
nine questions about the project (identity, Owner, AIOM-managed status,
capability activation, current Work Item, approval state, consequence
confirmations, validation guidance, and next-step responsibility) purely
by reading files there, the agent correctly answered all nine — including
correctly reasoning that the *absence* of an Owner Approval Artifact was
expected (since the Work Item's `authority_requirement` was `none`), not
a gap, and correctly noting that `AGENTS.md`'s validation-guidance section
honestly disclaims automated validation actually having run in its own
case, since it had no access to `mwd-aiom`'s kernel.

## Why this matters

This is the first empirical evidence, in this repository, of resumption
from a genuinely materialized `.aiom`-shaped directory — every prior
fresh-session continuity evidence (see
[fresh-session-context-continuity](./2026-08-20-fresh-session-context-continuity.md))
concerned reconstructing *mwd-aiom's own development state*, not a
downstream project's governed state. It is also the first test of
whether the project-facing `AGENTS.md`/`CLAUDE.md` pointer templates
(Section 31) actually work for their stated purpose on an agent that
never saw them being designed.

## Remaining limitation / falsification boundary

Both proofs used a synthetic Scenario-B-shaped project with no Owner
Approval Artifact and a single Work Item at `research` stage — the
simplest resumable case. Neither test exercises resumption of a project
with a `blocked` Work Item, an in-flight approval, multiple Work Items, or
a genuinely separate *Claude Code* session (the Agent tool's subagent is
architecturally close but not identical to a fully separate top-level
session). The Agent-tool cross-check is real empirical evidence, not a
substitute for eventually observing this with a real, standalone runtime
session on a real project (Initiative 9).
