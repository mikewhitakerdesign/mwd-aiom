import { describe, expect, it } from 'vitest';
import {
  evaluateRuntimeRequirements,
  probeRequirement,
  probeRuntime,
} from '../../../src/kernel/runtime/probe.js';
import { createSimulatedAdapter } from '../../kernel/helpers/runtime-fixtures.js';

const NOW = new Date('2026-08-20T00:00:00Z');

describe('probeRequirement / probeRuntime', () => {
  it('probes a single requirement via an adapter', () => {
    const adapter = createSimulatedAdapter('fixture-a', { 'filesystem-read': 'available' });
    const evidence = probeRequirement(adapter, 'filesystem-read', NOW);
    expect(evidence).toEqual({
      requirementId: 'filesystem-read',
      availability: 'available',
      mechanism: 'simulated fixture adapter "fixture-a"',
      checkedAt: NOW.toISOString(),
    });
  });

  it('probes multiple requirements into an evidence map', () => {
    const adapter = createSimulatedAdapter('fixture-b', {
      'filesystem-read': 'available',
      'network-access': 'unavailable',
    });
    const evidence = probeRuntime(adapter, ['filesystem-read', 'network-access'], NOW);
    expect(evidence.get('filesystem-read')?.availability).toBe('available');
    expect(evidence.get('network-access')?.availability).toBe('unavailable');
  });
});

describe('evaluateRuntimeRequirements — A: all required capabilities available', () => {
  it('reports every requirement as satisfied', () => {
    const adapter = createSimulatedAdapter('fixture', {
      'repository-read': 'available',
      'repository-write': 'available',
    });
    const evidence = probeRuntime(adapter, ['repository-read', 'repository-write'], NOW);
    const result = evaluateRuntimeRequirements(evidence, ['repository-read', 'repository-write']);
    expect(result).toEqual({
      satisfied: ['repository-read', 'repository-write'],
      unavailable: [],
      unknown: [],
    });
  });
});

describe('evaluateRuntimeRequirements — B: required capability unavailable', () => {
  it('reports the requirement as unavailable, not unknown', () => {
    const adapter = createSimulatedAdapter('fixture', { 'network-access': 'unavailable' });
    const evidence = probeRuntime(adapter, ['network-access'], NOW);
    const result = evaluateRuntimeRequirements(evidence, ['network-access']);
    expect(result).toEqual({ satisfied: [], unavailable: ['network-access'], unknown: [] });
  });
});

describe('evaluateRuntimeRequirements — C: required capability unknown', () => {
  it('reports the requirement as unknown, never assumed unavailable or available', () => {
    const adapter = createSimulatedAdapter('fixture', { 'network-access': 'unknown' });
    const evidence = probeRuntime(adapter, ['network-access'], NOW);
    const result = evaluateRuntimeRequirements(evidence, ['network-access']);
    expect(result).toEqual({ satisfied: [], unavailable: [], unknown: ['network-access'] });
  });

  it('treats a requirement with no probed evidence at all the same as unknown', () => {
    const result = evaluateRuntimeRequirements(new Map(), ['network-access']);
    expect(result).toEqual({ satisfied: [], unavailable: [], unknown: ['network-access'] });
  });
});

describe('evaluateRuntimeRequirements — G: no runtime requirement', () => {
  it('does not manufacture a requirement when none is requested', () => {
    const evidence = probeRuntime(createSimulatedAdapter('fixture', {}), [], NOW);
    const result = evaluateRuntimeRequirements(evidence, []);
    expect(result).toEqual({ satisfied: [], unavailable: [], unknown: [] });
  });
});

describe('evaluateRuntimeRequirements — H: two differently-implemented adapters produce interchangeable evidence', () => {
  it('a Core consumer gets the same RuntimeEvidence shape from either adapter, without needing to know which one produced it', () => {
    const adapterOne = createSimulatedAdapter('fixture-one', { 'filesystem-write': 'available' });
    const adapterTwo = createSimulatedAdapter('fixture-two', { 'filesystem-write': 'available' });

    const consume = (evidence: ReturnType<typeof probeRequirement>) =>
      evaluateRuntimeRequirements(new Map([[evidence.requirementId, evidence]]), [
        evidence.requirementId,
      ]);

    const resultOne = consume(probeRequirement(adapterOne, 'filesystem-write', NOW));
    const resultTwo = consume(probeRequirement(adapterTwo, 'filesystem-write', NOW));

    expect(resultOne).toEqual(resultTwo);
    expect(resultOne).toEqual({
      satisfied: ['filesystem-write'],
      unavailable: [],
      unknown: [],
    });
  });
});
