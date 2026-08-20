export {
  type GateIssue,
  type GateIssueSeverity,
  type GateOutcome,
  type ProposedTransition,
  type TransitionGateResult,
  type WorkItemStage,
  gateIssue,
} from './types.js';
export { TRANSITION_RULES, findTransitionRule, type TransitionRule } from './rules.js';
export {
  approvalsBoundToWorkItem,
  evaluateApprovalCoverage,
  type ApprovalCoverage,
} from './scope.js';
export { evaluateCapabilityRequirement } from './capability.js';
export { evaluateTransition } from './gate.js';
