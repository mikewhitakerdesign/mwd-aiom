import type { z } from 'zod';

export type ParseResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

export function ok<T>(data: T): ParseResult<T> {
  return { ok: true, data };
}

export function fail<T>(error: string): ParseResult<T> {
  return { ok: false, error };
}

export function fromZodSafeParse<T>(
  result: z.ZodSafeParseResult<T>,
): ParseResult<T> {
  if (result.success) {
    return ok(result.data);
  }

  const issues = result.error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');

  return fail(`schema validation failed: ${issues}`);
}
