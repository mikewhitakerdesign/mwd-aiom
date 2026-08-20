import { describe, expect, it } from 'vitest';
import {
  buildCapabilityIndex,
  loadCapabilityIndex,
} from '../../../src/kernel/validation/capability-index.js';

const KNOWN_BUNDLE_IDS = [
  'repository-versioned-delivery',
  'software-engineering',
  'web-ui-experience',
  'content-publication',
  'external-action-integration',
  'persistent-operation-monitoring',
];

const KNOWN_CAPABILITY_IDS = [
  'repository-inspection',
  'bounded-delivery',
  'software-implementation',
  'deterministic-validation',
  'ui-implementation',
  'research-discovery',
  'external-action-execution',
  'persistent-continuation',
];

describe('loadCapabilityIndex', () => {
  const index = loadCapabilityIndex();

  it('resolves exactly the six v0.1 Capability Bundle IDs', () => {
    expect([...index.bundles.keys()].sort()).toEqual([...KNOWN_BUNDLE_IDS].sort());
  });

  it('resolves exactly the eight v0.1 Atomic Capability IDs', () => {
    expect([...index.capabilities.keys()].sort()).toEqual([...KNOWN_CAPABILITY_IDS].sort());
  });

  it('marks research-discovery as cross-cutting with no bundle membership', () => {
    const definition = index.capabilities.get('research-discovery');
    expect(definition?.crossCutting).toBe(true);
    expect(definition?.bundleId).toBeNull();
  });

  it('resolves non-cross-cutting capabilities to their declared bundle', () => {
    expect(index.capabilities.get('repository-inspection')?.bundleId).toBe(
      'repository-versioned-delivery',
    );
    expect(index.capabilities.get('bounded-delivery')?.bundleId).toBe(
      'repository-versioned-delivery',
    );
    expect(index.capabilities.get('software-implementation')?.bundleId).toBe(
      'software-engineering',
    );
    expect(index.capabilities.get('deterministic-validation')?.bundleId).toBe(
      'software-engineering',
    );
    expect(index.capabilities.get('ui-implementation')?.bundleId).toBe('web-ui-experience');
    expect(index.capabilities.get('external-action-execution')?.bundleId).toBe(
      'external-action-integration',
    );
    expect(index.capabilities.get('persistent-continuation')?.bundleId).toBe(
      'persistent-operation-monitoring',
    );
  });

  it('builds bundle membership consistent with each capability’s declared bundle', () => {
    expect(index.bundleMembership.get('repository-versioned-delivery')).toEqual(
      new Set(['repository-inspection', 'bounded-delivery']),
    );
    expect(index.bundleMembership.get('software-engineering')).toEqual(
      new Set(['software-implementation', 'deterministic-validation']),
    );
  });
});

describe('buildCapabilityIndex', () => {
  it('is a pure function of its Markdown input', () => {
    const bundlesMd = [
      '## 1. Example Bundle',
      '',
      '**ID:** `example-bundle`',
      '',
      '**Purpose:** testing.',
    ].join('\n');
    const capabilitiesMd = [
      '## 1. `example-capability`',
      '',
      '**Name:** Example Capability',
      '',
      '**Responsibility:** testing.',
      '',
      '**Bundle:** Example Bundle',
    ].join('\n');

    const index = buildCapabilityIndex(bundlesMd, capabilitiesMd);
    expect(index.bundles.get('example-bundle')?.name).toBe('Example Bundle');
    expect(index.capabilities.get('example-capability')?.bundleId).toBe('example-bundle');
    expect(index.bundleMembership.get('example-bundle')).toEqual(new Set(['example-capability']));
  });

  it('marks a capability cross-cutting when its Bundle field says so', () => {
    const capabilitiesMd = [
      '## 1. `example-capability`',
      '',
      '**Name:** Example Capability',
      '',
      '**Bundle:** cross-cutting (not owned by a single bundle)',
    ].join('\n');

    const index = buildCapabilityIndex('', capabilitiesMd);
    const definition = index.capabilities.get('example-capability');
    expect(definition?.crossCutting).toBe(true);
    expect(definition?.bundleId).toBeNull();
  });

  it('leaves bundleId null when the Bundle field does not match any known bundle name', () => {
    const capabilitiesMd = [
      '## 1. `example-capability`',
      '',
      '**Name:** Example Capability',
      '',
      '**Bundle:** Some Unrecognized Bundle Name',
    ].join('\n');

    const index = buildCapabilityIndex('', capabilitiesMd);
    const definition = index.capabilities.get('example-capability');
    expect(definition?.crossCutting).toBe(false);
    expect(definition?.bundleId).toBeNull();
  });
});
