import { describe, expect, it } from 'vitest';
import { TRANSITION_RULES, findTransitionRule } from '../../../src/kernel/transition/rules.js';

describe('TRANSITION_RULES', () => {
  it('resolves each defined from/to pair to a stable rule id', () => {
    for (const rule of TRANSITION_RULES) {
      expect(findTransitionRule(rule.from, rule.to)).toEqual(rule);
    }
  });

  it('does not resolve an unlisted from/to pair', () => {
    expect(findTransitionRule('research', 'delivery')).toBeUndefined();
    expect(findTransitionRule('approval', 'research')).toBeUndefined();
    expect(findTransitionRule('handoff', 'research')).toBeUndefined();
  });

  it('marks only the approval -> delivery transition as crossing the authority boundary', () => {
    const boundaryRules = TRANSITION_RULES.filter((rule) => rule.authorityBoundary);
    expect(boundaryRules.map((rule) => rule.id)).toEqual(['approval-to-delivery']);
  });
});
