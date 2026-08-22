import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { allUnknownSignals, confirmation, readyAssessment } from '../kernel/helpers/bootstrap-fixtures.js';

/**
 * CLI integration tests (Initiative 10 Section 19): exercise the BUILT
 * dist/cli/main.js as a real subprocess, not the CLI's imported
 * functions — this is the actual transport being falsified, matching
 * the repository's own established test-fixture conventions
 * (mkdtempSync + afterEach cleanup) used throughout tests/kernel/.
 *
 * Requires `pnpm build` to have already produced dist/cli/main.js.
 * package.json's `validate` script runs build before test for exactly
 * this reason; running `pnpm test` in isolation without a prior build
 * will skip this file with a clear message rather than fail opaquely.
 */

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const cliPath = path.join(repoRoot, 'dist', 'cli', 'main.js');
const cliBuilt = existsSync(cliPath);

function runCli(args: string[], options: { input?: string; cwd?: string } = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    input: options.input,
    encoding: 'utf8',
    cwd: options.cwd ?? repoRoot,
  });
  let parsedStdout: unknown;
  try {
    parsedStdout = result.stdout.trim().length > 0 ? JSON.parse(result.stdout.trim()) : undefined;
  } catch {
    parsedStdout = undefined;
  }
  return { ...result, parsedStdout };
}

function minimalBootstrapPayload(overrides: Record<string, unknown> = {}) {
  return {
    ownerContext: 'a small CLI-driven project',
    materialize: true,
    decisions: {
      durableStateJustified: true,
      profile: {
        projectName: 'CLI Integration Test',
        projectIntent: 'Prove the built CLI works end to end.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: false,
        lifecyclePosition: 'research',
        signals: allUnknownSignals(),
        consequenceConfirmations: {
          consequential_external_action: confirmation('no', 'owner-confirmed'),
          sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
        },
      },
      bundles: [],
      capabilities: [],
      bootstrapReadyAssessment: readyAssessment(),
      bootstrapReady: false,
      nextGovernedAction: 'research',
    },
    ...overrides,
  };
}

describe.runIf(cliBuilt)('mwd-aiom CLI (built artifact)', () => {
  beforeAll(() => {
    if (!cliBuilt) {
      throw new Error(`dist/cli/main.js not found at ${cliPath} — run "pnpm build" before running CLI tests`);
    }
  });

  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  function tempDir(): string {
    const dir = mkdtempSync(path.join(tmpdir(), 'aiom-cli-'));
    tempDirs.push(dir);
    return dir;
  }

  it('--version prints the package version and exits 0', () => {
    const result = runCli(['--version']);
    expect(result.status).toBe(0);
    expect((result.parsedStdout as { aiom: { version: string } }).aiom.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('bootstrap --input <file> materializes .aiom/ under --project and exits 0', () => {
    const projectRoot = tempDir();
    const inputFile = path.join(projectRoot, 'request.json');
    writeFileSync(inputFile, JSON.stringify(minimalBootstrapPayload()), 'utf8');
    const result = runCli(['bootstrap', '--project', projectRoot, '--input', inputFile]);
    expect(result.status).toBe(0);
    expect(existsSync(path.join(projectRoot, '.aiom', 'profile.md'))).toBe(true);
    const stdout = result.parsedStdout as { status: string; operation: string };
    expect(stdout.status).toBe('ok');
    expect(stdout.operation).toBe('bootstrap');
  });

  it('bootstrap --project <nonexistent path> creates the project root end to end via the built binary', () => {
    const parent = tempDir();
    const projectRoot = path.join(parent, 'brand-new-project-root');
    expect(existsSync(projectRoot)).toBe(false);

    const inputFile = path.join(parent, 'request.json');
    writeFileSync(inputFile, JSON.stringify(minimalBootstrapPayload()), 'utf8');

    const result = runCli(['bootstrap', '--project', projectRoot, '--input', inputFile]);
    expect(result.status).toBe(0);
    expect(existsSync(projectRoot)).toBe(true);
    expect(existsSync(path.join(projectRoot, '.aiom', 'profile.md'))).toBe(true);
    expect(existsSync(path.join(projectRoot, '.aiom', 'seed', 'core.md'))).toBe(true);

    const validateResult = runCli(['validate', '--project', projectRoot]);
    expect(validateResult.status).toBe(0);
  });

  it('bootstrap reads structured JSON from stdin when --input is omitted', () => {
    const projectRoot = tempDir();
    const result = runCli(['bootstrap', '--project', projectRoot], {
      input: JSON.stringify(minimalBootstrapPayload()),
    });
    expect(result.status).toBe(0);
    expect(existsSync(path.join(projectRoot, '.aiom', 'profile.md'))).toBe(true);
  });

  it('validate --project . resolves an explicit relative "." to an absolute path', () => {
    const projectRoot = tempDir();
    writeFileSync(path.join(projectRoot, 'request.json'), JSON.stringify(minimalBootstrapPayload()), 'utf8');
    const bootstrapResult = runCli([
      'bootstrap',
      '--project',
      projectRoot,
      '--input',
      path.join(projectRoot, 'request.json'),
    ]);
    expect(bootstrapResult.status).toBe(0);

    const validateResult = runCli(['validate', '--project', '.'], { cwd: projectRoot });
    expect(validateResult.status).toBe(0);
    const stdout = validateResult.parsedStdout as { result: { valid: boolean } };
    expect(typeof stdout.result.valid).toBe('boolean');
  });

  it('missing --project produces a structured cli-usage error on stdout and exits 1', () => {
    const result = runCli(['validate']);
    expect(result.status).toBe(1);
    const stdout = result.parsedStdout as { status: string; error: { category: string } };
    expect(stdout.status).toBe('error');
    expect(stdout.error.category).toBe('cli-usage');
    expect(result.stderr).toBe('');
  });

  it('invalid JSON on stdin produces a structured cli-usage error and exits 1', () => {
    const result = runCli(['bootstrap', '--project', tempDir()], { input: '{not valid json' });
    expect(result.status).toBe(1);
    const stdout = result.parsedStdout as { error: { category: string } };
    expect(stdout.error.category).toBe('cli-usage');
  });

  it('a malformed request (schema-invalid decisions) exits 2 with category malformed-request', () => {
    const result = runCli(['bootstrap', '--project', tempDir()], {
      input: JSON.stringify({ ownerContext: 'x', decisions: { durableStateJustified: 'not-a-boolean' } }),
    });
    expect(result.status).toBe(2);
    const stdout = result.parsedStdout as { status: string; error: { category: string } };
    expect(stdout.status).toBe('error');
    expect(stdout.error.category).toBe('malformed-request');
  });

  it('unknown operation exits 1 as a cli-usage error', () => {
    const result = runCli(['frobnicate', '--project', tempDir()]);
    expect(result.status).toBe(1);
    const stdout = result.parsedStdout as { error: { category: string } };
    expect(stdout.error.category).toBe('cli-usage');
  });

  it('stdout is exactly one JSON document with no banners or progress text', () => {
    const result = runCli(['validate', '--project', tempDir()]);
    const lines = result.stdout.split('\n').filter((line) => line.length > 0);
    expect(lines.length).toBe(1);
    expect(() => JSON.parse(lines[0]!)).not.toThrow();
  });
});
