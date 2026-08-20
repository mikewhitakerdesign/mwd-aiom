import { capabilityActivationRecordSchema } from '../schemas/capability-activation.js';
import type { CapabilityActivationRecord } from '../schemas/capability-activation.js';
import {
  SEED_VERSION,
  type BundleRelevanceDecision,
  type CapabilityActivationDecision,
} from './types.js';

/**
 * Assembles a candidate Capability Activation Record from Section 9
 * (bundle relevance) and Section 10 (capability activation) reasoning
 * decisions. Bundle relevance and capability activation status are
 * recorded exactly as decided — this function performs no relevance or
 * activation *reasoning* of its own (that stays outside deterministic
 * Bootstrap code, per Section 29); it only shapes and schema-validates the
 * decisions already made. ID resolution against the canonical Capability
 * Architecture (unknown IDs, duplicate IDs, bundle-membership
 * contradictions) is deliberately left to `validateReferences`
 * (src/kernel/validation/references.ts), reused unchanged rather than
 * re-implemented here.
 */
export function buildCapabilityActivationRecord(
  bundles: readonly BundleRelevanceDecision[],
  capabilities: readonly CapabilityActivationDecision[],
): CapabilityActivationRecord {
  return capabilityActivationRecordSchema.parse({
    seed_version: SEED_VERSION,
    bundles: bundles.map((bundle) => ({
      bundle_id: bundle.bundleId,
      relevant: bundle.relevant,
      ...(bundle.rationale ? { rationale: bundle.rationale } : {}),
      ...(bundle.evidence ? { evidence: bundle.evidence } : {}),
      ...(bundle.provenance ? { provenance: bundle.provenance } : {}),
    })),
    capabilities: capabilities.map((capability) => ({
      capability_id: capability.capabilityId,
      status: capability.status,
      provenance: capability.provenance,
      ...(capability.rationale ? { rationale: capability.rationale } : {}),
      ...(capability.evidence ? { evidence: capability.evidence } : {}),
      ...(capability.reconsiderationTrigger
        ? { reconsideration_trigger: capability.reconsiderationTrigger }
        : {}),
      ...(capability.runtimeRequirementReference
        ? { runtime_requirement_reference: capability.runtimeRequirementReference }
        : {}),
      ...(capability.standardsGates ? { standards_gates: capability.standardsGates } : {}),
    })),
  });
}
