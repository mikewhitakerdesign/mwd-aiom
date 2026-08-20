import { describe, expect, it } from 'vitest';
import type { OwnerApprovalArtifact } from '../../../src/kernel/schemas/approval.js';
import {
  approvalsBoundToWorkItem,
  evaluateApprovalCoverage,
} from '../../../src/kernel/transition/scope.js';
import type { ProposedTransition } from '../../../src/kernel/transition/types.js';

const NOW = new Date('2026-08-20T00:00:00Z');

function baseApproval(overrides: Partial<OwnerApprovalArtifact> = {}): OwnerApprovalArtifact {
  return {
    seed_version: '0.1',
    id: 'appr-test',
    related_work_item_id: 'wi-test',
    target_context: 'fixture',
    requested_decision: 'fixture',
    authorized_action: 'publish',
    mode: 'one-time',
    scope: 'irrelevant prose that must never drive the coverage decision',
    owner: 'Fixture Owner',
    status: 'approved',
    decision_at: '2026-08-01T00:00:00Z',
    provenance: 'owner-confirmed',
    ...overrides,
  };
}

const transition: ProposedTransition = {
  workItemId: 'wi-test',
  fromStage: 'approval',
  toStage: 'delivery',
  action: 'publish',
};

describe('evaluateApprovalCoverage', () => {
  it('covers a matching, approved, unconditioned approval', () => {
    expect(evaluateApprovalCoverage(baseApproval(), transition, NOW)).toEqual({ kind: 'covered' });
  });

  it.each(['pending', 'denied', 'expired', 'superseded'] as const)(
    'does not cover status "%s"',
    (status) => {
      const result = evaluateApprovalCoverage(
        baseApproval({ status, decision_at: status === 'denied' ? '2026-08-01T00:00:00Z' : undefined }),
        transition,
        NOW,
      );
      expect(result.kind).toBe('not-covered');
    },
  );

  it('does not cover an approval past its structured expiration, even if status is approved', () => {
    const result = evaluateApprovalCoverage(
      baseApproval({ expiration: '2026-08-10T00:00:00Z' }),
      transition,
      NOW,
    );
    expect(result.kind).toBe('not-covered');
  });

  it('covers an approval whose expiration has not yet passed', () => {
    const result = evaluateApprovalCoverage(
      baseApproval({ expiration: '2026-12-31T00:00:00Z' }),
      transition,
      NOW,
    );
    expect(result.kind).toBe('covered');
  });

  it('does not cover a mismatched authorized_action', () => {
    const result = evaluateApprovalCoverage(
      baseApproval({ authorized_action: 'rotate credentials' }),
      transition,
      NOW,
    );
    expect(result.kind).toBe('not-covered');
  });

  it('does not cover a transition action when authorized_action is absent', () => {
    const result = evaluateApprovalCoverage(
      baseApproval({ authorized_action: undefined }),
      transition,
      NOW,
    );
    expect(result.kind).toBe('not-covered');
  });

  it('is indeterminate when the approval declares prose conditions', () => {
    const result = evaluateApprovalCoverage(
      baseApproval({ conditions: ['only during business hours'] }),
      transition,
      NOW,
    );
    expect(result.kind).toBe('indeterminate');
  });

  it('never reads scope to decide coverage', () => {
    const covered = evaluateApprovalCoverage(
      baseApproval({ scope: 'this does not authorize anything, deliberately contradictory prose' }),
      transition,
      NOW,
    );
    expect(covered.kind).toBe('covered');
  });
});

describe('approvalsBoundToWorkItem', () => {
  it('excludes an approval with no related_work_item_id', () => {
    const approvals = [baseApproval({ related_work_item_id: undefined })];
    expect(approvalsBoundToWorkItem(approvals, 'wi-test')).toEqual([]);
  });

  it('excludes an approval bound to a different Work Item', () => {
    const approvals = [baseApproval({ related_work_item_id: 'wi-other' })];
    expect(approvalsBoundToWorkItem(approvals, 'wi-test')).toEqual([]);
  });

  it('includes an approval bound to this Work Item', () => {
    const approval = baseApproval();
    expect(approvalsBoundToWorkItem([approval], 'wi-test')).toEqual([approval]);
  });
});
