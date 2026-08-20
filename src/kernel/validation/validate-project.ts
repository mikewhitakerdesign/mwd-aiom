import { loadCapabilityIndex, type CapabilityIndex } from './capability-index.js';
import { loadProjectState, type LoadedProjectState } from './project-state.js';
import { validateBootstrapReadiness } from './bootstrap.js';
import { validateReferences } from './references.js';
import { buildResult, issue, type ValidationIssue, type ValidationResult } from './result.js';

/**
 * Validates an AIOM project-state directory: mechanical parse validity,
 * cross-document referential integrity, and Bootstrap Ready structural
 * consistency. Read-only — no artifact is mutated, and no relevance,
 * activation, or authorization decision is made; see the Initiative 5
 * completion report's Falsification Gate B / Architecture Separation
 * Test for what this function does and does not decide.
 */
export function validateProjectState(
  dir: string,
  index: CapabilityIndex = loadCapabilityIndex(),
): ValidationResult {
  const state = loadProjectState(dir);
  return buildResult(collectProjectStateIssues(state, index));
}

function collectProjectStateIssues(
  state: LoadedProjectState,
  index: CapabilityIndex,
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

  issues.push(...validateReferences(state, index));

  return issues;
}
