import matter from 'gray-matter';
import { dump } from 'js-yaml';

/**
 * The write-side counterpart to frontmatter.ts / yaml.ts, needed starting
 * with Project Bootstrap (Initiative 8): everything before this initiative
 * only ever parsed already-authored artifacts. Kept as thin and symmetric
 * with the parse layer as possible — no templating engine, no formatting
 * options beyond what a round-trip through the existing parse functions
 * requires.
 */

export function stringifyFrontmatterDocument(frontmatter: unknown, body: string): string {
  const content = body.trim().length > 0 ? `${body.trim()}\n` : '\n';
  return matter.stringify(content, frontmatter as Record<string, unknown>);
}

export function stringifyYamlDocument(data: unknown): string {
  return dump(data, { sortKeys: false });
}
