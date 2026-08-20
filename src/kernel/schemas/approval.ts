import { z } from 'zod';
import { provenanceSchema, seedVersionSchema, stableIdSchema } from './common.js';

export const approvalModeSchema = z.enum([
  'one-time',
  'durable-policy',
  'recurring-case-by-case',
]);
export type ApprovalMode = z.infer<typeof approvalModeSchema>;

export const approvalStatusSchema = z.enum([
  'pending',
  'approved',
  'denied',
  'expired',
  'superseded',
]);

export const ownerApprovalArtifactSchema = z
  .object({
    seed_version: seedVersionSchema,
    id: stableIdSchema,
    related_work_item_id: stableIdSchema.optional(),
    target_context: z.string().min(1),
    requested_decision: z.string().min(1),
    authorized_action: z.string().min(1).optional(),
    mode: approvalModeSchema,
    scope: z.string().min(1),
    owner: z.string().min(1),
    status: approvalStatusSchema,
    decision_at: z.iso.datetime().optional(),
    conditions: z.array(z.string().min(1)).optional(),
    expiration: z.iso.datetime().optional(),
    reconsideration: z.string().min(1).optional(),
    provenance: provenanceSchema,
  })
  .superRefine((approval, ctx) => {
    if (
      (approval.status === 'approved' || approval.status === 'denied') &&
      !approval.decision_at
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'decision_at is required once status is "approved" or "denied"',
        path: ['decision_at'],
      });
    }
  });
export type OwnerApprovalArtifact = z.infer<typeof ownerApprovalArtifactSchema>;
