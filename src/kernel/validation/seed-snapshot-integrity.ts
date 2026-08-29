import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_VERSION } from '../schemas/common.js';
import { issue, type ValidationIssue } from './result.js';

/**
 * Seed Snapshot Integrity (Initiative 14): `.aiom/seed/*` is a pinned
 * Bootstrap-time snapshot of this repository's Seed guidance — not a live
 * mirror, not automatically refreshed, and not governed by any Seed
 * upgrade/migration mechanism (none exists). This module checks only one
 * bounded thing: when a project's recorded `seed_version` equals the
 * installed package's own `SEED_VERSION`, the installed package's `seed/`
 * *is* the exact canonical content that snapshot was materialized from, so
 * any byte difference is unambiguous evidence of local drift. When the
 * versions differ, the installed package retains no historical Seed
 * assets (no version-indexed registry, no Git tags, no changelog — see
 * the Initiative 14 investigation), so a byte comparison could not
 * distinguish local mutation from legitimate Seed evolution and must not
 * be attempted at all.
 *
 * Deliberately excluded: the project root `AGENTS.md`/`CLAUDE.md` pointer
 * files. Those have intentional brownfield-preservation semantics (see
 * seed-assets.ts's materializeProjectInstructions) and are expected to
 * diverge from their template after Bootstrap — the opposite of what this
 * check looks for.
 */

const CANONICAL_SEED_DIR = fileURLToPath(new URL('../../../seed/', import.meta.url));

/**
 * The exact set of files materializeSeedAssets copies into a project's
 * `.aiom/seed/` (see bootstrap/seed-assets.ts's REUSABLE_SEED_FILES /
 * REUSABLE_CAPABILITY_FILES). Redeclared here, independently, rather than
 * imported from bootstrap/ — bootstrap/ already depends on validation/
 * (bootstrap.ts imports validateProjectState), so importing bootstrap/
 * code from validation/ would introduce a dependency cycle. Duplicating
 * this one small literal list is the smaller, lower-risk cost.
 */
const MATERIALIZED_SEED_FILES = [
  'core.md',
  'safeguards.md',
  'capabilities/bundles.md',
  'capabilities/capabilities.md',
] as const;

/**
 * Pure comparison core: given a materialized `.aiom/seed/` directory and a
 * canonical Seed directory to compare it against, reports one
 * warning-severity `seed-snapshot-mismatch` issue per file that is either
 * missing or byte-different, in a fixed, deterministic order. Returns no
 * issues at all when `projectSeedVersion` and `installedSeedVersion`
 * differ — the comparison is only meaningful when they match (see the doc
 * comment above).
 */
export function buildSeedSnapshotIntegrityIssues(
  materializedSeedDir: string,
  canonicalSeedDir: string,
  projectSeedVersion: string,
  installedSeedVersion: string,
): ValidationIssue[] {
  if (projectSeedVersion !== installedSeedVersion) {
    return [];
  }

  const issues: ValidationIssue[] = [];
  for (const relative of MATERIALIZED_SEED_FILES) {
    const artifact = `seed/${relative}`;
    const materializedPath = path.join(materializedSeedDir, relative);

    if (!existsSync(materializedPath)) {
      issues.push(
        issue(
          'seed-snapshot-mismatch',
          'warning',
          `"${artifact}" is missing from the materialized Seed snapshot; expected a copy of the canonical Seed asset for seed_version "${installedSeedVersion}"`,
          { artifact },
        ),
      );
      continue;
    }

    const canonicalPath = path.join(canonicalSeedDir, relative);
    const materializedContent = readFileSync(materializedPath, 'utf8');
    const canonicalContent = readFileSync(canonicalPath, 'utf8');
    if (materializedContent !== canonicalContent) {
      issues.push(
        issue(
          'seed-snapshot-mismatch',
          'warning',
          `"${artifact}" no longer matches the canonical Seed asset for seed_version "${installedSeedVersion}"`,
          { artifact },
        ),
      );
    }
  }

  return issues;
}

/**
 * Disk-backed entry point used by validateProjectState: resolves the
 * installed package's own canonical `seed/` (the same package-relative
 * `import.meta.url` technique already used by
 * validation/capability-index.ts's loadCapabilityIndex() and
 * bootstrap/seed-assets.ts) and this repository's own `SEED_VERSION`.
 * `stateDir` is the project's `.aiom` directory — the same `dir` already
 * passed into validateProjectState — so the materialized snapshot lives
 * at `${stateDir}/seed`.
 */
export function validateSeedSnapshotIntegrity(
  stateDir: string,
  projectSeedVersion: string,
): ValidationIssue[] {
  return buildSeedSnapshotIntegrityIssues(
    path.join(stateDir, 'seed'),
    CANONICAL_SEED_DIR,
    projectSeedVersion,
    SEED_VERSION,
  );
}
