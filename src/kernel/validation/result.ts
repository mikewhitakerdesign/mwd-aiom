/**
 * Deterministic validation result model shared by every check in
 * src/kernel/validation/. Two severities only, per AGENTS.md's boundary
 * between mechanical checks and AI/Owner judgment:
 *
 * - `error`   — mechanically invalid state / broken reference / a required
 *               structural prerequisite is absent.
 * - `warning` — mechanically suspicious but potentially legitimate state
 *               that should be reviewed by AI/Owner, not prohibited.
 */
export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  readonly code: string;
  readonly severity: ValidationSeverity;
  readonly message: string;
  /** Relative path or identifier of the artifact the issue concerns. */
  readonly artifact?: string;
  /** Field path within the artifact, where applicable. */
  readonly path?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly errors: readonly ValidationIssue[];
  readonly warnings: readonly ValidationIssue[];
}

export function issue(
  code: string,
  severity: ValidationSeverity,
  message: string,
  options: { artifact?: string; path?: string } = {},
): ValidationIssue {
  return { code, severity, message, ...options };
}

export function buildResult(issues: readonly ValidationIssue[]): ValidationResult {
  const errors = issues.filter((entry) => entry.severity === 'error');
  const warnings = issues.filter((entry) => entry.severity === 'warning');
  return { valid: errors.length === 0, issues, errors, warnings };
}
