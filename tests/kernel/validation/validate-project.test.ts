import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import { validateProjectState } from '../../../src/kernel/validation/validate-project.js';

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
