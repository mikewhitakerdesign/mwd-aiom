import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Packaging test (Initiative 10 Section 19 — mandatory): builds and packs
 * the real package, installs the tarball into a scratch consumer OUTSIDE
 * the mwd-aiom source tree, and proves the installed CLI can Bootstrap
 * and Validate an external project using only its own bundled `seed/`
 * assets. This is the concrete falsification of the assumption (planning
 * phase, Section 6) that the existing import.meta.url-relative asset
 * resolution survives real packaging — see src/kernel/validation/
 * capability-index.ts and src/kernel/bootstrap/seed-assets.ts, both left
 * unchanged by Initiative 10.
 *
 * Network access is required (npm resolves this package's own
 * dependencies — zod, js-yaml, gray-matter — from the registry when
 * installing the tarball into a fresh scratch project).
 */

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

let scratchRoot: string;
let cliPath: string;
let externalProjectDir: string;

function minimalBootstrapPayload() {
  return {
    ownerContext: 'A packaging falsification test project.',
    materialize: true,
    decisions: {
      durableStateJustified: true,
      profile: {
        projectName: 'Packaging Falsification Project',
        projectIntent: 'Prove the packed, installed CLI resolves its own bundled seed assets.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'research',
        signals: Object.fromEntries(
          [
            'repository_backed',
            'software_producing',
            'ui_bearing',
            'externally_acting',
            'persistent_state_dependent',
            'data_sensitive',
            'regulated_high_risk_possible',
            'long_running_continuous',
            'content_heavy_narrative_heavy',
          ].map((key) => [key, { value: 'unknown', provenance: 'unknown' }]),
        ),
        consequenceConfirmations: {
          consequential_external_action: { value: 'no', provenance: 'owner-confirmed' },
          sensitive_or_high_consequence_data: { value: 'no', provenance: 'owner-confirmed' },
        },
      },
      bundles: [],
      capabilities: [{ capabilityId: 'research-discovery', status: 'required', provenance: 'ai-inferred' }],
      bootstrapReadyAssessment: {
        sufficientIntentForNextAction: true,
        existingStateAssessmentAdequate: true,
        consequenceQuestionsResolvedWhereNecessary: true,
        capabilityConfigurationSufficient: true,
        unresolvedUncertaintyRepresented: true,
        ownerDecisionsObtainedWhereRequired: true,
      },
      bootstrapReady: true,
      nextGovernedAction: 'packaging falsification',
    },
  };
}

describe('packaging: packed, installed artifact resolves canonical assets outside the source tree', () => {
  beforeAll(() => {
    scratchRoot = mkdtempSync(path.join(tmpdir(), 'aiom-packaging-'));
    const tarballOut = path.join(scratchRoot, 'tarball-out');
    const consumer = path.join(scratchRoot, 'consumer');
    externalProjectDir = path.join(scratchRoot, 'external-project');
    mkdirSync(tarballOut, { recursive: true });
    mkdirSync(consumer, { recursive: true });
    mkdirSync(externalProjectDir, { recursive: true });

    const pack = spawnSync('pnpm', ['pack', '--pack-destination', tarballOut], { cwd: repoRoot, encoding: 'utf8' });
    if (pack.status !== 0) {
      throw new Error(`pnpm pack failed: ${pack.stderr}`);
    }
    const tarballName = readdirSync(tarballOut).find((f) => f.endsWith('.tgz'));
    if (!tarballName) {
      throw new Error('pnpm pack did not produce a .tgz file');
    }
    const tarballPath = path.join(tarballOut, tarballName);

    const npmInit = spawnSync('npm', ['init', '-y'], { cwd: consumer, encoding: 'utf8' });
    if (npmInit.status !== 0) {
      throw new Error(`npm init failed: ${npmInit.stderr}`);
    }

    const npmInstall = spawnSync('npm', ['install', tarballPath, '--no-audit', '--no-fund'], {
      cwd: consumer,
      encoding: 'utf8',
      timeout: 120_000,
    });
    if (npmInstall.status !== 0) {
      throw new Error(`npm install of packed tarball failed: ${npmInstall.stderr}`);
    }

    cliPath = path.join(consumer, 'node_modules', '.bin', 'mwd-aiom');
  }, 180_000);

  afterAll(() => {
    if (scratchRoot) {
      rmSync(scratchRoot, { recursive: true, force: true });
    }
  });

  it('installs a bin shim resolving into node_modules/mwd-aiom/dist/cli/main.js', () => {
    expect(existsSync(cliPath)).toBe(true);
  });

  it('ships seed/ as a sibling of dist/ inside the installed package', () => {
    const packageDir = path.join(scratchRoot, 'consumer', 'node_modules', 'mwd-aiom');
    expect(existsSync(path.join(packageDir, 'dist', 'kernel'))).toBe(true);
    expect(existsSync(path.join(packageDir, 'seed', 'capabilities', 'bundles.md'))).toBe(true);
  });

  it('reports its version identically to package.json, with no build step required by the consumer', () => {
    const result = spawnSync(cliPath, ['--version'], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout.trim()) as { aiom: { version: string } };
    const ownVersion = (JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as { version: string })
      .version;
    expect(parsed.aiom.version).toBe(ownVersion);
  });

  it('Bootstrap materializes valid canonical seed assets into an external project using only the installed package', () => {
    const inputPath = path.join(externalProjectDir, 'bootstrap-request.json');
    writeFileSync(inputPath, JSON.stringify(minimalBootstrapPayload()), 'utf8');

    const result = spawnSync(cliPath, ['bootstrap', '--project', externalProjectDir, '--input', inputPath], {
      cwd: externalProjectDir,
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    const response = JSON.parse(result.stdout.trim()) as { status: string; result: { validation: { valid: boolean } } };
    expect(response.status).toBe('ok');
    expect(response.result.validation.valid).toBe(true);

    expect(existsSync(path.join(externalProjectDir, '.aiom', 'profile.md'))).toBe(true);
    expect(existsSync(path.join(externalProjectDir, '.aiom', 'seed', 'capabilities', 'bundles.md'))).toBe(true);
    expect(existsSync(path.join(externalProjectDir, '.aiom', 'seed', 'core.md'))).toBe(true);

    // The resolved capability index must be real, not empty: an unresolved
    // reference to seed/capabilities/*.md would surface as a validation
    // error here, not as a silently-empty index.
    const bundlesMd = readFileSync(
      path.join(externalProjectDir, '.aiom', 'seed', 'capabilities', 'bundles.md'),
      'utf8',
    );
    expect(bundlesMd).toContain('Capability Bundle');
  });

  it('Validate reads the materialized external state back through the same installed runtime', () => {
    const result = spawnSync(cliPath, ['validate', '--project', externalProjectDir], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    const response = JSON.parse(result.stdout.trim()) as { status: string; result: { valid: boolean } };
    expect(response.status).toBe('ok');
    expect(response.result.valid).toBe(true);
  });

  it('never references the mwd-aiom source repository path in any response', () => {
    const result = spawnSync(cliPath, ['validate', '--project', externalProjectDir], { encoding: 'utf8' });
    expect(result.stdout).not.toContain(repoRoot);
  });

  it('Initiative 14: surfaces seed-snapshot-mismatch through the packed, installed runtime after a hand-edit', () => {
    // Proves canonical Seed asset resolution for Seed Snapshot Integrity
    // (src/kernel/validation/seed-snapshot-integrity.ts) works from the
    // installed/packed `dist` + `seed` layout, not merely from a source
    // checkout — the same falsification this file already performs for
    // Bootstrap/Validate's own asset resolution.
    writeFileSync(
      path.join(externalProjectDir, '.aiom', 'seed', 'core.md'),
      'hand-edited core guidance, outside AIOM awareness',
      'utf8',
    );

    const result = spawnSync(cliPath, ['validate', '--project', externalProjectDir], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    const response = JSON.parse(result.stdout.trim()) as {
      status: string;
      result: { valid: boolean; errors: unknown[]; warnings: { code: string; artifact?: string }[] };
    };
    expect(response.status).toBe('ok');
    expect(response.result.valid).toBe(true);
    expect(response.result.errors).toEqual([]);
    expect(response.result.warnings).toContainEqual(
      expect.objectContaining({ code: 'seed-snapshot-mismatch', artifact: 'seed/core.md' }),
    );
  });
});
