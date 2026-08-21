import { describe, expect, it } from 'vitest';
import { invocationRequestSchema } from '../../../src/invocation/contracts/request.js';
import { allUnknownSignals, confirmation, readyAssessment } from '../../kernel/helpers/bootstrap-fixtures.js';

function minimalBootstrapDecisions() {
  return {
    durableStateJustified: false,
    profile: {
      projectName: 'x',
      projectIntent: 'x',
      ownerIdentity: 'x',
      existingStateAssessmentPerformed: false,
      lifecyclePosition: 'research',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('unresolved'),
        sensitive_or_high_consequence_data: confirmation('unresolved'),
      },
    },
    bundles: [],
    capabilities: [],
    bootstrapReadyAssessment: readyAssessment(),
    bootstrapReady: false,
    nextGovernedAction: 'research',
  };
}

describe('invocationRequestSchema', () => {
  it('accepts a minimal validate request', () => {
    const result = invocationRequestSchema.safeParse({ operation: 'validate', projectRoot: '/tmp/x' });
    expect(result.success).toBe(true);
  });

  it('rejects a validate request missing projectRoot', () => {
    const result = invocationRequestSchema.safeParse({ operation: 'validate' });
    expect(result.success).toBe(false);
  });

  it('accepts a bootstrap request and defaults materialize to false when omitted', () => {
    const result = invocationRequestSchema.safeParse({
      operation: 'bootstrap',
      projectRoot: '/tmp/x',
      ownerContext: 'build a thing',
      decisions: minimalBootstrapDecisions(),
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.operation === 'bootstrap') {
      expect(result.data.materialize).toBe(false);
    }
  });

  it('rejects a bootstrap request with malformed decisions', () => {
    const result = invocationRequestSchema.safeParse({
      operation: 'bootstrap',
      projectRoot: '/tmp/x',
      ownerContext: 'build a thing',
      decisions: { durableStateJustified: 'not-a-boolean' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid ISO-8601 now string on transition and rejects a malformed one', () => {
    const base = {
      operation: 'transition' as const,
      projectRoot: '/tmp/x',
      transition: { workItemId: 'wi-1', fromStage: 'research' as const, toStage: 'implementation' as const },
    };
    expect(invocationRequestSchema.safeParse({ ...base, now: '2026-08-21T18:00:00.000Z' }).success).toBe(true);
    expect(invocationRequestSchema.safeParse({ ...base, now: 'not-a-date' }).success).toBe(false);
  });

  it('rejects an unknown operation', () => {
    const result = invocationRequestSchema.safeParse({ operation: 'frobnicate', projectRoot: '/tmp/x' });
    expect(result.success).toBe(false);
  });

  it('rejects a completely empty payload', () => {
    const result = invocationRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
