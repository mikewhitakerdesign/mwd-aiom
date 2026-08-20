import type {
  BootstrapReadyQualitativeAssessment,
  ConfirmationDecision,
  ProfileSignalDecisions,
  SignalDecision,
} from '../../../src/kernel/bootstrap/index.js';
import type { Provenance } from '../../../src/kernel/schemas/index.js';

/**
 * Shared builders for Bootstrap's reasoning-contract fixtures (Section 28:
 * "fixture-supplied reasoning decisions" standing in for an actual
 * reasoning runtime in deterministic tests).
 */

export function signal(
  value: SignalDecision['value'],
  provenance: Provenance = 'unknown',
  rationale?: string,
): SignalDecision {
  return { value, provenance, ...(rationale ? { rationale } : {}) };
}

export function confirmation(
  value: ConfirmationDecision['value'],
  provenance: Provenance = 'unknown',
  rationale?: string,
): ConfirmationDecision {
  return { value, provenance, ...(rationale ? { rationale } : {}) };
}

export function allUnknownSignals(): ProfileSignalDecisions {
  return {
    repository_backed: signal('unknown'),
    software_producing: signal('unknown'),
    ui_bearing: signal('unknown'),
    externally_acting: signal('unknown'),
    persistent_state_dependent: signal('unknown'),
    data_sensitive: signal('unknown'),
    regulated_high_risk_possible: signal('unknown'),
    long_running_continuous: signal('unknown'),
    content_heavy_narrative_heavy: signal('unknown'),
  };
}

export function readyAssessment(
  overrides: Partial<BootstrapReadyQualitativeAssessment> = {},
): BootstrapReadyQualitativeAssessment {
  return {
    sufficientIntentForNextAction: true,
    existingStateAssessmentAdequate: true,
    consequenceQuestionsResolvedWhereNecessary: true,
    capabilityConfigurationSufficient: true,
    unresolvedUncertaintyRepresented: true,
    ownerDecisionsObtainedWhereRequired: true,
    ...overrides,
  };
}
