import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { ProposedTransition } from './types.js';

/**
 * Deterministic Approval Artifact coverage matching (Initiative 6 brief
 * Section 10 — the central falsification point). Only structured fields are
 * read here: `related_work_item_id`, `status`, `expiration`, and
 * `authorized_action` (matched by exact string equality only). `scope` and
 * `target_context` are never inspected — they are free-form prose on the
 * current Owner Approval Artifact schema and cannot safely support a
 * mechanical coverage decision (see the Initiative 6 completion report's
 * Knowledge Capture section). `conditions` is read only to detect that
 * prose conditions exist, never to judge whether they are satisfied.
 */

export type ApprovalCoverage =
  | { readonly kind: 'covered' }
  | { readonly kind: 'not-covered'; readonly reason: string }
  | { readonly kind: 'indeterminate'; readonly reason: string };

export function evaluateApprovalCoverage(
  approval: OwnerApprovalArtifact,
  transition: ProposedTransition,
  now: Date,
): ApprovalCoverage {
  if (approval.status !== 'approved') {
    return {
      kind: 'not-covered',
      reason: `approval "${approval.id}" has status "${approval.status}"; only "approved" satisfies an authorization prerequisite`,
    };
  }

  if (approval.expiration && new Date(approval.expiration).getTime() <= now.getTime()) {
    return {
      kind: 'not-covered',
      reason: `approval "${approval.id}" has passed its structured expiration (${approval.expiration})`,
    };
  }

  if (transition.action) {
    if (!approval.authorized_action) {
      return {
        kind: 'not-covered',
        reason: `approval "${approval.id}" does not record a structured authorized_action to confirm it covers this action`,
      };
    }
    if (approval.authorized_action !== transition.action) {
      return {
        kind: 'not-covered',
        reason: `approval "${approval.id}" authorizes a different action ("${approval.authorized_action}") than the one proposed ("${transition.action}")`,
      };
    }
  }

  if (approval.conditions && approval.conditions.length > 0) {
    return {
      kind: 'indeterminate',
      reason: `approval "${approval.id}" declares conditions that require qualitative interpretation to confirm they are not violated`,
    };
  }

  return { kind: 'covered' };
}

/**
 * Approvals structurally bound to a Work Item — the only mechanically safe
 * pool of candidates. An approval with no `related_work_item_id`, or one
 * naming a different Work Item, is never treated as covering this
 * transition: absence of the structured link is a definite negative
 * signal, not ambiguity requiring judgment (that distinction is what keeps
 * `not-covered` and `indeterminate` meaningfully different — see Section
 * 18).
 */
export function approvalsBoundToWorkItem(
  approvals: readonly OwnerApprovalArtifact[],
  workItemId: string,
): OwnerApprovalArtifact[] {
  return approvals.filter((approval) => approval.related_work_item_id === workItemId);
}
