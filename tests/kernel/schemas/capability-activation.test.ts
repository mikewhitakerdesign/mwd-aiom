import { describe, expect, it } from 'vitest';
import { parseCapabilityActivationDocument } from '../../../src/kernel/documents.js';
import { capabilityActivationEntrySchema } from '../../../src/kernel/schemas/capability-activation.js';
import { readFixture } from '../helpers/fixtures.js';

describe('Capability Activation Record', () => {
  it.each([
    'scenario-a-research-only/capabilities.yaml',
    'scenario-b-software-ui/capabilities.yaml',
    'scenario-c-external-action/capabilities.yaml',
    'scenario-d-persistent/capabilities.yaml',
  ])('parses and validates %s', (relativePath) => {
    const result = parseCapabilityActivationDocument(readFixture(relativePath));
    expect(result.ok).toBe(true);
  });

  it('parses and validates the Seed template', () => {
    const result = parseCapabilityActivationDocument(
      readFixture('../../seed/templates/capabilities.yaml'),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects a record with a duplicate capability_id', () => {
    const result = parseCapabilityActivationDocument(
      readFixture('invalid/capabilities-duplicate-id.yaml'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/duplicate capability_id/);
    }
  });

  it('rejects a status value that encodes authorization rather than activation', () => {
    const result = parseCapabilityActivationDocument(
      readFixture('invalid/capabilities-bad-status.yaml'),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/status/);
    }
  });

  it.each([
    'required',
    'recommended',
    'on-demand',
    'not-applicable',
    'deferred',
  ] as const)('accepts activation status "%s"', (status) => {
    const result = capabilityActivationEntrySchema.safeParse({
      capability_id: 'research-discovery',
      status,
      provenance: 'owner-confirmed',
    });
    expect(result.success).toBe(true);
  });

  it('distinguishes deferred (unresolved) from not-applicable', () => {
    const deferred = capabilityActivationEntrySchema.parse({
      capability_id: 'research-discovery',
      status: 'deferred',
      provenance: 'unknown',
    });
    const notApplicable = capabilityActivationEntrySchema.parse({
      capability_id: 'research-discovery',
      status: 'not-applicable',
      provenance: 'owner-confirmed',
    });
    expect(deferred.status).not.toBe(notApplicable.status);
  });

  it('requires provenance on a capability activation entry', () => {
    const result = capabilityActivationEntrySchema.safeParse({
      capability_id: 'research-discovery',
      status: 'required',
    });
    expect(result.success).toBe(false);
  });
});
