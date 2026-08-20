import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { orchestrate } from '../../../src/kernel/orchestration/orchestrate.js';
import { loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import { runtimeEvidence, type RuntimeEvidenceMap } from '../../../src/kernel/runtime/evidence.js';
import type { ProposedTransition } from '../../../src/kernel/transition/types.js';

const fixturesRoot = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const index = loadCapabilityIndex();
const NOW = new Date('2026-08-20T00:00:00Z');
const ACTION = 'notify the external monitoring endpoint';

function fixtureDir(relativePath: string): string {
  return `${fixturesRoot}${relativePath}`;
}

const orchestrationDir = fixtureDir('project-states/runtime-orchestration');

function run(
  transition: ProposedTransition,
  runtimeEvidenceMap?: RuntimeEvidenceMap,
  dir = orchestrationDir,
) {
  return orchestrate(dir, transition, { index, now: NOW, runtimeEvidence: runtimeEvidenceMap });
}

describe('Orchestrator — Scenario 1: invalid state', () => {
  it('reports blocked-by-invalid-state without inventing a Work Item disposition', () => {
    const result = run(
      { workItemId: 'anything', fromStage: 'research', toStage: 'implementation' },
      undefined,
      fixtureDir('project-states/invalid/unknown-capability'),
    );
    expect(result.disposition).toBe('blocked-by-invalid-state');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'project-state-invalid' }),
    );
  });
});

describe('Orchestrator — Scenario 2: valid state, approval required but missing', () => {
  it('reports awaiting-owner-authorization with a required Owner action', () => {
    const result = run({
      workItemId: 'wi-no-approval',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.disposition).toBe('awaiting-owner-authorization');
    expect(result.requiredOwnerAction).toBeDefined();
    expect(result.requiredRuntimeCapability).toBeUndefined();
  });
});

describe('Orchestrator — Scenario 3: valid + approved, runtime unavailable', () => {
  it('reports blocked-by-runtime with the specific Runtime Requirement ID', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'unavailable', 'test', NOW)],
    ]);
    const result = run(
      {
        workItemId: 'wi-runtime-authorized',
        fromStage: 'approval',
        toStage: 'delivery',
        action: ACTION,
      },
      evidence,
    );
    expect(result.disposition).toBe('blocked-by-runtime');
    expect(result.requiredRuntimeCapability).toBe('network-access');
  });
});

describe('Orchestrator — Scenario 4: valid + approved, runtime unknown', () => {
  it('reports runtime-unknown, not blocked and not ready, whether evidence is explicitly unknown or simply absent', () => {
    const transition: ProposedTransition = {
      workItemId: 'wi-runtime-authorized',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    };

    const withoutEvidence = run(transition);
    expect(withoutEvidence.disposition).toBe('runtime-unknown');
    expect(withoutEvidence.requiredRuntimeCapability).toBe('network-access');

    const explicitlyUnknown: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'unknown', 'test', NOW)],
    ]);
    const withUnknownEvidence = run(transition, explicitlyUnknown);
    expect(withUnknownEvidence.disposition).toBe('runtime-unknown');
  });
});

describe('Orchestrator — Scenario 5: valid + approved + runtime available', () => {
  it('reports ready-for-governed-execution and never asserts the work should be executed', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'available', 'test', NOW)],
    ]);
    const result = run(
      {
        workItemId: 'wi-runtime-authorized',
        fromStage: 'approval',
        toStage: 'delivery',
        action: ACTION,
      },
      evidence,
    );
    expect(result.disposition).toBe('ready-for-governed-execution');
    expect(result.issues).toEqual([]);
    expect(result.requiredOwnerAction).toBeUndefined();
    expect(result.requiredRuntimeCapability).toBeUndefined();
    expect(result.qualitativeJudgmentRemains).toBe(false);
    expect(Object.keys(result).sort()).toEqual(
      [
        'disposition',
        'workItemId',
        'transitionId',
        'gateOutcome',
        'issues',
        'requiredOwnerAction',
        'requiredRuntimeCapability',
        'qualitativeJudgmentRemains',
      ].sort(),
    );
  });
});

describe('Orchestrator — Scenario 6: mechanically clear except for qualitative judgment', () => {
  it('identifies remaining qualitative judgment rather than inventing a decision', () => {
    const result = run({
      workItemId: 'wi-qualitative',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.disposition).toBe('requires-qualitative-judgment');
    expect(result.qualitativeJudgmentRemains).toBe(true);
    expect(result.gateOutcome).toBe('indeterminate');
  });
});

describe('Orchestrator — read-only guarantee', () => {
  it('evaluating the same transition twice produces identical results', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'available', 'test', NOW)],
    ]);
    const transition: ProposedTransition = {
      workItemId: 'wi-runtime-authorized',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    };
    const before = run(transition, evidence);
    const after = run(transition, evidence);
    expect(after).toEqual(before);
  });
});
