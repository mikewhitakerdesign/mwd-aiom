import { describe, expect, it } from 'vitest';
import { parseOwnerApprovalDocument } from '../../../src/kernel/documents.js';
import {
  approvalModeSchema,
  approvalStatusSchema,
} from '../../../src/kernel/schemas/approval.js';
import { readFixture } from '../helpers/fixtures.js';

describe('Owner Approval Artifact', () => {
  it('parses and validates the Scenario C approval', () => {
    const result = parseOwnerApprovalDocument(
      readFixture('scenario-c-external-action/approval.yaml'),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('pending');
      expect(result.data.decision_at).toBeUndefined();
    }
  });

  it('parses and validates the Seed template', () => {
    const result = parseOwnerApprovalDocument(
      readFixture('../../seed/templates/approval.yaml'),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects an approved status with no decision_at', () => {
    const result = parseOwnerApprovalDocument(
      readFixture('invalid/approval-approved-without-decision-at.yaml'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/decision_at/);
    }
  });

  it.each(['one-time', 'durable-policy', 'recurring-case-by-case'] as const)(
    'accepts authorization mode "%s"',
    (mode) => {
      expect(approvalModeSchema.safeParse(mode).success).toBe(true);
    },
  );

  it.each(['pending', 'approved', 'denied', 'expired', 'superseded'] as const)(
    'accepts status "%s"',
    (status) => {
      expect(approvalStatusSchema.safeParse(status).success).toBe(true);
    },
  );

  it('rejects an unrecognized status', () => {
    expect(approvalStatusSchema.safeParse('rejected').success).toBe(false);
  });
});
