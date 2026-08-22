import { z } from 'zod';
import { workItemStageSchema } from '../../kernel/schemas/work-item.js';
import { RUNTIME_REQUIREMENT_IDS } from '../../kernel/runtime/requirements.js';

/**
 * Runtime-validatable mirror of src/kernel/transition/types.ts's
 * ProposedTransition. Kept in the invocation boundary, not the kernel —
 * see decisions.ts's doc comment for why.
 */
export const proposedTransitionSchema = z.object({
  workItemId: z.string().min(1),
  fromStage: workItemStageSchema,
  toStage: workItemStageSchema,
  action: z.string().min(1).optional(),
  capabilityId: z.string().min(1).optional(),
  approvalId: z.string().min(1).optional(),
});

export type ProposedTransitionInput = z.infer<typeof proposedTransitionSchema>;

/**
 * Runtime requirement identifiers, derived directly from
 * src/kernel/runtime/requirements.ts's own RUNTIME_REQUIREMENT_IDS —
 * not a separately maintained list, so this cannot silently drift from
 * the kernel's vocabulary.
 */
export const runtimeRequirementIdSchema = z.enum(RUNTIME_REQUIREMENT_IDS);
