import { z } from 'zod';
import {
  confirmationValueSchema,
  provenanceSchema,
  signalValueSchema,
} from '../../kernel/schemas/common.js';
import { workItemStageSchema, authorityRequirementSchema, responsibilitySchema } from '../../kernel/schemas/work-item.js';
import { capabilityActivationStatusSchema } from '../../kernel/schemas/capability-activation.js';
import { approvalModeSchema } from '../../kernel/schemas/approval.js';

/**
 * Runtime-validatable mirror of src/kernel/bootstrap/types.ts's
 * BootstrapReasoningDecisions and its nested shapes. This module exists
 * only because a real process/transport boundary (Initiative 10) cannot
 * rely on TypeScript's compile-time typing the way an in-process caller
 * (e.g. the kernel's own test suite) can — it does not redesign the
 * semantic contract those types already define, and the kernel's own
 * BootstrapReasoningDecisions interface is unchanged by this module's
 * existence. See tests/invocation/contracts/decisions.test.ts for the
 * drift check keeping this mirror honest against the kernel type.
 */

const profileSignalDecisionsSchema = z.object({
  repository_backed: signalValueSchema,
  software_producing: signalValueSchema,
  ui_bearing: signalValueSchema,
  externally_acting: signalValueSchema,
  persistent_state_dependent: signalValueSchema,
  data_sensitive: signalValueSchema,
  regulated_high_risk_possible: signalValueSchema,
  long_running_continuous: signalValueSchema,
  content_heavy_narrative_heavy: signalValueSchema,
});

const consequenceConfirmationDecisionsSchema = z.object({
  consequential_external_action: confirmationValueSchema,
  sensitive_or_high_consequence_data: confirmationValueSchema,
});

const profileDecisionsSchema = z.object({
  projectName: z.string().min(1),
  projectIntent: z.string().min(1),
  ownerIdentity: z.string().min(1),
  existingStateAssessmentPerformed: z.boolean(),
  lifecyclePosition: z.string().min(1),
  signals: profileSignalDecisionsSchema,
  consequenceConfirmations: consequenceConfirmationDecisionsSchema,
  contextNarrative: z.string().min(1).optional(),
  existingStateNarrative: z.string().min(1).optional(),
  runtimeRequirements: z.array(z.string().min(1)).optional(),
});

const bundleRelevanceDecisionSchema = z.object({
  bundleId: z.string().min(1),
  relevant: z.enum(['true', 'false', 'unknown']),
  rationale: z.string().min(1).optional(),
  evidence: z.string().min(1).optional(),
  provenance: provenanceSchema.optional(),
});

const capabilityActivationDecisionSchema = z.object({
  capabilityId: z.string().min(1),
  status: capabilityActivationStatusSchema,
  provenance: provenanceSchema,
  rationale: z.string().min(1).optional(),
  evidence: z.string().min(1).optional(),
  reconsiderationTrigger: z.string().min(1).optional(),
  runtimeRequirementReference: z.string().min(1).optional(),
  standardsGates: z.array(z.string().min(1)).optional(),
});

const workItemDecisionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  stage: workItemStageSchema,
  activeCapability: z.string().min(1).optional(),
  bundleReferences: z.array(z.string().min(1)).optional(),
  authorityRequirement: authorityRequirementSchema.optional(),
  currentResponsibility: responsibilitySchema,
  objectiveNarrative: z.string().min(1).optional(),
  contextNarrative: z.string().min(1).optional(),
});

const approvalNeedDecisionSchema = z.object({
  id: z.string().min(1),
  relatedWorkItemId: z.string().min(1).optional(),
  targetContext: z.string().min(1),
  requestedDecision: z.string().min(1),
  scope: z.string().min(1),
  ownerIdentity: z.string().min(1),
  mode: approvalModeSchema,
  provenance: provenanceSchema.optional(),
});

const bootstrapReadyQualitativeAssessmentSchema = z.object({
  sufficientIntentForNextAction: z.boolean(),
  existingStateAssessmentAdequate: z.boolean(),
  consequenceQuestionsResolvedWhereNecessary: z.boolean(),
  capabilityConfigurationSufficient: z.boolean(),
  unresolvedUncertaintyRepresented: z.boolean(),
  ownerDecisionsObtainedWhereRequired: z.boolean(),
  rationale: z.string().min(1).optional(),
});

export const bootstrapReasoningDecisionsSchema = z.object({
  durableStateJustified: z.boolean(),
  durableStateRationale: z.string().min(1).optional(),
  profile: profileDecisionsSchema,
  bundles: z.array(bundleRelevanceDecisionSchema),
  capabilities: z.array(capabilityActivationDecisionSchema),
  bootstrapReadyAssessment: bootstrapReadyQualitativeAssessmentSchema,
  bootstrapReady: z.boolean(),
  nextGovernedAction: z.string().min(1),
  unresolvedItems: z.array(z.string().min(1)).optional(),
  workItem: workItemDecisionSchema.optional(),
  approvalNeed: approvalNeedDecisionSchema.optional(),
});

export type BootstrapReasoningDecisionsInput = z.infer<typeof bootstrapReasoningDecisionsSchema>;
