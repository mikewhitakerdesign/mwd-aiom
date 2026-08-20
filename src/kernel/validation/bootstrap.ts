import type { ProjectProfile } from '../schemas/project-profile.js';
import { issue, type ValidationIssue } from './result.js';

/**
 * Mechanically checkable Bootstrap Ready structural rules only — whether a
 * required field is structurally present and internally consistent with
 * `bootstrap.ready`, never whether its content is substantively sufficient.
 * See AGENTS.md and CLAUDE.md's Section 8 boundary: "field is structurally
 * present" is a different question from "its content is substantively
 * sufficient," and only the first is answered here.
 *
 * Most individual fields checked here (owner identity, project intent,
 * existing_state_assessment presence, the two consequence confirmations)
 * are already required by projectProfileFrontmatterSchema and so cannot be
 * absent on a document that parsed successfully. The genuinely new
 * cross-field rules are the ones gated on `bootstrap.ready`: the schema
 * allows `ready: true` even when existing-state assessment was never
 * performed, a confirmation is still unresolved, or no Next Governed
 * Action is recorded — those combinations are internally inconsistent and
 * are what this module exists to catch.
 */
export function validateBootstrapReadiness(
  profile: ProjectProfile,
  artifact: string,
): ValidationIssue[] {
  const { frontmatter } = profile;
  const issues: ValidationIssue[] = [];

  if (!frontmatter.owner.identity.trim()) {
    issues.push(
      issue('bootstrap-missing-owner', 'error', 'owner.identity is not represented', {
        artifact,
        path: 'owner.identity',
      }),
    );
  }

  if (!frontmatter.project.intent.trim()) {
    issues.push(
      issue('bootstrap-missing-intent', 'error', 'project.intent is not represented', {
        artifact,
        path: 'project.intent',
      }),
    );
  }

  if (!frontmatter.bootstrap.ready) {
    if (
      !frontmatter.bootstrap.unresolved_items ||
      frontmatter.bootstrap.unresolved_items.length === 0
    ) {
      issues.push(
        issue(
          'bootstrap-not-ready-no-unresolved-items',
          'warning',
          'bootstrap.ready is false but no unresolved_items are structurally represented',
          { artifact, path: 'bootstrap.unresolved_items' },
        ),
      );
    }
    return issues;
  }

  if (!frontmatter.existing_state_assessment.performed) {
    issues.push(
      issue(
        'bootstrap-ready-without-assessment',
        'error',
        'bootstrap.ready is true but existing_state_assessment.performed is false',
        { artifact, path: 'existing_state_assessment.performed' },
      ),
    );
  }

  if (frontmatter.consequence_confirmations.consequential_external_action.value === 'unresolved') {
    issues.push(
      issue(
        'bootstrap-ready-with-unresolved-confirmation',
        'error',
        'bootstrap.ready is true but consequential_external_action confirmation is unresolved',
        { artifact, path: 'consequence_confirmations.consequential_external_action.value' },
      ),
    );
  }

  if (
    frontmatter.consequence_confirmations.sensitive_or_high_consequence_data.value === 'unresolved'
  ) {
    issues.push(
      issue(
        'bootstrap-ready-with-unresolved-confirmation',
        'error',
        'bootstrap.ready is true but sensitive_or_high_consequence_data confirmation is unresolved',
        {
          artifact,
          path: 'consequence_confirmations.sensitive_or_high_consequence_data.value',
        },
      ),
    );
  }

  if (!frontmatter.bootstrap.next_governed_action?.trim()) {
    issues.push(
      issue(
        'bootstrap-ready-without-next-action',
        'error',
        'bootstrap.ready is true but no next_governed_action is represented',
        { artifact, path: 'bootstrap.next_governed_action' },
      ),
    );
  }

  return issues;
}
