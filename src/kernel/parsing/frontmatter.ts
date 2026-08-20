import matter from 'gray-matter';
import { fail, ok, type ParseResult } from './result.js';

export interface FrontmatterDocument {
  readonly frontmatter: unknown;
  readonly body: string;
}

export function parseFrontmatterDocument(
  input: string,
): ParseResult<FrontmatterDocument> {
  try {
    const parsed = matter(input);
    return ok({ frontmatter: parsed.data, body: parsed.content.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(`invalid frontmatter: ${message}`);
  }
}
