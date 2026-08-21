import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveRuntimeVersion } from '../../src/invocation/version.js';

describe('resolveRuntimeVersion', () => {
  it('returns the same version recorded in package.json', () => {
    const packageJsonPath = fileURLToPath(new URL('../../package.json', import.meta.url));
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string };
    expect(resolveRuntimeVersion()).toBe(pkg.version);
  });
});
