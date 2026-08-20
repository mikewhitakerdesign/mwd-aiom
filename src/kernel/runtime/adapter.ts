import type { RuntimeEvidence } from './evidence.js';
import type { RuntimeRequirementId } from './requirements.js';

/**
 * The boundary a provider-specific runtime inspection mechanism must sit
 * behind (Initiative 7 brief Section 8): Core/kernel/orchestration
 * consumers depend only on this interface and on RuntimeEvidence, never on
 * which adapter — Claude Code, a simulated fixture, or a future second
 * runtime — produced it. `name` exists for provenance/debugging only; no
 * Core logic in this repository branches on it.
 */
export interface RuntimeAdapter {
  readonly name: string;
  probe(requirementId: RuntimeRequirementId, now?: Date): RuntimeEvidence;
}
