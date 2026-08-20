import type { RuntimeAdapter } from '../../../src/kernel/runtime/adapter.js';
import { runtimeEvidence, type RuntimeAvailability } from '../../../src/kernel/runtime/evidence.js';
import type { RuntimeRequirementId } from '../../../src/kernel/runtime/requirements.js';

/**
 * Deterministic, simulated RuntimeAdapters for tests (Initiative 7 brief
 * Section 19): tests must not depend on the developer machine actually
 * having a particular runtime capability. Each adapter here is a plain
 * lookup table, not a real inspection mechanism.
 */
export function createSimulatedAdapter(
  name: string,
  table: Partial<Record<RuntimeRequirementId, RuntimeAvailability>>,
): RuntimeAdapter {
  return {
    name,
    probe(requirementId, now = new Date()) {
      const availability = table[requirementId] ?? 'unknown';
      return runtimeEvidence(
        requirementId,
        availability,
        `simulated fixture adapter "${name}"`,
        now,
        availability === 'available' ? undefined : `simulated as ${availability} for this test`,
      );
    },
  };
}
