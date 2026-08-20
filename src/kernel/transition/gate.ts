import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import type { RuntimeEvidenceMap } from '../runtime/index.js';
import { loadCapabilityIndex, type CapabilityIndex } from '../validation/capability-index.js';
import { loadProjectState } from '../validation/project-state.js';
import { validateProjectState } from '../validation/validate-project.js';
import { evaluateCapabilityRequirement } from './capability.js';
import { findTransitionRule } from './rules.js';
import { approvalsBoundToWorkItem, evaluateApprovalCoverage } from './scope.js';
import {
  gateIssue,
  type GateIssue,
  type GateOutcome,
  type ProposedTransition,
  type TransitionGateResult,
} from './types.js';

/**
 * Deterministic evaluation of one proposed Work Item transition (Initiative
 * 6 brief). Read-only: no artifact is loaded for mutation, and nothing this
 * function does writes state, marks an approval consumed, or advances a
 * workflow — see Section 19.
 *
 * Operates only after the underlying project state is mechanically readable
 * enough to evaluate (Section 3): if base project validation
 * (validateProjectState, reused unchanged from Initiative 5) reports any
 * error, this function reports that prerequisite failure and stops, rather
 * than attempting interpretive recovery over structurally invalid state.
 *
 * `runtimeEvidence` is an optional, caller-supplied, ephemeral Runtime
 * Evidence map (Initiative 7) — this function never probes the runtime
 * itself, and omitting it reproduces Initiative 6's exact original
 * behavior (a required capability's runtime prerequisite stays
 * indeterminate). Supplying it lets an already-required capability's
 * runtime prerequisite resolve deterministically — see
 * evaluateCapabilityRequirement in capability.ts.
 */
export function evaluateTransition(
  dir: string,
  transition: ProposedTransition,
  index: CapabilityIndex = loadCapabilityIndex(),
  now: Date = new Date(),
  runtimeEvidence?: RuntimeEvidenceMap,
): TransitionGateResult {
  const baseValidation = validateProjectState(dir, index);
  if (baseValidation.errors.length > 0) {
    return finish(transition.workItemId, undefined, [
      gateIssue(
        'project-state-invalid',
        'error',
        `base project validation reported ${baseValidation.errors.length} error(s); resolve them before transition evaluation (first: ${baseValidation.errors[0]!.code} — ${baseValidation.errors[0]!.message})`,
      ),
    ]);
  }

  const state = loadProjectState(dir);
  const workItems: GovernedWorkItem[] = state.workItems
    .filter((entry) => entry.result.ok)
    .map((entry) => (entry.result as { ok: true; data: GovernedWorkItem }).data);
  const approvals: OwnerApprovalArtifact[] = state.approvals
    .filter((entry) => entry.result.ok)
    .map((entry) => (entry.result as { ok: true; data: OwnerApprovalArtifact }).data);
  const capabilityActivation = state.capabilityActivation?.result.ok
    ? state.capabilityActivation.result.data
    : undefined;

  const workItem = workItems.find((item) => item.frontmatter.id === transition.workItemId);
  if (!workItem) {
    return finish(transition.workItemId, undefined, [
      gateIssue(
        'work-item-not-found',
        'error',
        `no Work Item with id "${transition.workItemId}" was found in this project state`,
        'workItemId',
      ),
    ]);
  }

  // Base validation already guarantees a parseable capabilities.yaml exists
  // (missing-capability-activation-record is an error caught above), so
  // this is unreachable in practice; the check exists only to satisfy the
  // type system without an unsafe assertion.
  if (!capabilityActivation) {
    return finish(transition.workItemId, undefined, [
      gateIssue(
        'project-state-invalid',
        'error',
        'no Capability Activation Record could be loaded for this project state',
      ),
    ]);
  }

  const issues: GateIssue[] = [];

  if (workItem.frontmatter.stage !== transition.fromStage) {
    issues.push(
      gateIssue(
        'stage-mismatch',
        'error',
        `requested fromStage "${transition.fromStage}" does not match the Work Item's recorded stage "${workItem.frontmatter.stage}"`,
        'fromStage',
      ),
    );
    return finish(transition.workItemId, undefined, issues);
  }

  const rule = findTransitionRule(transition.fromStage, transition.toStage);
  if (!rule) {
    issues.push(
      gateIssue(
        'transition-not-permitted',
        'error',
        `"${transition.fromStage}" -> "${transition.toStage}" is not in the proving transition-rule set`,
      ),
    );
    return finish(transition.workItemId, undefined, issues);
  }

  if (rule.requiresValidationPassed && workItem.frontmatter.validation_state !== 'passed') {
    issues.push(
      gateIssue(
        'validation-not-passed',
        'error',
        `transition "${rule.id}" requires validation_state "passed"; current value is "${workItem.frontmatter.validation_state}"`,
        'validation_state',
      ),
    );
  }

  if (rule.requiresBlockerClear && workItem.frontmatter.blocker_state !== 'none') {
    issues.push(
      gateIssue(
        'blocker-present',
        'error',
        `transition "${rule.id}" requires blocker_state "none"; current value is "${workItem.frontmatter.blocker_state}"`,
        'blocker_state',
      ),
    );
  }

  const capabilityId = transition.capabilityId ?? workItem.frontmatter.active_capability;
  if (capabilityId) {
    issues.push(
      ...evaluateCapabilityRequirement(capabilityId, index, capabilityActivation, runtimeEvidence),
    );
  }

  if (rule.authorityBoundary) {
    issues.push(
      ...evaluateAuthorityBoundary(workItem, transition, approvals, now),
    );
  }

  return finish(transition.workItemId, rule.id, issues);
}

function evaluateAuthorityBoundary(
  workItem: GovernedWorkItem,
  transition: ProposedTransition,
  approvals: readonly OwnerApprovalArtifact[],
  now: Date,
): GateIssue[] {
  const requirement = workItem.frontmatter.authority_requirement;
  if (requirement === 'none') {
    return [];
  }

  // Both "owner-authorization-required" and "owner-authorization-satisfied"
  // are independently verified against an Owner Approval Artifact here —
  // the Work Item's own status field is never trusted as proof by itself
  // (Section 7: "That must be proven by an applicable Approval Artifact").
  if (transition.approvalId) {
    const pinned = approvals.find((approval) => approval.id === transition.approvalId);
    if (!pinned) {
      return [
        gateIssue(
          'approval-not-found',
          'error',
          `approvalId "${transition.approvalId}" does not resolve to any loaded Owner Approval Artifact`,
          'approvalId',
        ),
      ];
    }
    if (pinned.related_work_item_id !== workItem.frontmatter.id) {
      return [
        gateIssue(
          'approval-work-item-mismatch',
          'error',
          `approval "${pinned.id}" references related_work_item_id "${pinned.related_work_item_id ?? '(none)'}", not this Work Item ("${workItem.frontmatter.id}")`,
          'approvalId',
        ),
      ];
    }
    return coverageIssues([pinned], transition, now);
  }

  const bound = approvalsBoundToWorkItem(approvals, workItem.frontmatter.id);
  if (bound.length === 0) {
    return [
      gateIssue(
        'no-covering-approval-found',
        'error',
        `Owner authorization is required but no Owner Approval Artifact references Work Item "${workItem.frontmatter.id}"`,
        'authority_requirement',
      ),
    ];
  }

  return coverageIssues(bound, transition, now);
}

function coverageIssues(
  candidates: readonly OwnerApprovalArtifact[],
  transition: ProposedTransition,
  now: Date,
): GateIssue[] {
  const results = candidates.map((approval) => evaluateApprovalCoverage(approval, transition, now));

  if (results.some((result) => result.kind === 'covered')) {
    return [];
  }

  const indeterminate = results.find((result) => result.kind === 'indeterminate');
  if (indeterminate && indeterminate.kind === 'indeterminate') {
    return [gateIssue('approval-coverage-indeterminate', 'indeterminate', indeterminate.reason)];
  }

  const reasons = results
    .filter((result): result is { kind: 'not-covered'; reason: string } => result.kind === 'not-covered')
    .map((result) => result.reason)
    .join('; ');
  return [
    gateIssue(
      'no-covering-approval-found',
      'error',
      `no loaded Owner Approval Artifact mechanically covers this transition: ${reasons}`,
      'authority_requirement',
    ),
  ];
}

function finish(
  workItemId: string,
  transitionId: string | undefined,
  issues: readonly GateIssue[],
): TransitionGateResult {
  return { outcome: computeOutcome(issues), workItemId, transitionId, issues };
}

function computeOutcome(issues: readonly GateIssue[]): GateOutcome {
  if (issues.some((issue) => issue.severity === 'error')) {
    return 'mechanically-blocked';
  }
  if (issues.some((issue) => issue.severity === 'indeterminate')) {
    return 'indeterminate';
  }
  return 'mechanically-eligible';
}
