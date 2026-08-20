import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesRoot = fileURLToPath(new URL('../../fixtures/', import.meta.url));

export function readFixture(relativePath: string): string {
  return readFileSync(path.join(fixturesRoot, relativePath), 'utf8');
}
