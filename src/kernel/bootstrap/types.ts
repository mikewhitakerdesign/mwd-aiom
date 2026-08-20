import type { ConfirmationStatus, Provenance, SignalStatus } from '../schemas/common.js';
import type { CapabilityActivationStatus } from '../schemas/capability-activation.js';
import type {
  AuthorityRequirement,
  Responsibility,
  WorkItemStage,
} from '../schemas/work-item.js';
import type { ApprovalMode } from '../schemas/approval.js';
import type { ValidationResult } from '../validation/result.js';
import type { RuntimeEvidenceMap } from '../runtime/index.js';
import type { OrchestrationResult } from '../orchestration/types.js';
import type { ProjectProfile } from '../schemas/project-profile.js';
import type {
  BundleRelevanceEntry,
  CapabilityActivationEntry,
} from '../schemas/capability-activation.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import type { OwnerApprovalArtifact } from '../schemas/approval.js';

/**
 * The Seed version Bootstrap-produced artifacts target. See
 * seed/templates/README.md — not a manually maintained per-artifact
 * revision.
 */
export const SEED_VERSION = '0.1';

/**
 * Bootstrap's input model (Section 4): the smallest set of things Bootstrap
 * can operate on. Only `ownerContext` is required — deliberately no
 * project-type enum, no required repository path, no fixed question set.
 * Sparse prose ("I want to build a small website for a local running
 * club.") must be a valid, complete BootstrapInput.
 */
export interface BootstrapInput {
  /** Free prose describing what the Owner wants, in whatever form they gave it. */
  readonly ownerContext: string;
  /** Optional path to an existing project/repository Bootstrap should inspect before asking anything. */
  readonly projectPath?: string;
  /** Optional prose the Owner has already given about current lifecycle/problem framing. */
  readonly lifecycleStatement?: string;
  /** Optional constraints the Owner has already stated, verbatim. */
  readonly knownConstraints?: readonly string[];
  /** Optional existing documentation/context the Owner has already supplied, verbatim (Scenario E). */
  readonly existingContext?: readonly string[];
}

/**
 * Bounded, mechanical inspection evidence (Section 5): file/directory
 * presence and Git state only — never a generalized repository-analysis
 * engine, and never promoted to Owner-confirmed authority by anything that
 * consumes it. Every field here is `directly-inspected` provenance by
 * construction.
 */
export interface RepositoryInspection {
  readonly inspected: boolean;
  readonly path: string | undefined;
  readonly exists: boolean;
  readonly isGitRepository: boolean;
  readonly topLevelEntries: readonly string[];
  readonly hasPackageManifest: boolean;
  readonly manifestFiles: readonly string[];
  readonly hasReadme: boolean;
  readonly hasExistingAiomState: boolean;
  readonly hasRepositoryInstructions: boolean;
  readonly instructionFiles: readonly string[];
  readonly hasDocsDirectory: boolean;
  readonly hasSourceDirectory: boolean;
}

/** A composable Project Profile signal, as a reasoning runtime's decision — not yet schema-validated. */
export interface SignalDecision {
  readonly value: SignalStatus;
  readonly provenance: Provenance;
  readonly rationale?: string;
}

/** One of the two fixed consequence confirmations, as a reasoning runtime's decision. */
export interface ConfirmationDecision {
  readonly value: ConfirmationStatus;
  readonly provenance: Provenance;
  readonly rationale?: string;
}

export interface ProfileSignalDecisions {
  readonly repository_backed: SignalDecision;
  readonly software_producing: SignalDecision;
  readonly ui_bearing: SignalDecision;
  readonly externally_acting: SignalDecision;
  readonly persistent_state_dependent: SignalDecision;
  readonly data_sensitive: SignalDecision;
  readonly regulated_high_risk_possible: SignalDecision;
  readonly long_running_continuous: SignalDecision;
  readonly content_heavy_narrative_heavy: SignalDecision;
}

export interface ConsequenceConfirmationDecisions {
  readonly consequential_external_action: ConfirmationDecision;
  readonly sensitive_or_high_consequence_data: ConfirmationDecision;
}

/**
 * The Project Profile portion of the reasoning contract (Section 8): what a
 * reasoning runtime (Claude Code following seed/bootstrap.md, another AI
 * runtime, or a human) is expected to supply. Deterministic Bootstrap code
 * validates and assembles this into a schema-conformant ProjectProfile — it
 * never derives these values itself.
 */
export interface ProfileDecisions {
  readonly projectName: string;
  readonly projectIntent: string;
  readonly ownerIdentity: string;
  readonly existingStateAssessmentPerformed: boolean;
  readonly lifecyclePosition: string;
  readonly signals: ProfileSignalDecisions;
  readonly consequenceConfirmations: ConsequenceConfirmationDecisions;
  readonly contextNarrative?: string;
  readonly existingStateNarrative?: string;
  readonly runtimeRequirements?: readonly string[];
}

/** Section 9 — bundle relevance is a reasoned outcome, never deterministic schema validation. */
export interface BundleRelevanceDecision {
  readonly bundleId: string;
  readonly relevant: 'true' | 'false' | 'unknown';
  readonly rationale?: string;
  readonly evidence?: string;
  readonly provenance?: Provenance;
}

/** Section 10 — activation status, never authorization. */
export interface CapabilityActivationDecision {
  readonly capabilityId: string;
  readonly status: CapabilityActivationStatus;
  readonly provenance: Provenance;
  readonly rationale?: string;
  readonly evidence?: string;
  readonly reconsiderationTrigger?: string;
  readonly runtimeRequirementReference?: string;
  readonly standardsGates?: readonly string[];
}

/** Section 13 — the first Governed Work Item, only ever supplied (never invented by deterministic code) when durable state is justified and a next action actually warrants one. */
export interface WorkItemDecision {
  readonly id: string;
  readonly title: string;
  readonly objective: string;
  readonly stage: WorkItemStage;
  readonly activeCapability?: string;
  readonly bundleReferences?: readonly string[];
  readonly authorityRequirement?: AuthorityRequirement;
  readonly currentResponsibility: Responsibility;
  readonly objectiveNarrative?: string;
  readonly contextNarrative?: string;
}

/**
 * Section 14 — an Owner-authority boundary Bootstrap itself reached. This
 * only ever produces a `pending` Owner Approval Artifact (see
 * approval.ts) — Bootstrap never fabricates an `approved` decision on the
 * Owner's behalf.
 */
export interface ApprovalNeedDecision {
  readonly id: string;
  readonly relatedWorkItemId?: string;
  readonly targetContext: string;
  readonly requestedDecision: string;
  readonly scope: string;
  readonly ownerIdentity: string;
  readonly mode: ApprovalMode;
  readonly provenance?: Provenance;
}

/**
 * Section 12 — the qualitative Bootstrap Ready assessment only AI/Owner
 * judgment can make. Kept structurally distinct from, and never collapsed
 * into, the deterministic `ValidationResult` Bootstrap also produces.
 */
export interface BootstrapReadyQualitativeAssessment {
  readonly sufficientIntentForNextAction: boolean;
  readonly existingStateAssessmentAdequate: boolean;
  readonly consequenceQuestionsResolvedWhereNecessary: boolean;
  readonly capabilityConfigurationSufficient: boolean;
  readonly unresolvedUncertaintyRepresented: boolean;
  readonly ownerDecisionsObtainedWhereRequired: boolean;
  readonly rationale?: string;
}

/**
 * The complete reasoning contract (Section 29): everything a reasoning
 * runtime must supply for deterministic Bootstrap code to validate,
 * assemble, and (optionally) materialize. Nothing in src/kernel/bootstrap/
 * calls an LLM provider — this interface is how that reasoning role plugs
 * in, whether the caller is Claude Code, another AI runtime, or a human
 * filling this out by hand.
 */
export interface BootstrapReasoningDecisions {
  /** Section 11 — whether reliable continuation, authority, or durable knowledge justifies durable `.aiom/`-shaped state for this project. */
  readonly durableStateJustified: boolean;
  readonly durableStateRationale?: string;
  readonly profile: ProfileDecisions;
  readonly bundles: readonly BundleRelevanceDecision[];
  readonly capabilities: readonly CapabilityActivationDecision[];
  readonly bootstrapReadyAssessment: BootstrapReadyQualitativeAssessment;
  /** The reasoning runtime's own conclusion — recorded structurally on the Profile, then independently checked by the deterministic validator (Section 12). */
  readonly bootstrapReady: boolean;
  readonly nextGovernedAction: string;
  readonly unresolvedItems?: readonly string[];
  readonly workItem?: WorkItemDecision;
  readonly approvalNeed?: ApprovalNeedDecision;
}

export type BootstrapMode = 'ephemeral' | 'aiom-managed';

export interface MaterializationResult {
  readonly projectDir: string;
  readonly stateDir: string;
  readonly profilePath: string;
  readonly capabilitiesPath: string;
  readonly workItemPath: string | undefined;
  readonly approvalPath: string | undefined;
  readonly seedAssetPaths: readonly string[];
  readonly projectInstructionPaths: readonly string[];
}

/**
 * Bootstrap's output model (Section 15): the smallest useful programmatic
 * result. `validation` and `bootstrapReadyAssessment` are kept as separate
 * fields deliberately — see the doc comment on
 * BootstrapReadyQualitativeAssessment.
 */
export interface BootstrapResult {
  readonly mode: BootstrapMode;
  readonly inspection: RepositoryInspection;
  readonly profile: ProjectProfile;
  readonly bundleRelevance: readonly BundleRelevanceEntry[];
  readonly capabilityActivation: readonly CapabilityActivationEntry[];
  readonly unresolvedQuestions: readonly string[];
  readonly requiredOwnerConfirmations: readonly string[];
  readonly bootstrapReadyAssessment: BootstrapReadyQualitativeAssessment;
  readonly nextGovernedAction: string;
  readonly workItem: GovernedWorkItem | undefined;
  readonly approval: OwnerApprovalArtifact | undefined;
  readonly validation: ValidationResult;
  readonly materialized: MaterializationResult | undefined;
  readonly runtimeEvidence: RuntimeEvidenceMap | undefined;
  readonly orchestration: OrchestrationResult | undefined;
}
