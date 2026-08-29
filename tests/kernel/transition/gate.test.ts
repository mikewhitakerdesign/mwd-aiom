import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import { evaluateTransition } from '../../../src/kernel/transition/gate.js';
import type { ProposedTransition } from '../../../src/kernel/transition/types.js';
import { runtimeEvidence, type RuntimeEvidenceMap } from '../../../src/kernel/runtime/evidence.js';
import { materializeProjectState } from '../../../src/kernel/bootstrap/materialize.js';
import { buildCandidateProfile } from '../../../src/kernel/bootstrap/profile.js';
import { buildCapabilityActivationRecord } from '../../../src/kernel/bootstrap/capability-record.js';
import { buildFirstWorkItem } from '../../../src/kernel/bootstrap/work-item.js';
import { allUnknownSignals, confirmation } from '../helpers/bootstrap-fixtures.js';

const fixturesRoot = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const index = loadCapabilityIndex();
const NOW = new Date('2026-08-25T00:00:00Z');
const ACTION = 'publish the drafted content to the external system';

function fixtureDir(relativePath: string): string {
  return `${fixturesRoot}${relativePath}`;
}

const gateDir = fixtureDir('project-states/transition-gate');

function evaluate(transition: ProposedTransition) {
  return evaluateTransition(gateDir, transition, index, NOW);
}

describe('Transition Gate — A: AI-authorized internal transition', () => {
  it('is mechanically eligible with no approval search', () => {
    const result = evaluate({
      workItemId: 'wi-ai-internal',
      fromStage: 'research',
      toStage: 'implementation',
    });
    expect(result.outcome).toBe('mechanically-eligible');
    expect(result.issues).toEqual([]);
    expect(result.transitionId).toBe('research-to-implementation');
  });
});

describe('Transition Gate — B: Owner-authorized transition with an approved one-time approval', () => {
  it('is mechanically eligible when structured scope matches', () => {
    const result = evaluate({
      workItemId: 'wi-owner-approved',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('mechanically-eligible');
    expect(result.issues).toEqual([]);
  });
});

describe('Transition Gate — C: Owner-authorized transition with a pending approval', () => {
  it('is mechanically blocked', () => {
    const result = evaluate({
      workItemId: 'wi-owner-pending',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'no-covering-approval-found', severity: 'error' }),
    );
  });
});

describe('Transition Gate — D: denied / expired / superseded approvals', () => {
  it.each(['wi-owner-denied', 'wi-owner-expired', 'wi-owner-superseded'])(
    'blocks %s',
    (workItemId) => {
      const result = evaluate({
        workItemId,
        fromStage: 'approval',
        toStage: 'delivery',
        action: ACTION,
      });
      expect(result.outcome).toBe('mechanically-blocked');
    },
  );

  it('blocks an approved approval whose structured expiration has passed', () => {
    const result = evaluate({
      workItemId: 'wi-owner-approved-past-expiration',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('mechanically-blocked');
  });
});

describe('Transition Gate — E/F: activation is not authorization', () => {
  it('the capability check passes but the transition is still blocked for lack of authorization', () => {
    const result = evaluate({
      workItemId: 'wi-external-no-approval',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).not.toContainEqual(
      expect.objectContaining({ code: expect.stringMatching(/^capability-/) }),
    );
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'no-covering-approval-found' }),
    );
  });
});

describe('Transition Gate — G: approval bound to the right Work Item but the wrong action', () => {
  it('is mechanically blocked', () => {
    const result = evaluate({
      workItemId: 'wi-wrong-action',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'no-covering-approval-found' }),
    );
  });

  it('reports approval-work-item-mismatch when an unrelated approval is explicitly pinned', () => {
    const result = evaluate({
      workItemId: 'wi-wrong-action',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
      approvalId: 'appr-owner-approved',
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'approval-work-item-mismatch' }),
    );
  });
});

describe('Transition Gate — H: mechanically eligible while strategic judgment remains open', () => {
  it('eligible does not assert the work should proceed — it asserts only that no checked prerequisite blocks it', () => {
    const result = evaluate({
      workItemId: 'wi-ai-internal',
      fromStage: 'research',
      toStage: 'implementation',
    });
    expect(result.outcome).toBe('mechanically-eligible');
    // The result carries no field claiming strategic appropriateness — only
    // deterministic issues (here, none) and the outcome label itself.
    expect(Object.keys(result)).toEqual(['outcome', 'workItemId', 'transitionId', 'issues']);
  });
});

describe('Transition Gate — I: durable-policy approval with mechanically matchable scope', () => {
  it('is mechanically eligible', () => {
    const result = evaluate({
      workItemId: 'wi-durable-policy',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('mechanically-eligible');
  });
});

describe('Transition Gate — J: prose-only conditions force indeterminate, never silent permission', () => {
  it('is indeterminate, not eligible and not blocked', () => {
    const result = evaluate({
      workItemId: 'wi-conditions-ambiguous',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(result.outcome).toBe('indeterminate');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'approval-coverage-indeterminate', severity: 'indeterminate' }),
    );
  });
});

describe('Transition Gate — K: runtime prerequisite required, no Runtime Probe evidence', () => {
  it('is indeterminate, never assumed available', () => {
    const result = evaluate({
      workItemId: 'wi-runtime-pending',
      fromStage: 'research',
      toStage: 'implementation',
      capabilityId: 'persistent-continuation',
    });
    expect(result.outcome).toBe('indeterminate');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'runtime-prerequisite-unverified', severity: 'indeterminate' }),
    );
  });
});

describe('Transition Gate — Initiative 7: Runtime Evidence resolves the runtime-prerequisite seam', () => {
  const runtimeDir = fixtureDir('project-states/runtime-orchestration');
  const runtimeTransition: ProposedTransition = {
    workItemId: 'wi-runtime-authorized',
    fromStage: 'approval',
    toStage: 'delivery',
    action: 'notify the external monitoring endpoint',
  };
  const RUNTIME_NOW = new Date('2026-08-20T00:00:00Z');

  it('runtime requirement known + no evidence supplied: stays indeterminate (unchanged Initiative 6 behavior)', () => {
    const result = evaluateTransition(runtimeDir, runtimeTransition, index, RUNTIME_NOW);
    expect(result.outcome).toBe('indeterminate');
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'runtime-prerequisite-unverified',
        severity: 'indeterminate',
        requirementId: 'network-access',
      }),
    );
  });

  it('runtime requirement known + evidence available: stops being indeterminate on that dimension', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'available', 'test', RUNTIME_NOW)],
    ]);
    const result = evaluateTransition(runtimeDir, runtimeTransition, index, RUNTIME_NOW, evidence);
    expect(result.outcome).toBe('mechanically-eligible');
    expect(result.issues).toEqual([]);
  });

  it('runtime requirement known + evidence unavailable: mechanically blocked, not indeterminate', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'unavailable', 'test', RUNTIME_NOW)],
    ]);
    const result = evaluateTransition(runtimeDir, runtimeTransition, index, RUNTIME_NOW, evidence);
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'runtime-requirement-unavailable',
        severity: 'error',
        requirementId: 'network-access',
      }),
    );
  });

  it('runtime requirement known + evidence unknown: remains indeterminate', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'unknown', 'test', RUNTIME_NOW)],
    ]);
    const result = evaluateTransition(runtimeDir, runtimeTransition, index, RUNTIME_NOW, evidence);
    expect(result.outcome).toBe('indeterminate');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'runtime-prerequisite-unverified', severity: 'indeterminate' }),
    );
  });

  it('runtime availability never substitutes for missing Owner authorization', () => {
    const evidence: RuntimeEvidenceMap = new Map([
      ['network-access', runtimeEvidence('network-access', 'available', 'test', RUNTIME_NOW)],
    ]);
    const result = evaluateTransition(
      runtimeDir,
      { ...runtimeTransition, workItemId: 'wi-no-approval' },
      index,
      RUNTIME_NOW,
      evidence,
    );
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'no-covering-approval-found' }),
    );
  });
});

describe('Transition Gate — deterministic structural prerequisites', () => {
  it('blocks a transition whose validation prerequisite has not passed', () => {
    const result = evaluate({
      workItemId: 'wi-validation-incomplete',
      fromStage: 'validation',
      toStage: 'approval',
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'validation-not-passed' }),
    );
  });

  it('blocks an unlisted from/to pair as not permitted', () => {
    const result = evaluate({
      workItemId: 'wi-ai-internal',
      fromStage: 'research',
      toStage: 'delivery',
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'transition-not-permitted' }),
    );
  });

  it('blocks a requested fromStage that does not match the recorded stage', () => {
    const result = evaluate({
      workItemId: 'wi-ai-internal',
      fromStage: 'implementation',
      toStage: 'validation',
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'stage-mismatch' }));
  });

  it('blocks a Work Item ID that does not resolve', () => {
    const result = evaluate({
      workItemId: 'wi-does-not-exist',
      fromStage: 'research',
      toStage: 'implementation',
    });
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'work-item-not-found' }));
  });
});

describe('Transition Gate — prerequisite project-state failure', () => {
  it('reports the prerequisite failure rather than attempting interpretive recovery', () => {
    const result = evaluateTransition(
      fixtureDir('project-states/invalid/unknown-capability'),
      {
        workItemId: 'anything',
        fromStage: 'research',
        toStage: 'implementation',
      },
      index,
      NOW,
    );
    expect(result.outcome).toBe('mechanically-blocked');
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'project-state-invalid' }),
    );
    expect(result.transitionId).toBeUndefined();
  });
});

describe('Transition Gate — read-only guarantee', () => {
  it('evaluating a transition does not alter fixture files on disk', () => {
    const before = evaluate({
      workItemId: 'wi-owner-approved',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    const after = evaluate({
      workItemId: 'wi-owner-approved',
      fromStage: 'approval',
      toStage: 'delivery',
      action: ACTION,
    });
    expect(after).toEqual(before);
  });
});

describe('Transition Gate — Initiative 14 Seed Snapshot Integrity does not affect eligibility', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('remains mechanically-eligible when a materialized Seed asset has been hand-edited', () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'aiom-seed-snapshot-transition-'));
    tempDirs.push(projectDir);

    const profile = buildCandidateProfile({
      profile: {
        projectName: 'Seed Snapshot Integrity Transition Fixture',
        projectIntent: 'Prove a Seed Snapshot Integrity warning does not block an eligible transition.',
        ownerIdentity: 'Sam',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'active-development',
        signals: allUnknownSignals(),
        consequenceConfirmations: {
          consequential_external_action: confirmation('no', 'owner-confirmed'),
          sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
        },
      },
      unresolvedItems: [],
      bootstrapReady: true,
      nextGovernedAction: 'Begin implementation planning.',
    });
    const capabilityActivation = buildCapabilityActivationRecord([], []);
    const workItem = buildFirstWorkItem({
      id: 'wi-seed-snapshot-fixture',
      title: 'Seed Snapshot Integrity fixture Work Item',
      objective: 'Exercise a mechanically-eligible transition alongside a Seed Snapshot Integrity warning.',
      stage: 'research',
      currentResponsibility: 'orchestrator',
    });

    const materialized = materializeProjectState(projectDir, {
      profile,
      capabilityActivation,
      workItems: [workItem],
      approvals: [],
    });

    // Hand-edit a materialized Seed asset so the underlying validateProjectState
    // call this Gate performs internally reports a seed-snapshot-mismatch
    // warning — proving it never reaches result.outcome or result.issues.
    writeFileSync(path.join(materialized.stateDir, 'seed', 'core.md'), 'hand-edited core guidance', 'utf8');

    const result = evaluateTransition(
      materialized.stateDir,
      { workItemId: 'wi-seed-snapshot-fixture', fromStage: 'research', toStage: 'implementation' },
      index,
    );

    expect(result.outcome).toBe('mechanically-eligible');
    expect(result.issues).toEqual([]);
  });
});
