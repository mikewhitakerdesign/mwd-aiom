import { loadCapabilityIndex, type CapabilityIndex } from './capability-index.js';
import { loadProjectState, type LoadedProjectState } from './project-state.js';
import { validateBootstrapReadiness } from './bootstrap.js';
import { validateReferences } from './references.js';
import { validateAuthorityEvidence } from './authority.js';
import { validateSeedSnapshotIntegrity } from './seed-snapshot-integrity.js';
import { buildResult, issue, type ValidationIssue, type ValidationResult } from './result.js';

/**
 * Validates an AIOM project-state directory: mechanical parse validity,
 * cross-document referential integrity, and Bootstrap Ready structural
 * consistency. Read-only — no artifact is mutated, and no relevance,
 * activation, or authorization decision is made; see the Initiative 5
 * completion report's Falsification Gate B / Architecture Separation
 * Test for what this function does and does not decide.
 *
 * `now` defaults to the current clock and is used only by the Initiative
 * 11 authority-evidence check (Owner Approval Artifact expiration); it is
 * not part of the public I10 `validate` invocation request contract —
 * production/runtime validation uses the current clock, and kernel tests
 * inject a fixed one directly.
 */
export function validateProjectState(
  dir: string,
  index: CapabilityIndex = loadCapabilityIndex(),
  now: Date = new Date(),
): ValidationResult {
  const state = loadProjectState(dir);
  return buildResult(collectProjectStateIssues(dir, state, index, now));
}

function collectProjectStateIssues(
  dir: string,
  state: LoadedProjectState,
  index: CapabilityIndex,
  now: Date,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!state.profile) {
    issues.push(
      issue('missing-project-profile', 'error', 'no profile.md found in project-state directory'),
    );
  } else if (!state.profile.result.ok) {
    issues.push(
      issue('parse-error', 'error', state.profile.result.error, {
        artifact: state.profile.path,
      }),
    );
  } else {
    issues.push(...validateBootstrapReadiness(state.profile.result.data, state.profile.path));
  }

  if (!state.capabilityActivation) {
    issues.push(
      issue(
        'missing-capability-activation-record',
        'error',
        'no capabilities.yaml found in project-state directory',
      ),
    );
  } else if (!state.capabilityActivation.result.ok) {
    issues.push(
      issue('parse-error', 'error', state.capabilityActivation.result.error, {
        artifact: state.capabilityActivation.path,
      }),
    );
  }

  for (const workItem of state.workItems) {
    if (!workItem.result.ok) {
      issues.push(
        issue('parse-error', 'error', workItem.result.error, { artifact: workItem.path }),
      );
    }
  }

  for (const approval of state.approvals) {
    if (!approval.result.ok) {
      issues.push(issue('parse-error', 'error', approval.result.error, { artifact: approval.path }));
    }
  }

  const referenceIssues = validateReferences(state, index);
  issues.push(...referenceIssues);
  issues.push(...validateAuthorityEvidence(state, now));

  const seedVersionInternallyConsistent = !referenceIssues.some(
    (referenceIssue) => referenceIssue.code === 'seed-version-mismatch',
  );
  if (state.profile?.result.ok && seedVersionInternallyConsistent) {
    issues.push(
      ...validateSeedSnapshotIntegrity(dir, state.profile.result.data.frontmatter.seed_version),
    );
  }

  return issues;
}
