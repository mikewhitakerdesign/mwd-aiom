import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { LoadedProjectState } from './project-state.js';
import { issue, type ValidationIssue } from './result.js';

/**
 * Initiative 11: an advisory, general-validation-only check for whether a
 * Work Item's `authority_requirement: owner-authorization-required` can
 * currently be proven from project state. This is deliberately narrower
 * than Transition Gate's evaluateAuthorityBoundary (gate.ts) — it never
 * evaluates `authorized_action`, `conditions`, `scope`, `target_context`,
 * or `mode`, all of which require transition/action context general
 * validation does not have. A Work Item with insufficient evidence is
 * mechanically suspicious, not invalid: pending Owner authorization is a
 * normal project state, so this emits a warning, never an error.
 */
export function validateAuthorityEvidence(
  state: LoadedProjectState,
  now: Date,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const approvals: OwnerApprovalArtifact[] = [];
  for (const entry of state.approvals) {
    if (entry.result.ok) {
      approvals.push(entry.result.data);
    }
  }

  for (const entry of state.workItems) {
    if (!entry.result.ok) {
      continue;
    }
    const workItem = entry.result.data;
    if (workItem.frontmatter.authority_requirement !== 'owner-authorization-required') {
      continue;
    }

    const hasQualifyingApproval = approvals.some(
      (approval) =>
        approval.related_work_item_id === workItem.frontmatter.id &&
        approval.status === 'approved' &&
        (!approval.expiration || new Date(approval.expiration) > now),
    );

    if (!hasQualifyingApproval) {
      issues.push(
        issue(
          'owner-authorization-unproven',
          'warning',
          `Work Item declares authority_requirement "owner-authorization-required" but no successfully loaded, approved, unexpired Owner Approval Artifact is currently bound to it`,
          { artifact: entry.path, path: 'authority_requirement' },
        ),
      );
    }
  }

  return issues;
}
