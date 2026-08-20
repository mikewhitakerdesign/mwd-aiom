import type { RuntimeAdapter } from './adapter.js';
import type { RuntimeEvidence, RuntimeEvidenceMap } from './evidence.js';
import type { RuntimeRequirementId } from './requirements.js';

/**
 * The Runtime Probe API (Initiative 7 brief Section 9): the smallest
 * programmatic surface to (1) inspect the runtime for one or more
 * requirements and (2) compare the resulting evidence against a set of
 * requirements a Work Item, capability, or transition names. No CLI, no
 * daemon — see Sections 7 and 9.
 */

/** Probes one Runtime Requirement via the given adapter. */
export function probeRequirement(
  adapter: RuntimeAdapter,
  requirementId: RuntimeRequirementId,
  now: Date = new Date(),
): RuntimeEvidence {
  return adapter.probe(requirementId, now);
}

/** Probes each of the given Runtime Requirements via the given adapter and returns the ephemeral evidence map evaluateTransition/orchestrate consume. */
export function probeRuntime(
  adapter: RuntimeAdapter,
  requirementIds: readonly RuntimeRequirementId[],
  now: Date = new Date(),
): RuntimeEvidenceMap {
  return new Map(requirementIds.map((id) => [id, adapter.probe(id, now)]));
}

export interface RuntimeRequirementEvaluation {
  readonly satisfied: readonly RuntimeRequirementId[];
  readonly unavailable: readonly RuntimeRequirementId[];
  readonly unknown: readonly RuntimeRequirementId[];
}

/**
 * Compares already-produced evidence against a set of required Runtime
 * Requirement IDs. A requirement with no entry in `evidence` is treated the
 * same as `unknown` evidence — absence of a probe result is not assumed to
 * mean unavailable (Section 6).
 */
export function evaluateRuntimeRequirements(
  evidence: RuntimeEvidenceMap,
  requirementIds: readonly RuntimeRequirementId[],
): RuntimeRequirementEvaluation {
  const satisfied: RuntimeRequirementId[] = [];
  const unavailable: RuntimeRequirementId[] = [];
  const unknown: RuntimeRequirementId[] = [];

  for (const requirementId of requirementIds) {
    const result = evidence.get(requirementId);
    if (result?.availability === 'available') {
      satisfied.push(requirementId);
    } else if (result?.availability === 'unavailable') {
      unavailable.push(requirementId);
    } else {
      unknown.push(requirementId);
    }
  }

  return { satisfied, unavailable, unknown };
}
