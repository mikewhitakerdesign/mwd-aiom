/**
 * The Runtime Invocation Layer's public surface (Initiative 10). This is
 * the ONLY module intended for external import — package.json's
 * `exports` map points here, never at src/kernel/index.ts. A future
 * transport (MCP, CI, another AI runtime) reuses `invoke()` directly
 * instead of re-implementing request validation, project-context
 * resolution, runtime-evidence composition, dispatch, or error
 * normalization.
 */
export { invoke } from './dispatch.js';

export {
  invocationRequestSchema,
  bootstrapRequestSchema,
  validateRequestSchema,
  transitionRequestSchema,
  orchestrateRequestSchema,
  type InvocationRequest,
  type InvocationOperation,
  type BootstrapRequest,
  type ValidateRequest,
  type TransitionRequest,
  type OrchestrateRequest,
} from './contracts/request.js';

export {
  bootstrapReasoningDecisionsSchema,
  type BootstrapReasoningDecisionsInput,
} from './contracts/decisions.js';

export {
  proposedTransitionSchema,
  runtimeRequirementIdSchema,
  type ProposedTransitionInput,
} from './contracts/transition.js';

export type {
  InvocationResponse,
  InvocationSuccess,
  InvocationFailure,
  InvocationError,
  InvocationErrorCategory,
} from './contracts/response.js';

export { resolveRuntimeVersion } from './version.js';

export { resolveProjectContext, InvalidProjectRootError, type ProjectContext } from './project-context.js';
