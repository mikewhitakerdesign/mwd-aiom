import { runBootstrap } from '../kernel/bootstrap/bootstrap.js';
import { validateProjectState } from '../kernel/validation/validate-project.js';
import { evaluateTransition } from '../kernel/transition/gate.js';
import { orchestrate } from '../kernel/orchestration/orchestrate.js';
import { loadCapabilityIndex } from '../kernel/validation/capability-index.js';
import { createNodeRuntimeAdapter } from '../kernel/runtime/adapters/node.js';
import {
  invocationRequestSchema,
  type BootstrapRequest,
  type InvocationOperation,
  type InvocationRequest,
  type OrchestrateRequest,
  type TransitionRequest,
  type ValidateRequest,
} from './contracts/request.js';
import { errorResponse, successResponse, type InvocationResponse } from './contracts/response.js';
import { resolveProjectContext } from './project-context.js';
import { composeRuntimeEvidence } from './runtime-evidence.js';
import { malformedRequestError, toInvocationError } from './errors.js';
import { resolveRuntimeVersion } from './version.js';

/**
 * The single public entry point of the Runtime Invocation Layer
 * (Initiative 10): validates an arbitrary external payload against the
 * invocation request contract, dispatches to exactly one of the four
 * supported kernel operations, and returns a structured InvocationResponse
 * — never a thrown exception. This is the one function both the CLI
 * (src/cli/main.ts) and any future transport (MCP, CI, another agent) are
 * expected to call; neither the CLI nor this function interpret free-form
 * Owner intent or construct Bootstrap reasoning — `request` must already
 * carry fully-formed structured decisions.
 */
export function invoke(rawRequest: unknown): InvocationResponse {
  const version = resolveRuntimeVersion();
  const parsed = invocationRequestSchema.safeParse(rawRequest);
  if (!parsed.success) {
    return errorResponse(version, extractOperationHint(rawRequest), malformedRequestError(parsed.error));
  }

  const request = parsed.data;
  try {
    return dispatch(request, version);
  } catch (err) {
    return errorResponse(version, request.operation, toInvocationError(err));
  }
}

function dispatch(request: InvocationRequest, version: string): InvocationResponse {
  switch (request.operation) {
    case 'bootstrap':
      return dispatchBootstrap(request, version);
    case 'validate':
      return dispatchValidate(request, version);
    case 'transition':
      return dispatchTransition(request, version);
    case 'orchestrate':
      return dispatchOrchestrate(request, version);
  }
}

function resolveNow(now: string | undefined): Date {
  return now ? new Date(now) : new Date();
}

function dispatchBootstrap(request: BootstrapRequest, version: string): InvocationResponse {
  const now = resolveNow(request.now);
  const { projectRoot } = resolveProjectContext(request.projectRoot);
  const hasRuntimeRequirements = !!request.runtimeRequirementIds && request.runtimeRequirementIds.length > 0;
  const runtimeAdapter = hasRuntimeRequirements ? createNodeRuntimeAdapter({ cwd: projectRoot }) : undefined;

  const result = runBootstrap(
    {
      ownerContext: request.ownerContext,
      projectPath: projectRoot,
      lifecycleStatement: request.lifecycleStatement,
      knownConstraints: request.knownConstraints,
      existingContext: request.existingContext,
    },
    request.decisions,
    {
      materializeTo: request.materialize ? projectRoot : undefined,
      runtimeAdapter,
      runtimeRequirementIds: request.runtimeRequirementIds,
      proposedTransition: request.proposedTransition,
      now,
    },
  );
  return successResponse(version, 'bootstrap', result);
}

function dispatchValidate(request: ValidateRequest, version: string): InvocationResponse {
  const { stateDir } = resolveProjectContext(request.projectRoot);
  const result = validateProjectState(stateDir);
  return successResponse(version, 'validate', result);
}

function dispatchTransition(request: TransitionRequest, version: string): InvocationResponse {
  const now = resolveNow(request.now);
  const { projectRoot, stateDir } = resolveProjectContext(request.projectRoot);
  const index = loadCapabilityIndex();
  const runtimeEvidence = composeRuntimeEvidence(projectRoot, request.runtimeRequirementIds, now);
  const result = evaluateTransition(stateDir, request.transition, index, now, runtimeEvidence);
  return successResponse(version, 'transition', result);
}

function dispatchOrchestrate(request: OrchestrateRequest, version: string): InvocationResponse {
  const now = resolveNow(request.now);
  const { projectRoot, stateDir } = resolveProjectContext(request.projectRoot);
  const runtimeEvidence = composeRuntimeEvidence(projectRoot, request.runtimeRequirementIds, now);
  const result = orchestrate(stateDir, request.transition, { now, runtimeEvidence });
  return successResponse(version, 'orchestrate', result);
}

const KNOWN_OPERATIONS: readonly InvocationOperation[] = ['bootstrap', 'validate', 'transition', 'orchestrate'];

function extractOperationHint(rawRequest: unknown): InvocationOperation | null {
  if (typeof rawRequest !== 'object' || rawRequest === null || !('operation' in rawRequest)) {
    return null;
  }
  const value = (rawRequest as { operation: unknown }).operation;
  return typeof value === 'string' && (KNOWN_OPERATIONS as readonly string[]).includes(value)
    ? (value as InvocationOperation)
    : null;
}
