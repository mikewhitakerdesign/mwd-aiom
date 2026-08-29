import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildSeedSnapshotIntegrityIssues } from '../../../src/kernel/validation/seed-snapshot-integrity.js';

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function scratchDir(prefix: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

const FILES = ['core.md', 'safeguards.md', 'capabilities/bundles.md', 'capabilities/capabilities.md'] as const;

function writeSeedTree(dir: string, content: Record<(typeof FILES)[number], string>): void {
  mkdirSync(path.join(dir, 'capabilities'), { recursive: true });
  for (const relative of FILES) {
    writeFileSync(path.join(dir, relative), content[relative], 'utf8');
  }
}

function matchingContent(): Record<(typeof FILES)[number], string> {
  return {
    'core.md': 'core guidance v1',
    'safeguards.md': 'safeguards v1',
    'capabilities/bundles.md': 'bundles v1',
    'capabilities/capabilities.md': 'capabilities v1',
  };
}

describe('buildSeedSnapshotIntegrityIssues — same Seed version', () => {
  it('reports nothing when the materialized snapshot byte-matches the canonical assets', () => {
    const materialized = scratchDir('aiom-seed-materialized-');
    const canonical = scratchDir('aiom-seed-canonical-');
    const content = matchingContent();
    writeSeedTree(materialized, content);
    writeSeedTree(canonical, content);

    const issues = buildSeedSnapshotIntegrityIssues(materialized, canonical, '0.1', '0.1');
    expect(issues).toEqual([]);
  });

  it('reports exactly one seed-snapshot-mismatch warning for one mutated file', () => {
    const materialized = scratchDir('aiom-seed-materialized-');
    const canonical = scratchDir('aiom-seed-canonical-');
    const content = matchingContent();
    writeSeedTree(materialized, content);
    writeSeedTree(canonical, content);
    writeFileSync(path.join(materialized, 'core.md'), 'hand-edited core guidance', 'utf8');

    const issues = buildSeedSnapshotIntegrityIssues(materialized, canonical, '0.1', '0.1');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'seed-snapshot-mismatch',
      severity: 'warning',
      artifact: 'seed/core.md',
    });
  });

  it('reports one warning per mutated file, in deterministic file order', () => {
    const materialized = scratchDir('aiom-seed-materialized-');
    const canonical = scratchDir('aiom-seed-canonical-');
    const content = matchingContent();
    writeSeedTree(materialized, content);
    writeSeedTree(canonical, content);
    writeFileSync(path.join(materialized, 'safeguards.md'), 'hand-edited safeguards', 'utf8');
    writeFileSync(
      path.join(materialized, 'capabilities', 'capabilities.md'),
      'hand-edited capabilities',
      'utf8',
    );

    const issues = buildSeedSnapshotIntegrityIssues(materialized, canonical, '0.1', '0.1');
    expect(issues.map((issue) => issue.artifact)).toEqual([
      'seed/safeguards.md',
      'seed/capabilities/capabilities.md',
    ]);
    expect(issues.every((issue) => issue.code === 'seed-snapshot-mismatch' && issue.severity === 'warning')).toBe(
      true,
    );
  });

  it('reports a missing materialized file as seed-snapshot-mismatch with a missing-specific message', () => {
    const materialized = scratchDir('aiom-seed-materialized-');
    const canonical = scratchDir('aiom-seed-canonical-');
    writeSeedTree(canonical, matchingContent());
    mkdirSync(path.join(materialized, 'capabilities'), { recursive: true });
    // core.md deliberately never written into `materialized`.

    const issues = buildSeedSnapshotIntegrityIssues(materialized, canonical, '0.1', '0.1');
    const coreIssue = issues.find((issue) => issue.artifact === 'seed/core.md');
    expect(coreIssue).toMatchObject({ code: 'seed-snapshot-mismatch', severity: 'warning' });
    expect(coreIssue?.message).toContain('is missing');
  });
});

describe('buildSeedSnapshotIntegrityIssues — differing Seed versions', () => {
  it('skips the comparison entirely, even when file content actually differs', () => {
    const materialized = scratchDir('aiom-seed-materialized-');
    const canonical = scratchDir('aiom-seed-canonical-');
    writeSeedTree(materialized, matchingContent());
    writeSeedTree(canonical, {
      'core.md': 'a completely different canonical core.md',
      'safeguards.md': 'a completely different canonical safeguards.md',
      'capabilities/bundles.md': 'a completely different canonical bundles.md',
      'capabilities/capabilities.md': 'a completely different canonical capabilities.md',
    });

    const issues = buildSeedSnapshotIntegrityIssues(materialized, canonical, '0.1', '0.2');
    expect(issues).toEqual([]);
  });

  it('never touches the filesystem when versions differ (safe with nonexistent directories)', () => {
    const issues = buildSeedSnapshotIntegrityIssues(
      '/nonexistent/materialized',
      '/nonexistent/canonical',
      '0.1',
      '0.2',
    );
    expect(issues).toEqual([]);
  });
});
