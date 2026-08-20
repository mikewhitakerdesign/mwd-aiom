import { load } from 'js-yaml';
import { fail, ok, type ParseResult } from './result.js';

export function parseYamlDocument(input: string): ParseResult<unknown> {
  try {
    return ok(load(input));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(`invalid YAML: ${message}`);
  }
}
