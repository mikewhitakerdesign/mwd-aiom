import { describe, expect, it } from 'vitest';
import {
  parseCapabilityActivationDocument,
  parseGovernedWorkItemDocument,
  parseOwnerApprovalDocument,
  parseProjectProfileDocument,
  serializeCapabilityActivationDocument,
  serializeGovernedWorkItemDocument,
  serializeOwnerApprovalDocument,
  serializeProjectProfileDocument,
} from '../../src/kernel/documents.js';
import { buildCandidateProfile } from '../../src/kernel/bootstrap/profile.js';
import { buildCapabilityActivationRecord } from '../../src/kernel/bootstrap/capability-record.js';
import { buildFirstWorkItem } from '../../src/kernel/bootstrap/work-item.js';
import { buildApprovalRequest } from '../../src/kernel/bootstrap/approval.js';
import { allUnknownSignals, confirmation } from './helpers/bootstrap-fixtures.js';

/**
 * Round-trip proof for Initiative 8's new write-side of the parsing layer:
 * parse(serialize(x)) must reproduce x exactly, or Bootstrap's materialized
 * artifacts would silently drift from what it thinks it wrote.
 */

describe('document serialize/parse round-trip', () => {
  it('Project Profile', () => {
    const profile = buildCandidateProfile(
      {
        profile: {
          projectName: 'Round Trip Co',
          projectIntent: 'Prove serialize/parse symmetry.',
          ownerIdentity: 'Sam',
          existingStateAssessmentPerformed: true,
          lifecyclePosition: 'active-development',
          signals: {
            ...allUnknownSignals(),
            software_producing: { value: 'true', provenance: 'owner-confirmed', rationale: 'it is software' },
          },
          consequenceConfirmations: {
            consequential_external_action: confirmation('no', 'owner-confirmed'),
            sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
          },
          contextNarrative: 'Some context prose.',
        },
        unresolvedItems: [],
        bootstrapReady: true,
        nextGovernedAction: 'Begin implementation planning.',
      },
      new Date('2026-08-20T00:00:00Z'),
    );

    const serialized = serializeProjectProfileDocument(profile);
    const parsed = parseProjectProfileDocument(serialized);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data).toEqual(profile);
    }
  });

  it('Capability Activation Record', () => {
    const record = buildCapabilityActivationRecord(
      [{ bundleId: 'content-publication', relevant: 'true', rationale: 'x' }],
      [{ capabilityId: 'research-discovery', status: 'required', provenance: 'owner-confirmed' }],
    );
    const serialized = serializeCapabilityActivationDocument(record);
    const parsed = parseCapabilityActivationDocument(serialized);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data).toEqual(record);
    }
  });

  it('Governed Work Item', () => {
    const item = buildFirstWorkItem(
      {
        id: 'round-trip-item',
        title: 'Round trip item',
        objective: 'Prove serialize/parse symmetry for a Work Item.',
        stage: 'research',
        currentResponsibility: 'orchestrator',
        objectiveNarrative: 'Elaboration.',
        contextNarrative: 'Why this exists.',
      },
      new Date('2026-08-20T00:00:00Z'),
    );
    const serialized = serializeGovernedWorkItemDocument(item);
    const parsed = parseGovernedWorkItemDocument(serialized);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data).toEqual(item);
    }
  });

  it('Owner Approval Artifact', () => {
    const approval = buildApprovalRequest({
      id: 'round-trip-approval',
      relatedWorkItemId: 'round-trip-item',
      targetContext: 'x',
      requestedDecision: 'y',
      scope: 'z',
      ownerIdentity: 'Sam',
      mode: 'one-time',
    });
    const serialized = serializeOwnerApprovalDocument(approval);
    const parsed = parseOwnerApprovalDocument(serialized);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data).toEqual(approval);
    }
  });
});
