import { describe, expect, it } from 'vitest';
import { parseFrontmatterDocument } from '../../../src/kernel/parsing/frontmatter.js';
import { readFixture } from '../helpers/fixtures.js';

describe('parseFrontmatterDocument', () => {
  it('splits well-formed frontmatter from its body', () => {
    const result = parseFrontmatterDocument(
      '---\ntitle: Example\n---\n\nBody text.\n',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.frontmatter).toEqual({ title: 'Example' });
      expect(result.data.body).toBe('Body text.');
    }
  });

  it('returns a structural error for malformed frontmatter YAML', () => {
    const result = parseFrontmatterDocument(
      readFixture('invalid/malformed-frontmatter.md'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/invalid frontmatter/);
    }
  });
});
