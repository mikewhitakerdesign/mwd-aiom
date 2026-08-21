import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Resolves this package's own version at runtime, the source of truth for
 * every invocation response's `aiom.version` field and `mwd-aiom
 * --version`. Uses the same import.meta.url-relative technique already
 * proven elsewhere in this repository for locating repository-relative
 * assets (see src/kernel/validation/capability-index.ts,
 * src/kernel/bootstrap/seed-assets.ts) — two levels up from this file's
 * own directory lands on the package root in both source form
 * (src/invocation/ -> repo root) and built form (dist/invocation/ ->
 * package root), so no separate build-time codegen step is needed.
 */
const packageJsonPath = fileURLToPath(new URL('../../package.json', import.meta.url));

let cachedVersion: string | undefined;

export function resolveRuntimeVersion(): string {
  if (cachedVersion !== undefined) {
    return cachedVersion;
  }
  const raw = readFileSync(packageJsonPath, 'utf8');
  const parsed = JSON.parse(raw) as { version?: string };
  cachedVersion = parsed.version ?? '0.0.0';
  return cachedVersion;
}
