import { describe, expect, it } from 'vitest';
import { ok, fail } from '../../../src/kernel/parsing/result.js';
import { validateAuthorityEvidence } from '../../../src/kernel/validation/authority.js';
import type { LoadedProjectState, LoadedDocument } from '../../../src/kernel/validation/project-state.js';
import type { GovernedWorkItem } from '../../../src/kernel/schemas/work-item.js';
import type { OwnerApprovalArtifact } from '../../../src/kernel/schemas/approval.js';

const NOW = new Date('2026-08-21T00:00:00Z');

function workItem(overrides: Partial<GovernedWorkItem['frontmatter']> = {}): GovernedWorkItem {
  return {
    body: '',
    frontmatter: {
      seed_version: '0.1',
      id: 'fixture-work-item',
      title: 'Fixture Work Item',
      objective: 'Exercise authority-evidence validation.',
      status: 'pending-approval',
      stage: 'approval',
      authority_requirement: 'owner-authorization-required',
      validation_state: 'passed',
      blocker_state: 'none',
      current_responsibility: 'owner',
      ...overrides,
    },
  };
}

function approval(overrides: Partial<OwnerApprovalArtifact> = {}): OwnerApprovalArtifact {
  return {
    seed_version: '0.1',
    id: 'fixture-approval',
    related_work_item_id: 'fixture-work-item',
    target_context: 'fixture context',
    requested_decision: 'fixture decision',
    mode: 'one-time',
    scope: 'fixture scope',
    owner: 'Fixture Owner',
    status: 'pending',
    provenance: 'workflow-discovered',
    ...overrides,
  };
}

function state(
  workItems: readonly LoadedDocument<GovernedWorkItem>[],
  approvals: readonly LoadedDocument<OwnerApprovalArtifact>[] = [],
): LoadedProjectState {
  return {
    dir: 'fixture',
    profile: undefined,
    capabilityActivation: undefined,
    workItems,
    approvals,
  };
}

function loaded<T>(path: string, data: T): LoadedDocument<T> {
  return { path, result: ok(data) };
}

describe('validateAuthorityEvidence', () => {
  it('warns when owner-authorization-required has no bound approval at all', () => {
    const issues = validateAuthorityEvidence(
      state([loaded('work-item.md', workItem())]),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'owner-authorization-unproven',
        severity: 'warning',
        artifact: 'work-item.md',
      }),
    );
  });

  it('warns when the only bound approval is pending', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [loaded('approval.yaml', approval({ status: 'pending' }))],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });

  it('warns when the only bound approval is denied', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [
          loaded(
            'approval.yaml',
            approval({ status: 'denied', decision_at: '2026-08-01T00:00:00Z' }),
          ),
        ],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });

  it('warns when the only bound approval is expired (status)', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [loaded('approval.yaml', approval({ status: 'expired' }))],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });

  it('warns when the only bound approval is superseded', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [loaded('approval.yaml', approval({ status: 'superseded' }))],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });

  it('warns when the only bound approval is approved but its expiration has lapsed', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [
          loaded(
            'approval.yaml',
            approval({
              status: 'approved',
              decision_at: '2026-08-01T00:00:00Z',
              expiration: '2026-08-10T00:00:00Z',
            }),
          ),
        ],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });

  it('does not warn for an approved, unexpired, correctly bound approval', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [
          loaded(
            'approval.yaml',
            approval({
              status: 'approved',
              decision_at: '2026-08-01T00:00:00Z',
              expiration: '2026-09-01T00:00:00Z',
            }),
          ),
        ],
      ),
      NOW,
    );
    expect(issues).toEqual([]);
  });

  it('does not warn for an approved, correctly bound approval with no expiration at all', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [loaded('approval.yaml', approval({ status: 'approved', decision_at: '2026-08-01T00:00:00Z' }))],
      ),
      NOW,
    );
    expect(issues).toEqual([]);
  });

  it('does not warn when multiple approvals exist and at least one qualifies', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [
          loaded('approval-1.yaml', approval({ id: 'appr-1', status: 'pending' })),
          loaded(
            'approval-2.yaml',
            approval({
              id: 'appr-2',
              status: 'approved',
              decision_at: '2026-08-01T00:00:00Z',
              expiration: '2026-09-01T00:00:00Z',
            }),
          ),
        ],
      ),
      NOW,
    );
    expect(issues).toEqual([]);
  });

  it('ignores an approval bound to a different work item', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [
          loaded(
            'approval.yaml',
            approval({
              related_work_item_id: 'some-other-item',
              status: 'approved',
              decision_at: '2026-08-01T00:00:00Z',
            }),
          ),
        ],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });

  it('does not evaluate a work item with authority_requirement "none"', () => {
    const issues = validateAuthorityEvidence(
      state([loaded('work-item.md', workItem({ authority_requirement: 'none' }))]),
      NOW,
    );
    expect(issues).toEqual([]);
  });

  it('does not evaluate a work item with authority_requirement "owner-authorization-satisfied"', () => {
    const issues = validateAuthorityEvidence(
      state([
        loaded(
          'work-item.md',
          workItem({ authority_requirement: 'owner-authorization-satisfied' }),
        ),
      ]),
      NOW,
    );
    expect(issues).toEqual([]);
  });

  it('ignores a work item that failed to parse', () => {
    const issues = validateAuthorityEvidence(
      state([{ path: 'work-item.md', result: fail('schema validation failed') }]),
      NOW,
    );
    expect(issues).toEqual([]);
  });

  it('ignores a malformed approval when deciding whether evidence is sufficient', () => {
    const issues = validateAuthorityEvidence(
      state(
        [loaded('work-item.md', workItem())],
        [{ path: 'approval.yaml', result: fail('schema validation failed') }],
      ),
      NOW,
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: 'owner-authorization-unproven' }),
    );
  });
});
