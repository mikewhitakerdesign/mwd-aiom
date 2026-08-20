import { describe, expect, it } from 'vitest';
import { parseYamlDocument } from '../../../src/kernel/parsing/yaml.js';
import { readFixture } from '../helpers/fixtures.js';

describe('parseYamlDocument', () => {
  it('parses a well-formed YAML document', () => {
    const result = parseYamlDocument('a: 1\nb: two\n');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ a: 1, b: 'two' });
    }
  });

  it('returns a structural error for malformed YAML', () => {
    const result = parseYamlDocument(readFixture('invalid/malformed-yaml.yaml'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/invalid YAML/);
    }
  });
});
