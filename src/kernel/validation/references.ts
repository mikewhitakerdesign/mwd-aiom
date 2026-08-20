import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { CapabilityActivationRecord } from '../schemas/capability-activation.js';
import type { ProjectProfile } from '../schemas/project-profile.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import type { CapabilityIndex } from './capability-index.js';
import type { LoadedProjectState } from './project-state.js';
import { issue, type ValidationIssue } from './result.js';

interface PathedWorkItem {
  readonly path: string;
  readonly data: GovernedWorkItem;
}

interface PathedApproval {
  readonly path: string;
  readonly data: OwnerApprovalArtifact;
}

/**
 * Cross-document referential integrity and mechanically-unambiguous
 * contradiction checks. Operates only on documents that already parsed
 * successfully against their Initiative 4 schema — a document that failed
 * to parse is reported once, at the parse-error level, by
 * validateProjectState; these checks do not re-derive meaning from an
 * artifact that isn't structurally valid in the first place.
 *
 * Every rule here answers a yes/no question about IDs matching or not
 * matching (see the Initiative 5 brief's Section 3 deterministic
 * boundary). Rules that would require judging whether a reference is
 * *appropriate* — not merely whether it resolves — are intentionally
 * excluded; see the Initiative 5 completion report for the specific rule
 * considered and excluded (matching a capability's abstract runtime
 * requirement against a project's free-text
 * `runtime_requirement_reference`).
 */
export function validateReferences(
  state: LoadedProjectState,
  index: CapabilityIndex,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const profile = state.profile?.result.ok ? state.profile.result.data : undefined;
  const capabilityActivation = state.capabilityActivation?.result.ok
    ? state.capabilityActivation.result.data
    : undefined;
  const workItems: PathedWorkItem[] = [];
  for (const entry of state.workItems) {
    if (entry.result.ok) {
      workItems.push({ path: entry.path, data: entry.result.data });
    }
  }
  const approvals: PathedApproval[] = [];
  for (const entry of state.approvals) {
    if (entry.result.ok) {
      approvals.push({ path: entry.path, data: entry.result.data });
    }
  }

  validateCapabilityActivationRecord(
    capabilityActivation,
    state.capabilityActivation?.path,
    index,
    issues,
  );
  validateWorkItems(workItems, capabilityActivation, approvals, index, issues);
  validateApprovals(approvals, workItems, issues);
  validateSeedVersionConsistency(
    profile,
    state.profile?.path,
    capabilityActivation,
    state.capabilityActivation?.path,
    workItems,
    approvals,
    issues,
  );

  return issues;
}

function validateCapabilityActivationRecord(
  capabilityActivation: CapabilityActivationRecord | undefined,
  path: string | undefined,
  index: CapabilityIndex,
  issues: ValidationIssue[],
): void {
  if (!capabilityActivation || !path) {
    return;
  }

  capabilityActivation.bundles.forEach((bundle, entryIndex) => {
    if (!index.bundles.has(bundle.bundle_id)) {
      issues.push(
        issue('unknown-bundle-id', 'error', `unknown Capability Bundle ID: ${bundle.bundle_id}`, {
          artifact: path,
          path: `bundles[${entryIndex}].bundle_id`,
        }),
      );
    }
  });

  capabilityActivation.capabilities.forEach((capability, entryIndex) => {
    if (!index.capabilities.has(capability.capability_id)) {
      issues.push(
        issue(
          'unknown-capability-id',
          'error',
          `unknown Atomic Capability ID: ${capability.capability_id}`,
          { artifact: path, path: `capabilities[${entryIndex}].capability_id` },
        ),
      );
      return;
    }

    if (capability.status === 'not-applicable' || capability.status === 'deferred') {
      return;
    }

    const definition = index.capabilities.get(capability.capability_id);
    if (!definition || definition.crossCutting || definition.bundleId === null) {
      return;
    }

    const bundleEntry = capabilityActivation.bundles.find(
      (bundle) => bundle.bundle_id === definition.bundleId,
    );
    if (bundleEntry?.relevant === 'false') {
      issues.push(
        issue(
          'bundle-membership-contradiction',
          'error',
          `capability "${capability.capability_id}" is ${capability.status} but its owning bundle "${definition.bundleId}" is marked not relevant`,
          { artifact: path, path: `capabilities[${entryIndex}].status` },
        ),
      );
    }
  });
}

function validateWorkItems(
  workItems: readonly PathedWorkItem[],
  capabilityActivation: CapabilityActivationRecord | undefined,
  approvals: readonly PathedApproval[],
  index: CapabilityIndex,
  issues: ValidationIssue[],
): void {
  const seenIds = new Map<string, string>();

  for (const { path, data } of workItems) {
    const fm = data.frontmatter;

    const previousPath = seenIds.get(fm.id);
    if (previousPath) {
      issues.push(
        issue(
          'duplicate-work-item-id',
          'error',
          `duplicate Work Item id "${fm.id}" (also declared in ${previousPath})`,
          { artifact: path, path: 'id' },
        ),
      );
    } else {
      seenIds.set(fm.id, path);
    }

    if (fm.active_capability) {
      if (!index.capabilities.has(fm.active_capability)) {
        issues.push(
          issue(
            'unknown-capability-id',
            'error',
            `unknown Atomic Capability ID: ${fm.active_capability}`,
            { artifact: path, path: 'active_capability' },
          ),
        );
      } else {
        const activationEntry = capabilityActivation?.capabilities.find(
          (capability) => capability.capability_id === fm.active_capability,
        );
        if (activationEntry?.status === 'not-applicable') {
          issues.push(
            issue(
              'not-applicable-active-capability',
              'error',
              `active_capability "${fm.active_capability}" is marked not-applicable in the Capability Activation Record`,
              { artifact: path, path: 'active_capability' },
            ),
          );
        } else if (!activationEntry && capabilityActivation) {
          issues.push(
            issue(
              'active-capability-not-declared',
              'warning',
              `active_capability "${fm.active_capability}" has no entry in the Capability Activation Record`,
              { artifact: path, path: 'active_capability' },
            ),
          );
        }
      }
    }

    for (const [refIndex, bundleId] of (fm.bundle_references ?? []).entries()) {
      if (!index.bundles.has(bundleId)) {
        issues.push(
          issue('unknown-bundle-id', 'error', `unknown Capability Bundle ID: ${bundleId}`, {
            artifact: path,
            path: `bundle_references[${refIndex}]`,
          }),
        );
      }
    }

    if (fm.status === 'complete' && fm.blocker_state === 'blocked') {
      issues.push(
        issue(
          'complete-item-still-blocked',
          'error',
          'status is "complete" but blocker_state is still "blocked"',
          { artifact: path, path: 'status' },
        ),
      );
    }

    if (fm.pending_approval_reference) {
      const target = approvals.find(
        (approval) => approval.data.id === fm.pending_approval_reference,
      );
      if (!target) {
        issues.push(
          issue(
            'broken-approval-reference',
            'error',
            `pending_approval_reference "${fm.pending_approval_reference}" does not resolve to any loaded approval`,
            { artifact: path, path: 'pending_approval_reference' },
          ),
        );
      } else if (target.data.related_work_item_id && target.data.related_work_item_id !== fm.id) {
        issues.push(
          issue(
            'approval-work-item-mismatch',
            'error',
            `approval "${target.data.id}" references related_work_item_id "${target.data.related_work_item_id}", not this work item ("${fm.id}")`,
            { artifact: path, path: 'pending_approval_reference' },
          ),
        );
      }
    }
  }
}

function validateApprovals(
  approvals: readonly PathedApproval[],
  workItems: readonly PathedWorkItem[],
  issues: ValidationIssue[],
): void {
  const seenIds = new Map<string, string>();

  for (const { path, data } of approvals) {
    const previousPath = seenIds.get(data.id);
    if (previousPath) {
      issues.push(
        issue(
          'duplicate-approval-id',
          'error',
          `duplicate Owner Approval Artifact id "${data.id}" (also declared in ${previousPath})`,
          { artifact: path, path: 'id' },
        ),
      );
    } else {
      seenIds.set(data.id, path);
    }

    if (
      data.related_work_item_id &&
      !workItems.some((item) => item.data.frontmatter.id === data.related_work_item_id)
    ) {
      issues.push(
        issue(
          'broken-work-item-reference',
          'error',
          `related_work_item_id "${data.related_work_item_id}" does not resolve to any loaded Work Item`,
          { artifact: path, path: 'related_work_item_id' },
        ),
      );
    }
  }
}

function validateSeedVersionConsistency(
  profile: ProjectProfile | undefined,
  profilePath: string | undefined,
  capabilityActivation: CapabilityActivationRecord | undefined,
  capabilityActivationPath: string | undefined,
  workItems: readonly PathedWorkItem[],
  approvals: readonly PathedApproval[],
  issues: ValidationIssue[],
): void {
  const versions: { artifact: string; version: string }[] = [];
  if (profile && profilePath) {
    versions.push({ artifact: profilePath, version: profile.frontmatter.seed_version });
  }
  if (capabilityActivation && capabilityActivationPath) {
    versions.push({
      artifact: capabilityActivationPath,
      version: capabilityActivation.seed_version,
    });
  }
  for (const { path, data } of workItems) {
    versions.push({ artifact: path, version: data.frontmatter.seed_version });
  }
  for (const { path, data } of approvals) {
    versions.push({ artifact: path, version: data.seed_version });
  }

  if (versions.length === 0) {
    return;
  }

  const baseline = versions[0]!.version;
  for (const entry of versions) {
    if (entry.version !== baseline) {
      issues.push(
        issue(
          'seed-version-mismatch',
          'error',
          `seed_version "${entry.version}" does not match "${baseline}" declared in ${versions[0]!.artifact}`,
          { artifact: entry.artifact, path: 'seed_version' },
        ),
      );
    }
  }
}
