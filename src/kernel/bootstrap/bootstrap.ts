import { orchestrate } from '../orchestration/orchestrate.js';
import type { OrchestrationResult } from '../orchestration/types.js';
import type { RuntimeAdapter } from '../runtime/adapter.js';
import { probeRuntime } from '../runtime/probe.js';
import type { RuntimeEvidenceMap } from '../runtime/evidence.js';
import type { RuntimeRequirementId } from '../runtime/requirements.js';
import type { ProposedTransition } from '../transition/types.js';
import { loadCapabilityIndex, type CapabilityIndex } from '../validation/capability-index.js';
import { validateProjectState } from '../validation/validate-project.js';
import type { ValidationResult } from '../validation/result.js';
import type { ProjectProfile } from '../schemas/project-profile.js';
import { buildApprovalRequest } from './approval.js';
import { buildCandidateState, validateCandidateState } from './candidate-state.js';
import { buildCapabilityActivationRecord } from './capability-record.js';
import { inspectRepository } from './inspect.js';
import { materializeProjectState } from './materialize.js';
import { buildCandidateProfile } from './profile.js';
import type {
  BootstrapInput,
  BootstrapMode,
  BootstrapReasoningDecisions,
  BootstrapResult,
} from './types.js';
import { buildFirstWorkItem } from './work-item.js';

export interface RunBootstrapOptions {
  readonly index?: CapabilityIndex;
  readonly now?: Date;
  /**
   * A controlled synthetic test destination (fixture / scratch / temp
   * directory) to materialize `.aiom`-shaped state into (Section 16). Only
   * consulted when `decisions.durableStateJustified` is true — supplying
   * this alone never causes materialization to happen, and omitting it in
   * `aiom-managed` mode leaves the result entirely in-memory
   * (`materialized` is `undefined`, and readiness is evaluated against the
   * in-memory candidate state instead — see candidate-state.ts).
   */
  readonly materializeTo?: string;
  readonly runtimeAdapter?: RuntimeAdapter;
  readonly runtimeRequirementIds?: readonly RuntimeRequirementId[];
  /** An optional next transition to evaluate through the Orchestrator once state is materialized (Section 15's "Orchestrator disposition where relevant"). */
  readonly proposedTransition?: ProposedTransition;
}

function collectUnresolvedQuestions(profile: ProjectProfile): readonly string[] {
  return profile.frontmatter.bootstrap.unresolved_items ?? [];
}

function collectRequiredOwnerConfirmations(
  profile: ProjectProfile,
  approvalId: string | undefined,
): readonly string[] {
  const items: string[] = [];
  const confirmations = profile.frontmatter.consequence_confirmations;
  if (confirmations.consequential_external_action.value === 'unresolved') {
    items.push('consequential_external_action');
  }
  if (confirmations.sensitive_or_high_consequence_data.value === 'unresolved') {
    items.push('sensitive_or_high_consequence_data');
  }
  if (approvalId) {
    items.push(`owner-approval:${approvalId}`);
  }
  return items;
}

/**
 * Executable Project Bootstrap v0.1 (Initiative 8): deterministic Bootstrap
 * mechanics only. `decisions` is the already-completed output of the
 * reasoning contract (src/kernel/bootstrap/types.ts —
 * BootstrapReasoningDecisions); this function performs no bundle-relevance,
 * capability-activation, or Bootstrap-Ready *reasoning* of its own (Section
 * 29) — it validates, assembles, optionally materializes, and composes
 * those decisions with the existing deterministic kernel (Kernel
 * Validation, the Transition Gate, the Runtime Probe, the Orchestrator),
 * exactly as those modules already compose with each other.
 *
 * `input.projectPath`, when given, is mechanically inspected (inspect.ts)
 * before this function is even called by a reasoning runtime that wants to
 * "inspect before ask" — `input` and `inspection` are both echoed back on
 * the result so a caller can confirm what was actually seen.
 */
export function runBootstrap(
  input: BootstrapInput,
  decisions: BootstrapReasoningDecisions,
  options: RunBootstrapOptions = {},
): BootstrapResult {
  const now = options.now ?? new Date();
  const index = options.index ?? loadCapabilityIndex();
  const inspection = inspectRepository(input.projectPath);

  const profile = buildCandidateProfile(decisions, now);
  const capabilityActivation = buildCapabilityActivationRecord(decisions.bundles, decisions.capabilities);
  const mode: BootstrapMode = decisions.durableStateJustified ? 'aiom-managed' : 'ephemeral';

  const workItem =
    mode === 'aiom-managed' && decisions.workItem ? buildFirstWorkItem(decisions.workItem, now) : undefined;
  const approval = decisions.approvalNeed ? buildApprovalRequest(decisions.approvalNeed) : undefined;

  const workItems = workItem ? [workItem] : [];
  const approvals = approval ? [approval] : [];

  let validation: ValidationResult;
  let materialized: BootstrapResult['materialized'];

  if (mode === 'aiom-managed' && options.materializeTo) {
    materialized = materializeProjectState(options.materializeTo, {
      profile,
      capabilityActivation,
      workItems,
      approvals,
    });
    validation = validateProjectState(materialized.stateDir, index);
  } else {
    const candidateState = buildCandidateState({ profile, capabilityActivation, workItems, approvals });
    validation = validateCandidateState(candidateState, index);
  }

  let runtimeEvidence: RuntimeEvidenceMap | undefined;
  if (options.runtimeAdapter && options.runtimeRequirementIds && options.runtimeRequirementIds.length > 0) {
    runtimeEvidence = probeRuntime(options.runtimeAdapter, options.runtimeRequirementIds, now);
  }

  let orchestration: OrchestrationResult | undefined;
  if (materialized && options.proposedTransition) {
    orchestration = orchestrate(materialized.stateDir, options.proposedTransition, {
      index,
      now,
      runtimeEvidence,
    });
  }

  return {
    mode,
    inspection,
    profile,
    bundleRelevance: capabilityActivation.bundles,
    capabilityActivation: capabilityActivation.capabilities,
    unresolvedQuestions: collectUnresolvedQuestions(profile),
    requiredOwnerConfirmations: collectRequiredOwnerConfirmations(profile, approval?.id),
    bootstrapReadyAssessment: decisions.bootstrapReadyAssessment,
    nextGovernedAction: decisions.nextGovernedAction,
    workItem,
    approval,
    validation,
    materialized,
    runtimeEvidence,
    orchestration,
  };
}
