import { governedWorkItemSchema } from '../schemas/work-item.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import { SEED_VERSION, type WorkItemDecision } from './types.js';

/**
 * Builds the first Governed Work Item (Section 13). Only ever called when
 * a reasoning runtime has supplied a WorkItemDecision — this function does
 * not choose a stage, objective, or existence on its own, and in
 * particular never defaults `stage` to `implementation` (Falsification
 * Gate D question 5).
 */
export function buildFirstWorkItem(decision: WorkItemDecision, now: Date = new Date()): GovernedWorkItem {
  const body = [
    '## Objective',
    '',
    (decision.objectiveNarrative ?? '').trim(),
    '',
    '## Context',
    '',
    (decision.contextNarrative ?? '').trim(),
    '',
    '## Notes',
    '',
    '',
  ].join('\n').trim();

  return governedWorkItemSchema.parse({
    frontmatter: {
      seed_version: SEED_VERSION,
      id: decision.id,
      title: decision.title,
      objective: decision.objective,
      status: 'active',
      stage: decision.stage,
      ...(decision.activeCapability ? { active_capability: decision.activeCapability } : {}),
      ...(decision.bundleReferences ? { bundle_references: decision.bundleReferences } : {}),
      authority_requirement: decision.authorityRequirement ?? 'none',
      validation_state: 'not-started',
      blocker_state: 'none',
      current_responsibility: decision.currentResponsibility,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    body,
  });
}
