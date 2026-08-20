import { ownerApprovalArtifactSchema } from '../schemas/approval.js';
import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import { SEED_VERSION, type ApprovalNeedDecision } from './types.js';

/**
 * Builds an Owner Approval Artifact surfacing an authority boundary
 * Bootstrap itself reached (Section 14). `status` is hard-coded to
 * `pending` regardless of what a caller supplies — Bootstrap surfaces the
 * need for Owner authorization, it never fabricates the Owner's decision
 * (Falsification Gate D questions 8–9: capability activation and runtime
 * availability must never become authorization; this is the same
 * principle applied to Bootstrap itself).
 */
export function buildApprovalRequest(decision: ApprovalNeedDecision): OwnerApprovalArtifact {
  return ownerApprovalArtifactSchema.parse({
    seed_version: SEED_VERSION,
    id: decision.id,
    ...(decision.relatedWorkItemId ? { related_work_item_id: decision.relatedWorkItemId } : {}),
    target_context: decision.targetContext,
    requested_decision: decision.requestedDecision,
    mode: decision.mode,
    scope: decision.scope,
    owner: decision.ownerIdentity,
    status: 'pending',
    provenance: decision.provenance ?? 'ai-inferred',
  });
}
