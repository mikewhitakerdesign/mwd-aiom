import { describe, expect, it } from 'vitest';
import { buildFirstWorkItem } from '../../../src/kernel/bootstrap/work-item.js';

describe('buildFirstWorkItem', () => {
  it('builds a schema-conformant Work Item exactly at the stage the decision specifies', () => {
    const now = new Date('2026-08-20T00:00:00Z');
    const item = buildFirstWorkItem(
      {
        id: 'clarify-scope',
        title: 'Clarify scope with the Owner',
        objective: 'Resolve the two consequence confirmations before further work proceeds.',
        stage: 'research',
        currentResponsibility: 'owner',
      },
      now,
    );
    expect(item.frontmatter.id).toBe('clarify-scope');
    expect(item.frontmatter.stage).toBe('research');
    expect(item.frontmatter.status).toBe('active');
    expect(item.frontmatter.validation_state).toBe('not-started');
    expect(item.frontmatter.blocker_state).toBe('none');
  });

  it('never defaults stage to implementation — a research-stage decision stays research', () => {
    const item = buildFirstWorkItem({
      id: 'research-first',
      title: 'Research first',
      objective: 'Investigate before building anything.',
      stage: 'research',
      currentResponsibility: 'orchestrator',
    });
    expect(item.frontmatter.stage).not.toBe('implementation');
  });

  it('defaults authority_requirement to none when the decision does not specify one', () => {
    const item = buildFirstWorkItem({
      id: 'no-authority-needed',
      title: 'A bounded task',
      objective: 'Something with no authority boundary.',
      stage: 'research',
      currentResponsibility: 'orchestrator',
    });
    expect(item.frontmatter.authority_requirement).toBe('none');
  });

  it('throws on an invalid stage rather than silently accepting it', () => {
    expect(() =>
      buildFirstWorkItem({
        id: 'bad',
        title: 'bad',
        objective: 'bad',
        // @ts-expect-error -- deliberately invalid to prove the schema guard fires
        stage: 'not-a-real-stage',
        currentResponsibility: 'orchestrator',
      }),
    ).toThrow();
  });
});
