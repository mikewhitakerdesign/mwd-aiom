import type { GateIssue, GateOutcome } from '../transition/types.js';

/**
 * The bounded disposition vocabulary Initiative 7 needs (brief Section
 * 12) — no larger than the six scenarios in Section 20 actually require:
 *
 * - `blocked-by-invalid-state`      — base project validation failed, the
 *   Work Item could not be resolved, or the proposed transition is
 *   structurally unrecognized (unlisted stage pair / stage mismatch).
 * - `blocked-by-unmet-prerequisite` — a deterministic structural
 *   prerequisite this gate checks (validation_state, blocker_state,
 *   capability activation) is not met — distinct from an invalid state and
 *   from the authorization/runtime boundaries below.
 * - `awaiting-owner-authorization`  — the transition crosses the
 *   authorization boundary and no covering, approved Owner Approval
 *   Artifact was found.
 * - `blocked-by-runtime`            — a required capability's runtime
 *   prerequisite has Runtime Probe evidence reporting it unavailable.
 * - `runtime-unknown`               — a required capability's runtime
 *   prerequisite has no evidence, or evidence reporting it unknown.
 * - `requires-qualitative-judgment` — the gate is indeterminate for a
 *   reason that is not a runtime prerequisite (prose approval conditions,
 *   on-demand capability activation) — content only a human/Owner or
 *   specialist reasoning can resolve.
 * - `ready-for-governed-execution`  — no represented deterministic
 *   prerequisite this gate checks currently blocks the transition. This is
 *   never a command to execute — see Section 13.
 */
export type Disposition =
  | 'blocked-by-invalid-state'
  | 'blocked-by-unmet-prerequisite'
  | 'awaiting-owner-authorization'
  | 'blocked-by-runtime'
  | 'runtime-unknown'
  | 'requires-qualitative-judgment'
  | 'ready-for-governed-execution';

/**
 * The Orchestrator's output (Section 15): a disposition plus enough
 * structured context to understand it, without fabricating approval,
 * capability activation, runtime availability, or validation success — all
 * of it is read straight off the TransitionGateResult this composes over,
 * never recomputed.
 */
export interface OrchestrationResult {
  readonly disposition: Disposition;
  readonly workItemId: string;
  readonly transitionId: string | undefined;
  /** The underlying TransitionGateResult outcome this disposition was derived from. */
  readonly gateOutcome: GateOutcome;
  /** The full, unmodified set of gate issues this disposition was derived from. */
  readonly issues: readonly GateIssue[];
  /** A short description of the Owner action required, set only when disposition is "awaiting-owner-authorization". */
  readonly requiredOwnerAction: string | undefined;
  /** The Runtime Requirement ID this disposition is blocked or uncertain on, set only for "blocked-by-runtime" / "runtime-unknown". */
  readonly requiredRuntimeCapability: string | undefined;
  /** True only when disposition is "requires-qualitative-judgment" — a structural signal, not a claim that other dispositions require no judgment at all (see Section 13: executable is never the same as advisable). */
  readonly qualitativeJudgmentRemains: boolean;
}
