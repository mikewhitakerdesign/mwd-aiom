import { z } from 'zod';
import { provenanceSchema, seedVersionSchema, stableIdSchema } from './common.js';

/**
 * Bundle relevance is intentionally lighter-weight than capability
 * activation: a bundle is never itself activated, authorized, or made
 * runtime-available (see seed/capabilities/README.md), so a "not-applicable"
 * state would carry no meaning distinct from "false" at this level, and
 * provenance is optional rather than required.
 */
export const bundleRelevanceEntrySchema = z.object({
  bundle_id: stableIdSchema,
  relevant: z.enum(['true', 'false', 'unknown']),
  rationale: z.string().min(1).optional(),
  evidence: z.string().min(1).optional(),
  provenance: provenanceSchema.optional(),
});
export type BundleRelevanceEntry = z.infer<typeof bundleRelevanceEntrySchema>;

/**
 * Activation status never encodes authorization: `required` /
 * `recommended` / `on-demand` / `deferred` describe whether a capability is
 * turned on for this project, not whether a specific use of it has been
 * authorized by the Owner — see
 * seed/capabilities/README.md#relevance-activation-runtime-availability-and-authorization-are-distinct.
 */
export const capabilityActivationStatusSchema = z.enum([
  'required',
  'recommended',
  'on-demand',
  'not-applicable',
  'deferred',
]);

export const capabilityActivationEntrySchema = z.object({
  capability_id: stableIdSchema,
  status: capabilityActivationStatusSchema,
  provenance: provenanceSchema,
  rationale: z.string().min(1).optional(),
  evidence: z.string().min(1).optional(),
  reconsideration_trigger: z.string().min(1).optional(),
  runtime_requirement_reference: z.string().min(1).optional(),
  standards_gates: z.array(z.string().min(1)).optional(),
});
export type CapabilityActivationEntry = z.infer<
  typeof capabilityActivationEntrySchema
>;

export const capabilityActivationRecordSchema = z
  .object({
    seed_version: seedVersionSchema,
    bundles: z.array(bundleRelevanceEntrySchema),
    capabilities: z.array(capabilityActivationEntrySchema),
  })
  .superRefine((record, ctx) => {
    const bundleIds = new Set<string>();
    record.bundles.forEach((bundle, index) => {
      if (bundleIds.has(bundle.bundle_id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate bundle_id: ${bundle.bundle_id}`,
          path: ['bundles', index, 'bundle_id'],
        });
      }
      bundleIds.add(bundle.bundle_id);
    });

    const capabilityIds = new Set<string>();
    record.capabilities.forEach((capability, index) => {
      if (capabilityIds.has(capability.capability_id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate capability_id: ${capability.capability_id}`,
          path: ['capabilities', index, 'capability_id'],
        });
      }
      capabilityIds.add(capability.capability_id);
    });
  });
export type CapabilityActivationRecord = z.infer<
  typeof capabilityActivationRecordSchema
>;
