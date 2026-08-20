import { describe, expect, it } from 'vitest';
import { evaluateCapabilityRequirement } from '../../../src/kernel/transition/capability.js';
import { loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import type { CapabilityActivationRecord } from '../../../src/kernel/schemas/capability-activation.js';
import { runtimeEvidence, type RuntimeEvidenceMap } from '../../../src/kernel/runtime/evidence.js';

const index = loadCapabilityIndex();
const NOW = new Date('2026-08-20T00:00:00Z');

function activationWithRuntimeReference(reference: string | undefined): CapabilityActivationRecord {
  return {
    seed_version: '0.1',
    bundles: [],
    capabilities: [
      {
        capability_id: 'persistent-continuation',
        status: 'required',
        provenance: 'owner-confirmed',
        ...(reference !== undefined ? { runtime_requirement_reference: reference } : {}),
      },
    ],
  };
}

function evidenceMap(entries: ReturnType<typeof runtimeEvidence>[]): RuntimeEvidenceMap {
  return new Map(entries.map((entry) => [entry.requirementId, entry]));
}

describe('evaluateCapabilityRequirement — Initiative 6 baseline (no runtimeEvidence argument)', () => {
  it('stays indeterminate exactly as before Initiative 7 when no evidence is supplied', () => {
    const activation = activationWithRuntimeReference('network-access');
    const issues = evaluateCapabilityRequirement('persistent-continuation', index, activation);
    expect(issues).toEqual([
      expect.objectContaining({ code: 'runtime-prerequisite-unverified', severity: 'indeterminate' }),
    ]);
  });
});

describe('evaluateCapabilityRequirement — runtime requirement known + evidence available', () => {
  it('resolves the runtime dimension: no issue is raised', () => {
    const activation = activationWithRuntimeReference('network-access');
    const evidence = evidenceMap([runtimeEvidence('network-access', 'available', 'test', NOW)]);
    const issues = evaluateCapabilityRequirement(
      'persistent-continuation',
      index,
      activation,
      evidence,
    );
    expect(issues).toEqual([]);
  });
});

describe('evaluateCapabilityRequirement — runtime requirement known + evidence unavailable', () => {
  it('remains mechanically blocked, with the requirement ID attached structurally', () => {
    const activation = activationWithRuntimeReference('network-access');
    const evidence = evidenceMap([runtimeEvidence('network-access', 'unavailable', 'test', NOW)]);
    const issues = evaluateCapabilityRequirement(
      'persistent-continuation',
      index,
      activation,
      evidence,
    );
    expect(issues).toEqual([
      expect.objectContaining({
        code: 'runtime-requirement-unavailable',
        severity: 'error',
        requirementId: 'network-access',
      }),
    ]);
  });
});

describe('evaluateCapabilityRequirement — runtime requirement known + evidence unknown', () => {
  it('remains indeterminate, with the requirement ID attached structurally', () => {
    const activation = activationWithRuntimeReference('network-access');
    const evidence = evidenceMap([runtimeEvidence('network-access', 'unknown', 'test', NOW)]);
    const issues = evaluateCapabilityRequirement(
      'persistent-continuation',
      index,
      activation,
      evidence,
    );
    expect(issues).toEqual([
      expect.objectContaining({
        code: 'runtime-prerequisite-unverified',
        severity: 'indeterminate',
        requirementId: 'network-access',
      }),
    ]);
  });
});

describe('evaluateCapabilityRequirement — free-text runtime_requirement_reference is not mechanically comparable', () => {
  it('stays indeterminate even when evidence exists, because the reference is not a recognized Runtime Requirement ID', () => {
    const activation = activationWithRuntimeReference(
      'requires outbound network access to the scheduled monitoring endpoint',
    );
    const evidence = evidenceMap([runtimeEvidence('network-access', 'available', 'test', NOW)]);
    const issues = evaluateCapabilityRequirement(
      'persistent-continuation',
      index,
      activation,
      evidence,
    );
    expect(issues).toEqual([
      expect.objectContaining({ code: 'runtime-prerequisite-unverified', severity: 'indeterminate' }),
    ]);
    expect(issues[0]?.requirementId).toBeUndefined();
  });
});

describe('evaluateCapabilityRequirement — G: no runtime requirement recorded', () => {
  it('never manufactures a runtime issue when the capability records none', () => {
    const activation = activationWithRuntimeReference(undefined);
    const evidence = evidenceMap([runtimeEvidence('network-access', 'unavailable', 'test', NOW)]);
    const issues = evaluateCapabilityRequirement(
      'persistent-continuation',
      index,
      activation,
      evidence,
    );
    expect(issues).toEqual([]);
  });
});

describe('evaluateCapabilityRequirement — activation is independent of runtime availability', () => {
  it('a deferred capability is blocked for activation reasons regardless of runtime evidence', () => {
    const activation: CapabilityActivationRecord = {
      seed_version: '0.1',
      bundles: [],
      capabilities: [
        {
          capability_id: 'persistent-continuation',
          status: 'deferred',
          provenance: 'owner-confirmed',
          runtime_requirement_reference: 'network-access',
        },
      ],
    };
    const evidence = evidenceMap([runtimeEvidence('network-access', 'available', 'test', NOW)]);
    const issues = evaluateCapabilityRequirement(
      'persistent-continuation',
      index,
      activation,
      evidence,
    );
    expect(issues).toEqual([
      expect.objectContaining({ code: 'capability-not-active', severity: 'error' }),
    ]);
  });
});
