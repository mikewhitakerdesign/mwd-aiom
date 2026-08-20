import { ok } from '../parsing/index.js';
import type { CapabilityActivationRecord } from '../schemas/capability-activation.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { ProjectProfile } from '../schemas/project-profile.js';
import { validateBootstrapReadiness } from '../validation/bootstrap.js';
import type { CapabilityIndex } from '../validation/capability-index.js';
import type { LoadedProjectState } from '../validation/project-state.js';
import { validateReferences } from '../validation/references.js';
import { buildResult, type ValidationIssue, type ValidationResult } from '../validation/result.js';

/**
 * Ephemeral-mode Bootstrap Ready evaluation (Section 11): when no durable
 * state is justified, there is nothing on disk to run `validateProjectState`
 * against, and this repository's "do not create durable state merely
 * because Bootstrap was invoked" boundary means Bootstrap must not write a
 * throwaway directory just to reuse the disk-based validator.
 *
 * `validateBootstrapReadiness` and `validateReferences` are already
 * disk-agnostic — they operate on already-parsed data, not paths — so this
 * module assembles the same `LoadedProjectState` shape
 * `validation/project-state.ts` produces from disk, from in-memory
 * candidate artifacts instead, and reuses those two functions unchanged.
 * This is the same validation Bootstrap runs post-materialization in
 * `aiom-managed` mode (see bootstrap.ts), just without a filesystem
 * round-trip.
 */
export function buildCandidateState(candidate: {
  readonly profile: ProjectProfile;
  readonly capabilityActivation: CapabilityActivationRecord;
  readonly workItems: readonly GovernedWorkItem[];
  readonly approvals: readonly OwnerApprovalArtifact[];
}): LoadedProjectState {
  return {
    dir: '(candidate, not materialized)',
    profile: { path: 'profile.md', result: ok(candidate.profile) },
    capabilityActivation: {
      path: 'capabilities.yaml',
      result: ok(candidate.capabilityActivation),
    },
    workItems: candidate.workItems.map((item) => ({
      path: `work/${item.frontmatter.id}.md`,
      result: ok(item),
    })),
    approvals: candidate.approvals.map((approval) => ({
      path: `approvals/${approval.id}.yaml`,
      result: ok(approval),
    })),
  };
}

export function validateCandidateState(
  state: LoadedProjectState,
  index: CapabilityIndex,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (state.profile?.result.ok) {
    issues.push(...validateBootstrapReadiness(state.profile.result.data, state.profile.path));
  }

  issues.push(...validateReferences(state, index));

  return buildResult(issues);
}
