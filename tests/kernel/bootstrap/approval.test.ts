import { describe, expect, it } from 'vitest';
import { buildApprovalRequest } from '../../../src/kernel/bootstrap/approval.js';

describe('buildApprovalRequest', () => {
  it('always produces status "pending" — Bootstrap never fabricates approval', () => {
    const approval = buildApprovalRequest({
      id: 'submit-job-applications',
      targetContext: 'job-application-agent work item',
      requestedDecision: 'Authorize submitting applications to matched job postings.',
      scope: 'One-time authorization to submit applications for the current matched batch only.',
      ownerIdentity: 'Alex',
      mode: 'one-time',
    });
    expect(approval.status).toBe('pending');
  });

  it('a caller cannot force status to approved — the schema-validated shape hard-codes pending', () => {
    const approval = buildApprovalRequest({
      id: 'attempted-forced-approval',
      targetContext: 'x',
      requestedDecision: 'x',
      scope: 'x',
      ownerIdentity: 'x',
      mode: 'one-time',
      // no `status` field exists on ApprovalNeedDecision at all — nothing to force
    });
    expect(approval.status).toBe('pending');
    expect(approval.decision_at).toBeUndefined();
  });

  it('defaults provenance to ai-inferred when the decision does not specify it, never owner-confirmed', () => {
    const approval = buildApprovalRequest({
      id: 'default-provenance',
      targetContext: 'x',
      requestedDecision: 'x',
      scope: 'x',
      ownerIdentity: 'x',
      mode: 'one-time',
    });
    expect(approval.provenance).toBe('ai-inferred');
  });
});
