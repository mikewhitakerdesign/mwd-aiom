import { describe, expect, it } from 'vitest';
import { buildCapabilityActivationRecord } from '../../../src/kernel/bootstrap/capability-record.js';
import { validateReferences } from '../../../src/kernel/validation/references.js';
import { buildCapabilityIndex, loadCapabilityIndex } from '../../../src/kernel/validation/capability-index.js';
import { buildCandidateState } from '../../../src/kernel/bootstrap/candidate-state.js';
import { buildCandidateProfile } from '../../../src/kernel/bootstrap/profile.js';
import { allUnknownSignals, confirmation } from '../helpers/bootstrap-fixtures.js';

describe('buildCapabilityActivationRecord', () => {
  it('records bundle relevance and capability activation exactly as decided, without inferring anything itself', () => {
    const record = buildCapabilityActivationRecord(
      [{ bundleId: 'content-publication', relevant: 'true', rationale: 'output is a report' }],
      [
        {
          capabilityId: 'research-discovery',
          status: 'required',
          provenance: 'owner-confirmed',
          rationale: 'the whole task is research',
        },
      ],
    );
    expect(record.seed_version).toBe('0.1');
    expect(record.bundles).toHaveLength(1);
    expect(record.bundles[0]?.relevant).toBe('true');
    expect(record.capabilities[0]?.status).toBe('required');
  });

  it('activation status is never itself authorization: activating external-action-execution adds no authority field', () => {
    const record = buildCapabilityActivationRecord(
      [{ bundleId: 'external-action-integration', relevant: 'true' }],
      [
        {
          capabilityId: 'external-action-execution',
          status: 'required',
          provenance: 'owner-confirmed',
        },
      ],
    );
    const entry = record.capabilities[0];
    expect(entry).toBeDefined();
    expect(Object.keys(entry ?? {})).not.toContain('authorized');
    expect(Object.keys(entry ?? {})).not.toContain('authorization');
  });

  it('throws on a duplicate capability_id rather than silently keeping both entries', () => {
    expect(() =>
      buildCapabilityActivationRecord(
        [],
        [
          { capabilityId: 'research-discovery', status: 'required', provenance: 'owner-confirmed' },
          { capabilityId: 'research-discovery', status: 'deferred', provenance: 'owner-confirmed' },
        ],
      ),
    ).toThrow();
  });

  it('an unknown bundle/capability ID is not rejected by this builder — that is validateReferences\' job, reused unchanged', () => {
    const record = buildCapabilityActivationRecord(
      [{ bundleId: 'not-a-real-bundle', relevant: 'unknown' }],
      [{ capabilityId: 'not-a-real-capability', status: 'deferred', provenance: 'unknown' }],
    );
    const index = buildCapabilityIndex('', '');
    const state = buildCandidateState({
      profile: minimalValidProfile(),
      capabilityActivation: record,
      workItems: [],
      approvals: [],
    });
    const issues = validateReferences(state, loadCapabilityIndex());
    expect(issues.some((issue) => issue.code === 'unknown-bundle-id')).toBe(true);
    expect(issues.some((issue) => issue.code === 'unknown-capability-id')).toBe(true);
    void index;
  });
});

function minimalValidProfile() {
  return buildCandidateProfile({
    profile: {
      projectName: 'x',
      projectIntent: 'x',
      ownerIdentity: 'x',
      existingStateAssessmentPerformed: false,
      lifecyclePosition: 'research',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('unresolved'),
        sensitive_or_high_consequence_data: confirmation('unresolved'),
      },
    },
    unresolvedItems: [],
    bootstrapReady: false,
    nextGovernedAction: 'research',
  });
}
