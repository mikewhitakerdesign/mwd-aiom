import { describe, expect, it } from 'vitest';
import { parseGovernedWorkItemDocument } from '../../../src/kernel/documents.js';
import { readFixture } from '../helpers/fixtures.js';

describe('Governed Work Item', () => {
  it.each([
    'scenario-b-software-ui/work-item.md',
    'scenario-c-external-action/work-item.md',
    'scenario-d-persistent/work-item.md',
  ])('parses and validates %s', (relativePath) => {
    const result = parseGovernedWorkItemDocument(readFixture(relativePath));
    expect(result.ok).toBe(true);
  });

  it('parses and validates the Seed template', () => {
    const result = parseGovernedWorkItemDocument(
      readFixture('../../seed/templates/work-item.md'),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects a blocked item with no blocker_reason', () => {
    const result = parseGovernedWorkItemDocument(
      readFixture('invalid/work-item-blocked-without-reason.md'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/blocker_reason/);
    }
  });

  it('represents resumable state without an active blocker (Scenario D)', () => {
    const result = parseGovernedWorkItemDocument(
      readFixture('scenario-d-persistent/work-item.md'),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.frontmatter.status).toBe('resumable');
      expect(result.data.frontmatter.blocker_state).toBe('none');
      expect(result.data.frontmatter.next_permitted_transition).toBeTruthy();
    }
  });

  it('represents an item pending Owner approval without status implying authorization (Scenario C)', () => {
    const result = parseGovernedWorkItemDocument(
      readFixture('scenario-c-external-action/work-item.md'),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.frontmatter.status).toBe('pending-approval');
      expect(result.data.frontmatter.authority_requirement).toBe(
        'owner-authorization-required',
      );
      expect(result.data.frontmatter.pending_approval_reference).toBe(
        'appr-release-post',
      );
    }
  });
});
