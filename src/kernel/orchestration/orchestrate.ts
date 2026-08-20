import { evaluateTransition } from '../transition/gate.js';
import type { GateIssue, ProposedTransition, TransitionGateResult } from '../transition/types.js';
import type { RuntimeEvidenceMap } from '../runtime/index.js';
import { loadCapabilityIndex, type CapabilityIndex } from '../validation/capability-index.js';
import type { Disposition, OrchestrationResult } from './types.js';

const INVALID_STATE_CODES = new Set([
  'project-state-invalid',
  'work-item-not-found',
  'stage-mismatch',
  'transition-not-permitted',
]);

const AUTHORIZATION_BLOCKED_CODES = new Set([
  'no-covering-approval-found',
  'approval-not-found',
  'approval-work-item-mismatch',
]);

const RUNTIME_BLOCKED_CODES = new Set(['runtime-requirement-unavailable']);
const RUNTIME_INDETERMINATE_CODES = new Set(['runtime-prerequisite-unverified']);

const REQUIRED_OWNER_ACTION =
  'An approved Owner Approval Artifact covering this Work Item, this action, and the current time is required before this transition may proceed.';

/**
 * The Runtime-Neutral Orchestration foundation (Initiative 7 brief Sections
 * 12–16): composes TransitionGateResult — itself already a composition of
 * Initiative 5's project-state validation, Initiative 6's Transition Gate,
 * and, when supplied, Initiative 7's Runtime Evidence — into a bounded
 * disposition. This function performs no validation, transition, or
 * authorization logic of its own; every fact in its output is read
 * straight off the TransitionGateResult it wraps (Section 14: compose
 * existing results, do not duplicate them). Read-only, like the gate it
 * wraps (Section 16): nothing here mutates project state, advances a Work
 * Item, or executes the proposed action.
 *
 * `runtimeEvidence` is optional and ephemeral, exactly as in
 * evaluateTransition — orchestrate() never probes the runtime itself; a
 * caller that wants runtime evidence considered must supply it (e.g. from
 * runtime/probe.ts).
 */
export function orchestrate(
  dir: string,
  transition: ProposedTransition,
  options: {
    readonly index?: CapabilityIndex;
    readonly now?: Date;
    readonly runtimeEvidence?: RuntimeEvidenceMap;
  } = {},
): OrchestrationResult {
  const index = options.index ?? loadCapabilityIndex();
  const now = options.now ?? new Date();
  const gateResult = evaluateTransition(dir, transition, index, now, options.runtimeEvidence);

  return classify(gateResult);
}

function classify(gateResult: TransitionGateResult): OrchestrationResult {
  const codes = gateResult.issues.map((entry) => entry.code);
  const { disposition, requiredRuntimeCapability } = resolveDisposition(
    gateResult.outcome,
    codes,
    gateResult.issues,
  );

  return {
    disposition,
    workItemId: gateResult.workItemId,
    transitionId: gateResult.transitionId,
    gateOutcome: gateResult.outcome,
    issues: gateResult.issues,
    requiredOwnerAction: disposition === 'awaiting-owner-authorization' ? REQUIRED_OWNER_ACTION : undefined,
    requiredRuntimeCapability,
    qualitativeJudgmentRemains: disposition === 'requires-qualitative-judgment',
  };
}

function resolveDisposition(
  outcome: TransitionGateResult['outcome'],
  codes: readonly string[],
  issues: readonly GateIssue[],
): { disposition: Disposition; requiredRuntimeCapability: string | undefined } {
  if (codes.some((code) => INVALID_STATE_CODES.has(code))) {
    return { disposition: 'blocked-by-invalid-state', requiredRuntimeCapability: undefined };
  }

  if (outcome === 'mechanically-blocked') {
    if (codes.some((code) => AUTHORIZATION_BLOCKED_CODES.has(code))) {
      return { disposition: 'awaiting-owner-authorization', requiredRuntimeCapability: undefined };
    }
    if (codes.some((code) => RUNTIME_BLOCKED_CODES.has(code))) {
      return {
        disposition: 'blocked-by-runtime',
        requiredRuntimeCapability: findRequirementId(issues, RUNTIME_BLOCKED_CODES),
      };
    }
    return { disposition: 'blocked-by-unmet-prerequisite', requiredRuntimeCapability: undefined };
  }

  if (outcome === 'indeterminate') {
    if (codes.some((code) => RUNTIME_INDETERMINATE_CODES.has(code))) {
      return {
        disposition: 'runtime-unknown',
        requiredRuntimeCapability: findRequirementId(issues, RUNTIME_INDETERMINATE_CODES),
      };
    }
    return { disposition: 'requires-qualitative-judgment', requiredRuntimeCapability: undefined };
  }

  return { disposition: 'ready-for-governed-execution', requiredRuntimeCapability: undefined };
}

function findRequirementId(
  issues: readonly GateIssue[],
  codes: ReadonlySet<string>,
): string | undefined {
  return issues.find((entry) => codes.has(entry.code))?.requirementId;
}
