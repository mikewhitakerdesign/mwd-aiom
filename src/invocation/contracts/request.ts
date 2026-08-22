import { z } from 'zod';
import { bootstrapReasoningDecisionsSchema } from './decisions.js';
import { proposedTransitionSchema, runtimeRequirementIdSchema } from './transition.js';

/**
 * The external invocation request contract (Initiative 10): one
 * discriminated union over `operation`, composed from one schema per
 * operation. `projectRoot` is always a project's root directory, never a
 * raw `.aiom/` state-directory path — src/invocation/project-context.ts
 * owns mapping a root to the state directory each operation actually
 * needs. `now`, where accepted, crosses as an ISO-8601 string (JSON has
 * no Date type) and is converted to a `Date` by the dispatch layer before
 * reaching kernel functions that expect one.
 */

const projectRootSchema = z.string().min(1);
const isoTimestampSchema = z.iso.datetime();

export const bootstrapRequestSchema = z.object({
  operation: z.literal('bootstrap'),
  projectRoot: projectRootSchema,
  ownerContext: z.string().min(1),
  lifecycleStatement: z.string().min(1).optional(),
  knownConstraints: z.array(z.string().min(1)).optional(),
  existingContext: z.array(z.string().min(1)).optional(),
  decisions: bootstrapReasoningDecisionsSchema,
  /**
   * Explicit materialization intent (Section 16 of the Bootstrap brief:
   * never write `.aiom/` merely because Bootstrap was invoked). `true`
   * maps to RunBootstrapOptions.materializeTo = projectRoot; `false`/
   * omitted leaves the call in inspect/candidate-validation mode exactly
   * as runBootstrap() already behaves when materializeTo is omitted.
   */
  materialize: z.boolean().optional().default(false),
  runtimeRequirementIds: z.array(runtimeRequirementIdSchema).optional(),
  proposedTransition: proposedTransitionSchema.optional(),
  now: isoTimestampSchema.optional(),
});
export type BootstrapRequest = z.infer<typeof bootstrapRequestSchema>;

export const validateRequestSchema = z.object({
  operation: z.literal('validate'),
  projectRoot: projectRootSchema,
});
export type ValidateRequest = z.infer<typeof validateRequestSchema>;

export const transitionRequestSchema = z.object({
  operation: z.literal('transition'),
  projectRoot: projectRootSchema,
  transition: proposedTransitionSchema,
  runtimeRequirementIds: z.array(runtimeRequirementIdSchema).optional(),
  now: isoTimestampSchema.optional(),
});
export type TransitionRequest = z.infer<typeof transitionRequestSchema>;

export const orchestrateRequestSchema = z.object({
  operation: z.literal('orchestrate'),
  projectRoot: projectRootSchema,
  transition: proposedTransitionSchema,
  runtimeRequirementIds: z.array(runtimeRequirementIdSchema).optional(),
  now: isoTimestampSchema.optional(),
});
export type OrchestrateRequest = z.infer<typeof orchestrateRequestSchema>;

export const invocationRequestSchema = z.discriminatedUnion('operation', [
  bootstrapRequestSchema,
  validateRequestSchema,
  transitionRequestSchema,
  orchestrateRequestSchema,
]);
export type InvocationRequest = z.infer<typeof invocationRequestSchema>;

export type InvocationOperation = InvocationRequest['operation'];
