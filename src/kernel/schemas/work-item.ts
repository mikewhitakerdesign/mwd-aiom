import { z } from 'zod';
import { seedVersionSchema, stableIdSchema } from './common.js';

/**
 * A bounded, proving-only stage vocabulary — not universal AIOM lifecycle
 * architecture (see seed/templates/README.md). Expected to be revisited
 * once Initiative 5+ exercises real transitions.
 */
export const workItemStageSchema = z.enum([
  'research',
  'implementation',
  'validation',
  'approval',
  'delivery',
  'handoff',
]);
export type WorkItemStage = z.infer<typeof workItemStageSchema>;

export const workItemStatusSchema = z.enum([
  'active',
  'blocked',
  'pending-approval',
  'resumable',
  'complete',
  'abandoned',
]);

/**
 * Reuses AIOM Core's own responsibility boundaries (see
 * seed/core.md#responsibility-boundaries) rather than inventing a parallel
 * assignee vocabulary.
 */
export const responsibilitySchema = z.enum([
  'owner',
  'orchestrator',
  'specialist-capability',
]);
export type Responsibility = z.infer<typeof responsibilitySchema>;

export const authorityRequirementSchema = z.enum([
  'none',
  'owner-authorization-required',
  'owner-authorization-satisfied',
]);
export type AuthorityRequirement = z.infer<typeof authorityRequirementSchema>;

export const validationStateSchema = z.enum([
  'not-started',
  'in-progress',
  'passed',
  'failed',
]);

export const governedWorkItemFrontmatterSchema = z
  .object({
    seed_version: seedVersionSchema,
    id: stableIdSchema,
    title: z.string().min(1),
    objective: z.string().min(1),
    status: workItemStatusSchema,
    stage: workItemStageSchema,
    completed_stages: z.array(workItemStageSchema).optional(),
    active_capability: stableIdSchema.optional(),
    bundle_references: z.array(stableIdSchema).optional(),
    authority_requirement: authorityRequirementSchema,
    validation_state: validationStateSchema,
    blocker_state: z.enum(['none', 'blocked']),
    blocker_reason: z.string().min(1).optional(),
    pending_approval_reference: z.string().min(1).optional(),
    /**
     * A stable, abstract runtime requirement (e.g. "repository-write") —
     * never a stale probe result. See seed/templates/README.md.
     */
    runtime_requirement: z.string().min(1).optional(),
    next_permitted_transition: z.string().min(1).optional(),
    current_responsibility: responsibilitySchema,
    created_at: z.iso.datetime().optional(),
    updated_at: z.iso.datetime().optional(),
    completion_handoff_criteria: z.array(z.string().min(1)).optional(),
  })
  .superRefine((item, ctx) => {
    if (item.blocker_state === 'blocked' && !item.blocker_reason) {
      ctx.addIssue({
        code: 'custom',
        message: 'blocker_reason is required when blocker_state is "blocked"',
        path: ['blocker_reason'],
      });
    }
  });
export type GovernedWorkItemFrontmatter = z.infer<
  typeof governedWorkItemFrontmatterSchema
>;

export const governedWorkItemSchema = z.object({
  frontmatter: governedWorkItemFrontmatterSchema,
  body: z.string(),
});
export type GovernedWorkItem = z.infer<typeof governedWorkItemSchema>;
