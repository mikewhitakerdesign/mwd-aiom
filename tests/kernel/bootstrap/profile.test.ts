import { describe, expect, it } from 'vitest';
import { buildCandidateProfile, type ProfileBuildInput } from '../../../src/kernel/bootstrap/profile.js';
import { allUnknownSignals, confirmation } from '../helpers/bootstrap-fixtures.js';

function baseInput(overrides: Partial<ProfileBuildInput> = {}): ProfileBuildInput {
  return {
    profile: {
      projectName: 'Neighborhood Running Club',
      projectIntent: 'A small website for a local running club.',
      ownerIdentity: 'Jordan',
      existingStateAssessmentPerformed: false,
      lifecyclePosition: 'not-yet-assessed',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('unresolved'),
        sensitive_or_high_consequence_data: confirmation('unresolved'),
      },
    },
    unresolvedItems: [],
    bootstrapReady: false,
    nextGovernedAction: 'Clarify scope with the Owner.',
    ...overrides,
  };
}

describe('buildCandidateProfile', () => {
  it('assembles a schema-conformant profile from reasoning decisions', () => {
    const now = new Date('2026-08-20T00:00:00Z');
    const profile = buildCandidateProfile(baseInput(), now);
    expect(profile.frontmatter.project.name).toBe('Neighborhood Running Club');
    expect(profile.frontmatter.owner.identity).toBe('Jordan');
    expect(profile.frontmatter.seed_version).toBe('0.1');
    expect(profile.frontmatter.bootstrap.next_governed_action).toBe('Clarify scope with the Owner.');
  });

  it('records existing_state_assessment.performed_at only when performed is true', () => {
    const now = new Date('2026-08-20T00:00:00Z');
    const notPerformed = buildCandidateProfile(baseInput(), now);
    expect(notPerformed.frontmatter.existing_state_assessment.performed_at).toBeUndefined();

    const performed = buildCandidateProfile(
      baseInput({
        profile: { ...baseInput().profile, existingStateAssessmentPerformed: true },
      }),
      now,
    );
    expect(performed.frontmatter.existing_state_assessment.performed_at).toBe(now.toISOString());
  });

  it('never resolves a consequence confirmation away from unresolved on non-Owner provenance', () => {
    const input = baseInput({
      profile: {
        ...baseInput().profile,
        consequenceConfirmations: {
          consequential_external_action: confirmation('yes', 'ai-inferred', 'looks likely'),
          sensitive_or_high_consequence_data: confirmation('no', 'directly-inspected'),
        },
      },
    });

    const profile = buildCandidateProfile(input);
    expect(profile.frontmatter.consequence_confirmations.consequential_external_action.value).toBe(
      'unresolved',
    );
    expect(profile.frontmatter.consequence_confirmations.sensitive_or_high_consequence_data.value).toBe(
      'unresolved',
    );
    expect(profile.frontmatter.bootstrap.unresolved_items?.length).toBeGreaterThan(0);
  });

  it('accepts a consequence confirmation resolved by owner-stated or owner-confirmed provenance', () => {
    const input = baseInput({
      profile: {
        ...baseInput().profile,
        consequenceConfirmations: {
          consequential_external_action: confirmation('no', 'owner-confirmed'),
          sensitive_or_high_consequence_data: confirmation('no', 'owner-stated'),
        },
      },
    });

    const profile = buildCandidateProfile(input);
    expect(profile.frontmatter.consequence_confirmations.consequential_external_action.value).toBe('no');
    expect(profile.frontmatter.consequence_confirmations.sensitive_or_high_consequence_data.value).toBe(
      'no',
    );
    expect(profile.frontmatter.bootstrap.unresolved_items).toBeUndefined();
  });

  it('does not itself force bootstrap.ready to false when the guardrail overrides a confirmation — that is the validator role, not this construction step', () => {
    const input = baseInput({
      profile: {
        ...baseInput().profile,
        consequenceConfirmations: {
          consequential_external_action: confirmation('yes', 'ai-inferred'),
          sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
        },
      },
      bootstrapReady: true,
    });

    const profile = buildCandidateProfile(input);
    expect(profile.frontmatter.bootstrap.ready).toBe(true);
    expect(profile.frontmatter.consequence_confirmations.consequential_external_action.value).toBe(
      'unresolved',
    );
  });

  it('throws on a structurally invalid signal value rather than silently accepting it', () => {
    const input = baseInput({
      profile: {
        ...baseInput().profile,
        signals: {
          ...allUnknownSignals(),
          // @ts-expect-error -- deliberately invalid to prove the schema guard fires
          repository_backed: { value: 'maybe', provenance: 'unknown' },
        },
      },
    });

    expect(() => buildCandidateProfile(input)).toThrow();
  });

  it('deduplicates unresolved items supplied by the reasoning decision and the guardrail', () => {
    const note = 'Owner confirmation needed: will this project handle sensitive/private/high-consequence data? (an attempted non-Owner resolution was not accepted)';
    const input = baseInput({
      unresolvedItems: [note],
      profile: {
        ...baseInput().profile,
        consequenceConfirmations: {
          consequential_external_action: confirmation('no', 'owner-confirmed'),
          sensitive_or_high_consequence_data: confirmation('yes', 'ai-inferred'),
        },
      },
    });

    const profile = buildCandidateProfile(input);
    const occurrences = (profile.frontmatter.bootstrap.unresolved_items ?? []).filter(
      (item) => item === note,
    );
    expect(occurrences).toHaveLength(1);
  });
});
