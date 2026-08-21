import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { malformedRequestError, toInvocationError } from '../../src/invocation/errors.js';
import { InvalidProjectRootError } from '../../src/invocation/project-context.js';

describe('toInvocationError', () => {
  it('maps InvalidProjectRootError to category invalid-target', () => {
    const error = toInvocationError(new InvalidProjectRootError('not a directory'));
    expect(error.category).toBe('invalid-target');
    expect(error.message).toContain('not a directory');
  });

  it('maps a ZodError encountered post-dispatch to category internal with structured details', () => {
    const schema = z.object({ x: z.string() });
    const result = schema.safeParse({ x: 42 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = toInvocationError(result.error);
      expect(error.category).toBe('internal');
      expect(Array.isArray(error.details)).toBe(true);
    }
  });

  it('maps a plain Error to category internal without leaking a stack trace in the message', () => {
    const error = toInvocationError(new Error('disk is full'));
    expect(error.category).toBe('internal');
    expect(error.message).toBe('disk is full');
  });

  it('maps a non-Error thrown value to a string message', () => {
    const error = toInvocationError('a string was thrown');
    expect(error.category).toBe('internal');
    expect(error.message).toBe('a string was thrown');
  });
});

describe('malformedRequestError', () => {
  it('produces category malformed-request with flattened issue paths', () => {
    const schema = z.object({ operation: z.literal('bootstrap') });
    const result = schema.safeParse({ operation: 'not-bootstrap' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = malformedRequestError(result.error);
      expect(error.category).toBe('malformed-request');
      expect(error.details).toBeDefined();
    }
  });
});
