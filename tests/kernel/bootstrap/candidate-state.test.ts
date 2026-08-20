import { describe, expect, it } from 'vitest';
import { buildCandidateState, validateCandidateState } from '../../../src/kernel/bootstrap/candidate-state.js';
import { buildCandidateProfile } from '../../../src/kernel/bootstrap/profile.js';
import { buildCapabilityActivationRecord } from '../../../src/kernel/bootstrap/capability-record.js';
import { loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import { allUnknownSignals, confirmation } from '../helpers/bootstrap-fixtures.js';

function readyProfile() {
  return buildCandidateProfile({
    profile: {
      projectName: 'x',
      projectIntent: 'x',
      ownerIdentity: 'x',
      existingStateAssessmentPerformed: true,
      lifecyclePosition: 'research',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('no', 'owner-confirmed'),
        sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
      },
    },
    unresolvedItems: [],
    bootstrapReady: true,
    nextGovernedAction: 'Begin research-discovery work.',
  });
}

describe('candidate state validation (in-memory, no disk I/O)', () => {
  it('validates a coherent ephemeral candidate state as valid, with no filesystem access', () => {
    const profile = readyProfile();
    const capabilityActivation = buildCapabilityActivationRecord(
      [{ bundleId: 'content-publication', relevant: 'true' }],
      [{ capabilityId: 'research-discovery', status: 'required', provenance: 'owner-confirmed' }],
    );
    const state = buildCandidateState({ profile, capabilityActivation, workItems: [], approvals: [] });
    const result = validateCandidateState(state, loadCapabilityIndex());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reuses validateBootstrapReadiness: bootstrap.ready true with an unresolved confirmation is structurally invalid', () => {
    const profile = buildCandidateProfile({
      profile: {
        projectName: 'x',
        projectIntent: 'x',
        ownerIdentity: 'x',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'research',
        signals: allUnknownSignals(),
        consequenceConfirmations: {
          consequential_external_action: confirmation('unresolved'),
          sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
        },
      },
      unresolvedItems: ['unresolved on purpose'],
      bootstrapReady: true,
      nextGovernedAction: 'x',
    });
    const capabilityActivation = buildCapabilityActivationRecord([], []);
    const state = buildCandidateState({ profile, capabilityActivation, workItems: [], approvals: [] });
    const result = validateCandidateState(state, loadCapabilityIndex());
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'bootstrap-ready-with-unresolved-confirmation')).toBe(
      true,
    );
  });

  it('reuses validateReferences: an unknown capability ID surfaces as a validation error', () => {
    const profile = readyProfile();
    const capabilityActivation = buildCapabilityActivationRecord(
      [],
      [{ capabilityId: 'not-a-real-capability', status: 'deferred', provenance: 'unknown' }],
    );
    const state = buildCandidateState({ profile, capabilityActivation, workItems: [], approvals: [] });
    const result = validateCandidateState(state, loadCapabilityIndex());
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'unknown-capability-id')).toBe(true);
  });
});
