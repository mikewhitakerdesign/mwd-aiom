import { createNodeRuntimeAdapter } from '../kernel/runtime/adapters/node.js';
import { probeRuntime } from '../kernel/runtime/probe.js';
import type { RuntimeEvidenceMap } from '../kernel/runtime/evidence.js';
import type { RuntimeRequirementId } from '../kernel/runtime/requirements.js';

/**
 * Composes a RuntimeEvidenceMap for evaluateTransition()/orchestrate(),
 * which both accept an already-produced evidence map rather than an
 * adapter. Bootstrap does not need this: runBootstrap() already performs
 * its own internal adapter+ids -> evidence composition (bootstrap.ts) —
 * this module exists only for the two callers that don't.
 *
 * No new probing architecture: this is a direct, unmodified composition
 * of Initiative 7's existing createNodeRuntimeAdapter() and probeRuntime().
 * A RuntimeAdapter is never accepted over the invocation boundary itself
 * (it carries a function, which JSON cannot represent) — only the plain
 * string requirement IDs a caller names are, and this module is what
 * turns those into a real adapter bound to the resolved project root.
 */
export function composeRuntimeEvidence(
  projectRoot: string,
  requirementIds: readonly RuntimeRequirementId[] | undefined,
  now: Date,
): RuntimeEvidenceMap | undefined {
  if (!requirementIds || requirementIds.length === 0) {
    return undefined;
  }
  const adapter = createNodeRuntimeAdapter({ cwd: projectRoot });
  return probeRuntime(adapter, requirementIds, now);
}
