import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { InvalidProjectRootError, resolveProjectContext } from '../../src/invocation/project-context.js';

describe('resolveProjectContext', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  function tempDir(): string {
    const dir = mkdtempSync(path.join(tmpdir(), 'aiom-invocation-project-context-'));
    tempDirs.push(dir);
    return dir;
  }

  it('maps a project root to its .aiom state directory', () => {
    const root = tempDir();
    const context = resolveProjectContext(root);
    expect(context.projectRoot).toBe(path.resolve(root));
    expect(context.stateDir).toBe(path.join(path.resolve(root), '.aiom'));
  });

  it('resolves a relative path to an absolute one', () => {
    const context = resolveProjectContext('.');
    expect(path.isAbsolute(context.projectRoot)).toBe(true);
  });

  it('does not throw for a project root that does not yet exist (Bootstrap can create it)', () => {
    const root = path.join(tempDir(), 'does-not-exist-yet');
    expect(() => resolveProjectContext(root)).not.toThrow();
  });

  it('throws InvalidProjectRootError when the project root exists but is a file, not a directory', () => {
    const root = tempDir();
    const filePath = path.join(root, 'not-a-directory');
    writeFileSync(filePath, 'x', 'utf8');
    expect(() => resolveProjectContext(filePath)).toThrow(InvalidProjectRootError);
  });
});
