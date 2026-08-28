import { z } from 'zod';

/**
 * The AIOM Seed version a durable artifact targets, per the repository's
 * experimental v0.1 versioning convention (see AGENTS.md / README.md).
 * Not a manually maintained per-artifact revision — see
 * seed/templates/README.md for why no separate `profile_version` exists.
 */
export const seedVersionSchema = z
  .string()
  .regex(/^\d+\.\d+$/, 'seed_version must look like "0.1"');

/**
 * The Seed version Bootstrap-produced artifacts target, and the version
 * Seed Snapshot Integrity (src/kernel/validation/seed-snapshot-integrity.ts)
 * compares a project's recorded seed_version against. Lives here, not in
 * src/kernel/bootstrap/, so that both bootstrap/ and validation/ can depend
 * on it without validation/ importing from bootstrap/ (which already
 * imports from validation/ — see validate-project.ts's use from
 * bootstrap.ts). bootstrap/types.ts re-exports this unchanged.
 */
export const SEED_VERSION = '0.1';

/**
 * A stable, reference-safe identifier for a bundle, capability, work item,
 * or approval — lowercase kebab-case, matching the identifiers already used
 * in seed/capabilities/.
 */
export const stableIdSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    'must be a lowercase kebab-case identifier',
  );

/**
 * Distinguishes where a consequential fact came from, per
 * seed/safeguards.md — evidence/provenance preservation. Applied only to
 * fields where the source of truth (Owner vs. inference vs. inspection)
 * materially affects how later reasoning may rely on it.
 */
export const provenanceSchema = z.enum([
  'owner-stated',
  'owner-confirmed',
  'directly-inspected',
  'ai-inferred',
  'workflow-discovered',
  'externally-verified',
  'unknown',
]);
export type Provenance = z.infer<typeof provenanceSchema>;

/**
 * A composable Project Profile signal's value. Four states so that
 * "we don't know yet" (unknown), "no" (false), and "this concept doesn't
 * apply to this project" (not-applicable) stay distinguishable — see
 * AGENTS.md-linked architecture notes on unknown vs. not-applicable.
 */
export const signalStatusSchema = z.enum([
  'true',
  'false',
  'unknown',
  'not-applicable',
]);
export type SignalStatus = z.infer<typeof signalStatusSchema>;

export const signalValueSchema = z.object({
  value: signalStatusSchema,
  provenance: provenanceSchema,
  rationale: z.string().min(1).optional(),
});
export type SignalValue = z.infer<typeof signalValueSchema>;

/**
 * The two fixed consequence confirmations use a three-state vocabulary
 * (yes/no/unresolved), not the four-state signal vocabulary: both
 * confirmations are universally applicable to every project, so
 * "not-applicable" would never be a meaningful value for them.
 */
export const confirmationStatusSchema = z.enum(['yes', 'no', 'unresolved']);
export type ConfirmationStatus = z.infer<typeof confirmationStatusSchema>;

export const confirmationValueSchema = z.object({
  value: confirmationStatusSchema,
  provenance: provenanceSchema,
  rationale: z.string().min(1).optional(),
});
export type ConfirmationValue = z.infer<typeof confirmationValueSchema>;
