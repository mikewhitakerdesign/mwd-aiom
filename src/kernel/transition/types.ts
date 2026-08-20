import type { z } from 'zod';
import { workItemStageSchema } from '../schemas/work-item.js';

/**
 * Re-derived from the Initiative 4 Work Item schema rather than duplicated,
 * so the Transition Gate's rule table cannot silently drift from the
 * bounded, proving-only stage vocabulary it governs (see
 * seed/templates/README.md).
 */
export type WorkItemStage = z.infer<typeof workItemStageSchema>;

/**
 * The smallest structured representation of one proposed transition — an
 * ephemeral, programmatic input for v0.1, not a durable artifact (see
 * Initiative 6 brief Section 4). Nothing here is persisted by the gate.
 */
export interface ProposedTransition {
  /** The Governed Work Item this transition is proposed against. */
  readonly workItemId: string;
  /** The Work Item's source stage, as asserted by the caller. */
  readonly fromStage: WorkItemStage;
  /** The proposed target stage. */
  readonly toStage: WorkItemStage;
  /**
   * A label for the specific action/transition being evaluated, matched
   * only by exact string equality against an Owner Approval Artifact's
   * `authorized_action` — never interpreted semantically (see Section 10).
   */
  readonly action?: string;
  /**
   * The Atomic Capability expected to perform this transition/action, if
   * relevant. Defaults to the Work Item's own `active_capability` when
   * omitted.
   */
  readonly capabilityId?: string;
  /**
   * Pins evaluation to one specific Owner Approval Artifact ID rather than
   * auto-discovering candidates by `related_work_item_id`. Optional.
   */
  readonly approvalId?: string;
}

/**
 * Three-way outcome, deliberately not named `permitted` (see Section 17):
 * `mechanically-eligible` means only that no deterministic prerequisite
 * this gate checks currently blocks the transition — never that the
 * transition should be taken. `indeterminate` is a first-class outcome,
 * not collapsed into either of the other two (see Section 18).
 */
export type GateOutcome = 'mechanically-eligible' | 'mechanically-blocked' | 'indeterminate';

/**
 * A third severity beyond validation/result.ts's error/warning pair:
 * `indeterminate` marks a mechanically unresolvable prerequisite (prose-only
 * scope, absent runtime evidence) that must not be silently treated as
 * either passing or failing. Kept local to this module rather than widening
 * the shared ValidationSeverity, since general project validation has no
 * use for a third state.
 */
export type GateIssueSeverity = 'error' | 'warning' | 'indeterminate';

export interface GateIssue {
  readonly code: string;
  readonly severity: GateIssueSeverity;
  readonly message: string;
  readonly path?: string;
  /**
   * The Runtime Requirement ID this issue concerns, when it is a runtime-
   * prerequisite issue (Initiative 7). Lets a caller — e.g. the
   * Orchestrator — identify the specific unmet/unknown runtime capability
   * structurally, without re-parsing this issue's prose `message` or
   * re-reading project state the gate already consulted.
   */
  readonly requirementId?: string;
}

export interface TransitionGateResult {
  readonly outcome: GateOutcome;
  readonly workItemId: string;
  /** The matched TransitionRule id, if the requested from/to pair resolved to one. */
  readonly transitionId: string | undefined;
  readonly issues: readonly GateIssue[];
}

export function gateIssue(
  code: string,
  severity: GateIssueSeverity,
  message: string,
  path?: string,
  requirementId?: string,
): GateIssue {
  return {
    code,
    severity,
    message,
    ...(path !== undefined ? { path } : {}),
    ...(requirementId !== undefined ? { requirementId } : {}),
  };
}
