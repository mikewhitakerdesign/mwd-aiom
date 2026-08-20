import type { WorkItemStage } from './types.js';

/**
 * The smallest bounded, proving-only transition-rule set needed to exercise
 * source-state relevance, target-state relevance, deterministic
 * prerequisites, and the authorization boundary (see Initiative 6 brief
 * Sections 5–6). This is explicitly not a general workflow engine: an
 * unlisted `from`/`to` pair is mechanically not permitted, full stop — there
 * is no fallback inference of "close enough" transitions.
 *
 * A legitimate project could reasonably sequence its own work differently;
 * this table proves transition mechanics over Initiative 4's stage
 * vocabulary, it does not claim to be universal AIOM lifecycle sequencing.
 */
export interface TransitionRule {
  readonly id: string;
  readonly from: WorkItemStage;
  readonly to: WorkItemStage;
  /** Mechanically requires the Work Item's validation_state to be "passed". */
  readonly requiresValidationPassed: boolean;
  /** Mechanically requires the Work Item's blocker_state to be "none". */
  readonly requiresBlockerClear: boolean;
  /**
   * Whether this transition crosses the point at which Owner authorization
   * must be checked against the Work Item's authority_requirement and any
   * covering Owner Approval Artifact. Ordinary internal progression does
   * not cross this boundary even if the Work Item's overall
   * authority_requirement is non-"none" for unrelated, later reasons.
   */
  readonly authorityBoundary: boolean;
}

export const TRANSITION_RULES: readonly TransitionRule[] = [
  {
    id: 'research-to-implementation',
    from: 'research',
    to: 'implementation',
    requiresValidationPassed: false,
    requiresBlockerClear: false,
    authorityBoundary: false,
  },
  {
    id: 'implementation-to-validation',
    from: 'implementation',
    to: 'validation',
    requiresValidationPassed: false,
    requiresBlockerClear: false,
    authorityBoundary: false,
  },
  {
    id: 'validation-to-approval',
    from: 'validation',
    to: 'approval',
    requiresValidationPassed: true,
    requiresBlockerClear: false,
    authorityBoundary: false,
  },
  {
    id: 'approval-to-delivery',
    from: 'approval',
    to: 'delivery',
    requiresValidationPassed: false,
    requiresBlockerClear: false,
    authorityBoundary: true,
  },
  {
    id: 'delivery-to-handoff',
    from: 'delivery',
    to: 'handoff',
    requiresValidationPassed: true,
    requiresBlockerClear: true,
    authorityBoundary: false,
  },
];

export function findTransitionRule(
  from: WorkItemStage,
  to: WorkItemStage,
): TransitionRule | undefined {
  return TRANSITION_RULES.find((rule) => rule.from === from && rule.to === to);
}
