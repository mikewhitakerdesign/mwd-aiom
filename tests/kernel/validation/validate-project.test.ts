import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import { validateProjectState } from '../../../src/kernel/validation/validate-project.js';
import { materializeProjectState } from '../../../src/kernel/bootstrap/materialize.js';
import { buildCandidateProfile } from '../../../src/kernel/bootstrap/profile.js';
import { buildCapabilityActivationRecord } from '../../../src/kernel/bootstrap/capability-record.js';
import { allUnknownSignals, confirmation } from '../helpers/bootstrap-fixtures.js';

const fixturesRoot = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const index = loadCapabilityIndex();

function fixtureDir(relativePath: string): string {
  return `${fixturesRoot}${relativePath}`;
}

describe('validateProjectState — valid scenario families', () => {
  it.each([
    'scenario-a-research-only',
    'scenario-b-software-ui',
    'scenario-c-external-action',
    'scenario-d-persistent',
  ])('validates %s as structurally and referentially valid', (scenario) => {
    const result = validateProjectState(fixtureDir(scenario), index);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});

describe('validateProjectState — Initiative 11 authority-evidence warning', () => {
  it('exposes owner-authorization-unproven for scenario-c-external-action while remaining valid', () => {
    const result = validateProjectState(fixtureDir('scenario-c-external-action'), index);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven', severity: 'warning' }),
    );
  });
});

describe('validateProjectState — referential integrity failures', () => {
  it('flags an unknown Capability Bundle ID', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/unknown-bundle'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'unknown-bundle-id' }),
    );
  });

  it('flags an unknown Atomic Capability ID', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/unknown-capability'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'unknown-capability-id' }),
    );
  });

  it('flags duplicate Work Item and Owner Approval Artifact IDs', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/duplicate-ids'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'duplicate-work-item-id' }),
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'duplicate-approval-id' }),
    );
  });

  it('flags a pending_approval_reference that resolves to nothing', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/missing-approval-target'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'broken-approval-reference' }),
    );
  });

  it('flags an approval related_work_item_id that resolves to nothing', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/approval-references-missing-work-item'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'broken-work-item-reference' }),
    );
  });

  it('flags an approval that resolves but names a different Work Item than the one pointing to it', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/work-item-approval-mismatch'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'approval-work-item-mismatch' }),
    );
  });

  it('flags a Seed version disagreement across project artifacts', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/seed-mismatch'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'seed-version-mismatch' }),
    );
  });
});

describe('validateProjectState — Bootstrap Ready structural failure', () => {
  it('flags bootstrap.ready=true with no next_governed_action', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/bootstrap-structural-failure'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'bootstrap-ready-without-next-action' }),
    );
  });
});

describe('validateProjectState — mechanically checkable contradictions', () => {
  it('flags a Work Item marked complete that still declares a blocker', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/contradictory-complete-but-blocked'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'complete-item-still-blocked' }),
    );
  });

  it('flags a not-applicable capability used as a Work Item’s active_capability', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/contradictory-not-applicable-active-capability'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'not-applicable-active-capability' }),
    );
  });

  it('flags a Work Item marked complete whose validation_state is not "passed"', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/contradictory-complete-but-unvalidated'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'complete-item-validation-not-passed' }),
    );
  });

  it('does not flag complete-item-validation-not-passed when validation_state is already "passed"', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/contradictory-complete-but-blocked'),
      index,
    );
    expect(result.errors).not.toContainEqual(
      expect.objectContaining({ code: 'complete-item-validation-not-passed' }),
    );
  });

  it('does not flag complete-item-validation-not-passed for a non-complete Work Item', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/contradictory-not-applicable-active-capability'),
      index,
    );
    expect(result.errors).not.toContainEqual(
      expect.objectContaining({ code: 'complete-item-validation-not-passed' }),
    );
  });

  it('flags a required capability whose owning bundle is marked not relevant', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/bundle-membership-contradiction'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'bundle-membership-contradiction' }),
    );
  });
});

describe('validateProjectState — missing project state', () => {
  it('reports missing-project-profile and missing-capability-activation-record for a directory with neither', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/not-a-project-directory'),
      index,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'missing-project-profile' }),
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'missing-capability-activation-record' }),
    );
  });
});

describe('validateProjectState — Initiative 14 Seed Snapshot Integrity warning', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function materializeScratchProject(): string {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'aiom-seed-snapshot-validate-'));
    tempDirs.push(projectDir);

    const profile = buildCandidateProfile({
      profile: {
        projectName: 'Seed Snapshot Integrity Fixture',
        projectIntent: 'Prove Seed Snapshot Integrity composes into validateProjectState.',
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

    const materialized = materializeProjectState(projectDir, {
      profile,
      capabilityActivation,
      workItems: [],
      approvals: [],
    });
    return materialized.stateDir;
  }

  it('reports nothing for a freshly materialized project (canonical Seed, matching version)', () => {
    const stateDir = materializeScratchProject();
    const result = validateProjectState(stateDir, index);
    expect(result.valid).toBe(true);
    expect(result.warnings).not.toContainEqual(
      expect.objectContaining({ code: 'seed-snapshot-mismatch' }),
    );
  });

  it('surfaces seed-snapshot-mismatch, as a warning only, when a materialized Seed asset is hand-edited', () => {
    const stateDir = materializeScratchProject();
    writeFileSync(path.join(stateDir, 'seed', 'core.md'), 'hand-edited core guidance', 'utf8');

    const result = validateProjectState(stateDir, index);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: 'seed-snapshot-mismatch',
        severity: 'warning',
        artifact: 'seed/core.md',
      }),
    );
  });

  it('skips the comparison (no seed-snapshot-mismatch) when project Seed versions are already internally inconsistent', () => {
    const result = validateProjectState(fixtureDir('project-states/invalid/seed-mismatch'), index);
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'seed-version-mismatch' }));
    expect(result.warnings).not.toContainEqual(
      expect.objectContaining({ code: 'seed-snapshot-mismatch' }),
    );
  });

  it('skips the comparison (no seed-snapshot-mismatch) when the project profile is missing', () => {
    const result = validateProjectState(
      fixtureDir('project-states/invalid/not-a-project-directory'),
      index,
    );
    expect(result.warnings).not.toContainEqual(
      expect.objectContaining({ code: 'seed-snapshot-mismatch' }),
    );
  });
});
