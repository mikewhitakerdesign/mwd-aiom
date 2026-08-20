import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Seed Installation / Materialization (Section 17): the minimum mechanism
 * by which a future AIOM-managed project receives reusable, project-facing
 * Seed guidance. Deliberately not "copy all of mwd-aiom" — only a bounded,
 * fixed list of reusable Seed documents (Core, safeguards, the Capability
 * Architecture) is copied into the consuming project's own
 * `.aiom/seed/`, and a short, generated project AGENTS.md / CLAUDE.md
 * pointer (Section 31) is written at the project root, never this
 * repository's own development `AGENTS.md` / `CLAUDE.md`.
 */

const REPOSITORY_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DEFAULT_SEED_DIR = path.join(REPOSITORY_ROOT, 'seed');
const DEFAULT_TEMPLATES_DIR = path.join(DEFAULT_SEED_DIR, 'templates');

const REUSABLE_SEED_FILES = ['core.md', 'safeguards.md'] as const;
const REUSABLE_CAPABILITY_FILES = ['capabilities/bundles.md', 'capabilities/capabilities.md'] as const;

export function materializeSeedAssets(
  projectDir: string,
  seedSourceDir: string = DEFAULT_SEED_DIR,
): readonly string[] {
  const targetSeedDir = path.join(projectDir, '.aiom', 'seed');
  mkdirSync(path.join(targetSeedDir, 'capabilities'), { recursive: true });

  const written: string[] = [];
  for (const relative of REUSABLE_SEED_FILES) {
    const dest = path.join(targetSeedDir, relative);
    copyFileSync(path.join(seedSourceDir, relative), dest);
    written.push(dest);
  }
  for (const relative of REUSABLE_CAPABILITY_FILES) {
    const dest = path.join(targetSeedDir, relative);
    copyFileSync(path.join(seedSourceDir, relative), dest);
    written.push(dest);
  }
  return written;
}

/**
 * Writes the project-facing AGENTS.md / CLAUDE.md pointer (Section 18, 31)
 * at the project root, generated from `seed/templates/project-agents.md`
 * and `seed/templates/project-claude.md`. Never overwrites a file that
 * already exists (brownfield preservation, Section 23) — an existing
 * AGENTS.md/CLAUDE.md is left untouched and simply not reported as
 * written, so a caller can surface reconciliation as an unresolved item
 * rather than silently destroying prior content.
 */
export function materializeProjectInstructions(
  projectDir: string,
  templatesDir: string = DEFAULT_TEMPLATES_DIR,
): readonly string[] {
  const written: string[] = [];

  const agentsSource = path.join(templatesDir, 'project-agents.md');
  const agentsDest = path.join(projectDir, 'AGENTS.md');
  if (!existsSync(agentsDest)) {
    writeFileSync(agentsDest, readFileSync(agentsSource, 'utf8'), 'utf8');
    written.push(agentsDest);
  }

  const claudeSource = path.join(templatesDir, 'project-claude.md');
  const claudeDest = path.join(projectDir, 'CLAUDE.md');
  if (!existsSync(claudeDest)) {
    writeFileSync(claudeDest, readFileSync(claudeSource, 'utf8'), 'utf8');
    written.push(claudeDest);
  }

  return written;
}
