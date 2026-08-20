import { z } from 'zod';
import {
  confirmationValueSchema,
  seedVersionSchema,
  signalValueSchema,
} from './common.js';

const existingStateAssessmentSchema = z.object({
  performed: z.boolean(),
  performed_at: z.iso.datetime().optional(),
});

const signalsSchema = z.object({
  repository_backed: signalValueSchema,
  software_producing: signalValueSchema,
  ui_bearing: signalValueSchema,
  externally_acting: signalValueSchema,
  persistent_state_dependent: signalValueSchema,
  data_sensitive: signalValueSchema,
  regulated_high_risk_possible: signalValueSchema,
  long_running_continuous: signalValueSchema,
  content_heavy_narrative_heavy: signalValueSchema,
});

const consequenceConfirmationsSchema = z.object({
  consequential_external_action: confirmationValueSchema,
  sensitive_or_high_consequence_data: confirmationValueSchema,
});

const bootstrapStateSchema = z.object({
  ready: z.boolean(),
  unresolved_items: z.array(z.string().min(1)).optional(),
  next_governed_action: z.string().min(1).optional(),
});

export const projectProfileFrontmatterSchema = z.object({
  seed_version: seedVersionSchema,
  project: z.object({
    name: z.string().min(1),
    intent: z.string().min(1),
  }),
  owner: z.object({
    identity: z.string().min(1),
  }),
  existing_state_assessment: existingStateAssessmentSchema,
  /**
   * Open-ended by design, not a fixed enum: the architecture explicitly
   * does not freeze a universal product-development lifecycle (see
   * seed/templates/README.md). A non-binding suggested vocabulary is
   * documented in the template's own comments.
   */
  lifecycle_position: z.string().min(1),
  signals: signalsSchema,
  consequence_confirmations: consequenceConfirmationsSchema,
  bootstrap: bootstrapStateSchema,
  /**
   * Stable, durable runtime requirements only (e.g. "requires
   * repository-write") — never a stale probe result. See
   * seed/templates/README.md.
   */
  runtime_requirements: z.array(z.string().min(1)).optional(),
});
export type ProjectProfileFrontmatter = z.infer<
  typeof projectProfileFrontmatterSchema
>;

export const projectProfileSchema = z.object({
  frontmatter: projectProfileFrontmatterSchema,
  body: z.string(),
});
export type ProjectProfile = z.infer<typeof projectProfileSchema>;
