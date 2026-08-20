import type { RuntimeRequirementId } from './requirements.js';

/**
 * Three-state availability, deliberately distinct from a boolean: `unknown`
 * ("this was not, or could not be, mechanically determined") must never be
 * conflated with `unavailable` ("this was checked and is not present") — see
 * Initiative 7 brief Section 6.
 */
export type RuntimeAvailability = 'available' | 'unavailable' | 'unknown';

/**
 * The smallest structured, evidence-backed result of probing one Runtime
 * Requirement. Ephemeral by design (Section 6): this is a plain,
 * programmatic value produced per evaluation, like
 * transition/types.ts's ProposedTransition — not a durable project-state
 * artifact, and never written into `.aiom/` state by anything in this
 * repository. ADR-011's four durable artifact shapes are not expanded by
 * this type; see the Initiative 7 completion report's evidence-durability
 * decision for why.
 */
export interface RuntimeEvidence {
  readonly requirementId: RuntimeRequirementId;
  readonly availability: RuntimeAvailability;
  /**
   * How this evidence was produced (e.g. "fs.mkdtemp + fs.rm round-trip in
   * the OS temp directory", "simulated fixture adapter"). Provenance for a
   * mechanical finding, per safeguards.md's evidence/provenance
   * preservation principle — not a provider identity Core logic branches
   * on.
   */
  readonly mechanism: string;
  /** When this specific probe ran. Evidence is not assumed valid beyond the evaluation that produced it — see Section 11. */
  readonly checkedAt: string;
  /** Required context when availability is "unavailable" or "unknown"; optional detail when "available". */
  readonly reason?: string;
}

export function runtimeEvidence(
  requirementId: RuntimeRequirementId,
  availability: RuntimeAvailability,
  mechanism: string,
  now: Date,
  reason?: string,
): RuntimeEvidence {
  return {
    requirementId,
    availability,
    mechanism,
    checkedAt: now.toISOString(),
    ...(reason !== undefined ? { reason } : {}),
  };
}

/** requirementId -> RuntimeEvidence, the shape evaluateTransition and the Orchestrator consume. Ephemeral, caller-assembled — never loaded from or written to project state. */
export type RuntimeEvidenceMap = ReadonlyMap<RuntimeRequirementId, RuntimeEvidence>;
