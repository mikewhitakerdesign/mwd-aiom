import { describe, expect, it } from 'vitest';
import { validateBootstrapReadiness } from '../../../src/kernel/validation/bootstrap.js';
import type { ProjectProfile } from '../../../src/kernel/schemas/project-profile.js';

function baseProfile(overrides: Partial<ProjectProfile['frontmatter']> = {}): ProjectProfile {
  const signal = { value: 'unknown' as const, provenance: 'unknown' as const };
  return {
    body: '',
    frontmatter: {
      seed_version: '0.1',
      project: { name: 'Fixture', intent: 'Testing bootstrap readiness rules.' },
      owner: { identity: 'Test Owner' },
      existing_state_assessment: { performed: true },
      lifecycle_position: 'active-development',
      signals: {
        repository_backed: signal,
        software_producing: signal,
        ui_bearing: signal,
        externally_acting: signal,
        persistent_state_dependent: signal,
        data_sensitive: signal,
        regulated_high_risk_possible: signal,
        long_running_continuous: signal,
        content_heavy_narrative_heavy: signal,
      },
      consequence_confirmations: {
        consequential_external_action: { value: 'no', provenance: 'owner-confirmed' },
        sensitive_or_high_consequence_data: { value: 'no', provenance: 'owner-confirmed' },
      },
      bootstrap: { ready: false, unresolved_items: ['placeholder'] },
      ...overrides,
    },
  };
}

describe('validateBootstrapReadiness', () => {
  it('passes a fully consistent ready=true profile with no issues', () => {
    const profile = baseProfile({
      bootstrap: { ready: true, next_governed_action: 'Begin implementation.' },
    });
    expect(validateBootstrapReadiness(profile, 'profile.md')).toEqual([]);
  });

  it('passes a ready=false profile that records unresolved_items', () => {
    const profile = baseProfile();
    expect(validateBootstrapReadiness(profile, 'profile.md')).toEqual([]);
  });

  it('warns when ready=false with no unresolved_items represented', () => {
    const profile = baseProfile({ bootstrap: { ready: false } });
    const issues = validateBootstrapReadiness(profile, 'profile.md');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'bootstrap-not-ready-no-unresolved-items',
      severity: 'warning',
    });
  });

  it('fails when ready=true but existing_state_assessment.performed is false', () => {
    const profile = baseProfile({
      existing_state_assessment: { performed: false },
      bootstrap: { ready: true, next_governed_action: 'Begin implementation.' },
    });
    const issues = validateBootstrapReadiness(profile, 'profile.md');
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'bootstrap-ready-without-assessment',
        severity: 'error',
      }),
    );
  });

  it('fails when ready=true but consequential_external_action is unresolved', () => {
    const profile = baseProfile({
      consequence_confirmations: {
        consequential_external_action: { value: 'unresolved', provenance: 'unknown' },
        sensitive_or_high_consequence_data: { value: 'no', provenance: 'owner-confirmed' },
      },
      bootstrap: { ready: true, next_governed_action: 'Begin implementation.' },
    });
    const issues = validateBootstrapReadiness(profile, 'profile.md');
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'bootstrap-ready-with-unresolved-confirmation',
        path: 'consequence_confirmations.consequential_external_action.value',
      }),
    );
  });

  it('fails when ready=true but sensitive_or_high_consequence_data is unresolved', () => {
    const profile = baseProfile({
      consequence_confirmations: {
        consequential_external_action: { value: 'no', provenance: 'owner-confirmed' },
        sensitive_or_high_consequence_data: { value: 'unresolved', provenance: 'unknown' },
      },
      bootstrap: { ready: true, next_governed_action: 'Begin implementation.' },
    });
    const issues = validateBootstrapReadiness(profile, 'profile.md');
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'bootstrap-ready-with-unresolved-confirmation',
        path: 'consequence_confirmations.sensitive_or_high_consequence_data.value',
      }),
    );
  });

  it('fails when ready=true but no next_governed_action is represented', () => {
    const profile = baseProfile({ bootstrap: { ready: true } });
    const issues = validateBootstrapReadiness(profile, 'profile.md');
    expect(issues).toContainEqual(
      expect.objectContaining({
        code: 'bootstrap-ready-without-next-action',
        severity: 'error',
      }),
    );
  });
});
