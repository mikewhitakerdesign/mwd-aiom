import { describe, expect, it } from 'vitest';
import { parseProjectProfileDocument } from '../../../src/kernel/documents.js';
import { projectProfileFrontmatterSchema } from '../../../src/kernel/schemas/project-profile.js';
import { readFixture } from '../helpers/fixtures.js';

describe('Project Profile', () => {
  it.each([
    'scenario-a-research-only/profile.md',
    'scenario-b-software-ui/profile.md',
    'scenario-c-external-action/profile.md',
    'scenario-d-persistent/profile.md',
  ])('parses and validates %s', (relativePath) => {
    const result = parseProjectProfileDocument(readFixture(relativePath));
    expect(result.ok).toBe(true);
  });

  it('parses and validates the Seed template', () => {
    const result = parseProjectProfileDocument(
      readFixture('../../seed/templates/project-profile.md'),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects a profile missing the required owner field', () => {
    const result = parseProjectProfileDocument(
      readFixture('invalid/profile-missing-owner.md'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/owner/);
    }
  });

  it('rejects a profile with an invalid signal enum value', () => {
    const result = parseProjectProfileDocument(
      readFixture('invalid/profile-bad-signal-enum.md'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/signals.repository_backed.value/);
    }
  });

  it('distinguishes unknown, false, and not-applicable signal values', () => {
    const base = {
      seed_version: '0.1',
      project: { name: 'x', intent: 'x' },
      owner: { identity: 'x' },
      existing_state_assessment: { performed: false },
      lifecycle_position: 'research',
      consequence_confirmations: {
        consequential_external_action: { value: 'unresolved', provenance: 'unknown' },
        sensitive_or_high_consequence_data: { value: 'unresolved', provenance: 'unknown' },
      },
      bootstrap: { ready: false },
    };

    for (const value of ['unknown', 'false', 'not-applicable'] as const) {
      const parsed = projectProfileFrontmatterSchema.safeParse({
        ...base,
        signals: {
          repository_backed: { value, provenance: 'unknown' },
          software_producing: { value, provenance: 'unknown' },
          ui_bearing: { value, provenance: 'unknown' },
          externally_acting: { value, provenance: 'unknown' },
          persistent_state_dependent: { value, provenance: 'unknown' },
          data_sensitive: { value, provenance: 'unknown' },
          regulated_high_risk_possible: { value, provenance: 'unknown' },
          long_running_continuous: { value, provenance: 'unknown' },
          content_heavy_narrative_heavy: { value, provenance: 'unknown' },
        },
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.signals.repository_backed.value).toBe(value);
      }
    }
  });

  it.each(['yes', 'no', 'unresolved'] as const)(
    'accepts consequence confirmation value "%s"',
    (value) => {
      const result = projectProfileFrontmatterSchema.shape.consequence_confirmations.safeParse(
        {
          consequential_external_action: { value, provenance: 'owner-confirmed' },
          sensitive_or_high_consequence_data: { value, provenance: 'owner-confirmed' },
        },
      );
      expect(result.success).toBe(true);
    },
  );

  it('rejects a malformed seed_version', () => {
    const result = projectProfileFrontmatterSchema.shape.seed_version.safeParse('v0.1');
    expect(result.success).toBe(false);
  });
});
