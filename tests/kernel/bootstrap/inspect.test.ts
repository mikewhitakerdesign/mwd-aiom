import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, afterEach } from 'vitest';
import { inspectRepository } from '../../../src/kernel/bootstrap/inspect.js';

const fixturesRoot = fileURLToPath(new URL('../../fixtures/bootstrap/', import.meta.url));
const brownfieldRepo = path.join(fixturesRoot, 'brownfield-repo');

describe('inspectRepository', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('no projectPath -> not inspected, no evidence fabricated', () => {
    const result = inspectRepository(undefined);
    expect(result.inspected).toBe(false);
    expect(result.exists).toBe(false);
    expect(result.topLevelEntries).toEqual([]);
  });

  it('a nonexistent path -> inspected but does not exist', () => {
    const result = inspectRepository(path.join(fixturesRoot, 'does-not-exist'));
    expect(result.inspected).toBe(true);
    expect(result.exists).toBe(false);
  });

  it('brownfield fixture: detects manifest, README, source dir, docs dir', () => {
    const result = inspectRepository(brownfieldRepo);
    expect(result.exists).toBe(true);
    expect(result.hasPackageManifest).toBe(true);
    expect(result.manifestFiles).toContain('package.json');
    expect(result.hasReadme).toBe(true);
    expect(result.hasSourceDirectory).toBe(true);
    expect(result.hasDocsDirectory).toBe(true);
    expect(result.hasExistingAiomState).toBe(false);
    expect(result.hasRepositoryInstructions).toBe(false);
  });

  it('detects an existing .aiom directory rather than assuming a fresh project', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-inspect-'));
    tempDirs.push(dir);
    mkdirSync(path.join(dir, '.aiom'));
    const result = inspectRepository(dir);
    expect(result.hasExistingAiomState).toBe(true);
  });

  it('detects an existing AGENTS.md/CLAUDE.md without overwriting or reading their content', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-inspect-'));
    tempDirs.push(dir);
    writeFileSync(path.join(dir, 'AGENTS.md'), 'pre-existing instructions', 'utf8');
    const result = inspectRepository(dir);
    expect(result.hasRepositoryInstructions).toBe(true);
    expect(result.instructionFiles).toEqual(['AGENTS.md']);
  });

  it('detects a .git directory as evidence of an existing repository', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-inspect-'));
    tempDirs.push(dir);
    mkdirSync(path.join(dir, '.git'));
    const result = inspectRepository(dir);
    expect(result.isGitRepository).toBe(true);
  });

  it('an empty directory has no git repository and no manifest', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-inspect-'));
    tempDirs.push(dir);
    const result = inspectRepository(dir);
    expect(result.isGitRepository).toBe(false);
    expect(result.hasPackageManifest).toBe(false);
  });
});
