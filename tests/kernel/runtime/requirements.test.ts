import { describe, expect, it } from 'vitest';
import {
  CAPABILITY_REQUIREMENT_MAP,
  RUNTIME_REQUIREMENT_IDS,
  isRuntimeRequirementId,
} from '../../../src/kernel/runtime/requirements.js';

describe('RUNTIME_REQUIREMENT_IDS', () => {
  it('is a small, stable, provider-neutral vocabulary', () => {
    expect(RUNTIME_REQUIREMENT_IDS).toEqual([
      'filesystem-read',
      'filesystem-write',
      'process-execution',
      'repository-read',
      'repository-write',
      'network-access',
    ]);
  });

  it('contains no provider or tool names', () => {
    const providerNames = ['claude', 'codex', 'chatgpt', 'vscode', 'github'];
    for (const id of RUNTIME_REQUIREMENT_IDS) {
      for (const name of providerNames) {
        expect(id.toLowerCase()).not.toContain(name);
      }
    }
  });
});

describe('isRuntimeRequirementId', () => {
  it('recognizes canonical IDs', () => {
    expect(isRuntimeRequirementId('repository-read')).toBe(true);
  });

  it('rejects free-text prose, including a real recorded runtime_requirement_reference value', () => {
    expect(
      isRuntimeRequirementId('requires outbound network access to the scheduled monitoring endpoint'),
    ).toBe(false);
  });
});

describe('CAPABILITY_REQUIREMENT_MAP', () => {
  it('maps only the two capabilities whose abstract requirement is already unambiguous', () => {
    expect(CAPABILITY_REQUIREMENT_MAP['repository-inspection']).toBe('repository-read');
    expect(CAPABILITY_REQUIREMENT_MAP['bounded-delivery']).toBe('repository-write');
  });

  it('does not force a single ID onto capabilities whose abstract requirement is context-dependent by design', () => {
    expect(CAPABILITY_REQUIREMENT_MAP['research-discovery']).toBeUndefined();
    expect(CAPABILITY_REQUIREMENT_MAP['external-action-execution']).toBeUndefined();
    expect(CAPABILITY_REQUIREMENT_MAP['deterministic-validation']).toBeUndefined();
    expect(CAPABILITY_REQUIREMENT_MAP['ui-implementation']).toBeUndefined();
    expect(CAPABILITY_REQUIREMENT_MAP['software-implementation']).toBeUndefined();
    expect(CAPABILITY_REQUIREMENT_MAP['persistent-continuation']).toBeUndefined();
  });

  it('covers all eight v0.1 Atomic Capability IDs', () => {
    expect(Object.keys(CAPABILITY_REQUIREMENT_MAP).sort()).toEqual(
      [
        'bounded-delivery',
        'deterministic-validation',
        'external-action-execution',
        'persistent-continuation',
        'repository-inspection',
        'research-discovery',
        'software-implementation',
        'ui-implementation',
      ].sort(),
    );
  });
});
