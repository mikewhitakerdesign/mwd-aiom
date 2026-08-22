import { z } from 'zod';
import { InvalidProjectRootError } from './project-context.js';
import type { InvocationError } from './contracts/response.js';

/**
 * Normalizes every failure that can occur once a well-formed request has
 * reached kernel dispatch, so no raw ZodError, filesystem exception, or
 * other uncaught error is ever the public interface. A ZodError caught
 * here is necessarily a kernel-internal re-validation failure (e.g.
 * materializeProjectState's serializers calling schema.parse()), not the
 * external request — that case is already handled separately by
 * malformedRequestError() before dispatch ever runs.
 */
export function toInvocationError(err: unknown): InvocationError {
  if (err instanceof InvalidProjectRootError) {
    return { category: 'invalid-target', message: err.message };
  }
  if (err instanceof z.ZodError) {
    return {
      category: 'internal',
      message: 'the deterministic kernel rejected assembled state as schema-invalid',
      details: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    };
  }
  if (err instanceof Error) {
    return { category: 'internal', message: err.message };
  }
  return { category: 'internal', message: String(err) };
}

export function malformedRequestError(zodError: z.ZodError): InvocationError {
  return {
    category: 'malformed-request',
    message: 'invocation request failed schema validation',
    details: zodError.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  };
}
