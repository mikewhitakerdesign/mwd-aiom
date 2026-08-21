import type { BootstrapResult } from '../../kernel/bootstrap/types.js';
import type { ValidationResult } from '../../kernel/validation/result.js';
import type { TransitionGateResult } from '../../kernel/transition/types.js';
import type { OrchestrationResult } from '../../kernel/orchestration/types.js';
import type { InvocationOperation } from './request.js';

/**
 * The external invocation response envelope. Kernel governance outcomes
 * (ValidationResult.valid === false, a "mechanically-blocked" Transition
 * Gate outcome, an "indeterminate"/blocked Orchestrator disposition) are
 * NOT transport failures — they are the kernel successfully producing its
 * authoritative answer, so they are carried as `status: 'ok'` with the
 * full structured kernel result attached (see each kernel result type's
 * own doc comments: none of them treat a negative/blocked outcome as
 * exceptional). `status: 'error'` means the invocation layer could not
 * produce a kernel result at all.
 */

export type InvocationErrorCategory =
  | 'cli-usage'
  | 'malformed-request'
  | 'unsupported-operation'
  | 'invalid-target'
  | 'internal';

export interface InvocationError {
  readonly category: InvocationErrorCategory;
  readonly message: string;
  readonly details?: unknown;
}

export interface InvocationSuccess<TOperation extends InvocationOperation, TResult> {
  readonly aiom: { readonly version: string };
  readonly operation: TOperation;
  readonly status: 'ok';
  readonly result: TResult;
}

export interface InvocationFailure {
  readonly aiom: { readonly version: string };
  /** null only when a failure occurs before the operation itself could be identified (e.g. CLI usage errors). */
  readonly operation: InvocationOperation | null;
  readonly status: 'error';
  readonly error: InvocationError;
}

export type InvocationResponse =
  | InvocationSuccess<'bootstrap', BootstrapResult>
  | InvocationSuccess<'validate', ValidationResult>
  | InvocationSuccess<'transition', TransitionGateResult>
  | InvocationSuccess<'orchestrate', OrchestrationResult>
  | InvocationFailure;

export function successResponse<TOperation extends InvocationOperation, TResult>(
  version: string,
  operation: TOperation,
  result: TResult,
): InvocationSuccess<TOperation, TResult> {
  return { aiom: { version }, operation, status: 'ok', result };
}

export function errorResponse(
  version: string,
  operation: InvocationOperation | null,
  error: InvocationError,
): InvocationFailure {
  return { aiom: { version }, operation, status: 'error', error };
}
