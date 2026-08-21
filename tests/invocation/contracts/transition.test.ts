import { describe, expect, it } from 'vitest';
import { proposedTransitionSchema, runtimeRequirementIdSchema } from '../../../src/invocation/contracts/transition.js';
import type { ProposedTransition } from '../../../src/kernel/transition/index.js';
import { RUNTIME_REQUIREMENT_IDS } from '../../../src/kernel/runtime/requirements.js';

describe('proposedTransitionSchema — TS/Zod drift protection', () => {
  it('a value typed as the kernel ProposedTransition interface parses successfully', () => {
    const transition: ProposedTransition = {
      workItemId: 'wi-1',
      fromStage: 'research',
      toStage: 'implementation',
      action: 'do the thing',
      capabilityId: 'software-implementation',
      approvalId: 'approve-1',
    };
    const parsed = proposedTransitionSchema.parse(transition);
    const _assignableBack: ProposedTransition = parsed;
    expect(_assignableBack.workItemId).toBe('wi-1');
  });

  it('accepts the minimal required-only shape', () => {
    const transition: ProposedTransition = { workItemId: 'wi-1', fromStage: 'research', toStage: 'implementation' };
    expect(() => proposedTransitionSchema.parse(transition)).not.toThrow();
  });

  it('rejects an unknown stage', () => {
    const result = proposedTransitionSchema.safeParse({ workItemId: 'wi-1', fromStage: 'research', toStage: 'not-a-real-stage' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing workItemId', () => {
    const result = proposedTransitionSchema.safeParse({ fromStage: 'research', toStage: 'implementation' });
    expect(result.success).toBe(false);
  });
});

describe('runtimeRequirementIdSchema', () => {
  it('accepts every ID in the kernel RUNTIME_REQUIREMENT_IDS vocabulary', () => {
    for (const id of RUNTIME_REQUIREMENT_IDS) {
      expect(runtimeRequirementIdSchema.parse(id)).toBe(id);
    }
  });

  it('rejects an unknown requirement id', () => {
    const result = runtimeRequirementIdSchema.safeParse('gpu-access');
    expect(result.success).toBe(false);
  });
});
