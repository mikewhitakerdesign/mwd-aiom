import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { RepositoryInspection } from './types.js';

/**
 * Bounded, mechanical repository inspection (Section 5): the smallest set
 * of file/directory/Git presence checks needed to let Bootstrap "inspect
 * before ask" instead of asking the Owner to restate what a directory
 * listing already shows. Deliberately not a generalized repository-
 * analysis engine (Section 5) — no dependency parsing, no source-code
 * reading, no framework detection beyond manifest-file presence.
 *
 * Uses direct `node:fs` reads, the same precedent
 * `validation/project-state.ts` already set for loading already-known
 * project structure — RuntimeAdapter (src/kernel/runtime/) is a distinct
 * concern (probing *runtime capability availability*, e.g. can this
 * process write to disk at all), not the inspection this function performs.
 */

const MANIFEST_FILES = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'go.mod',
  'Cargo.toml',
  'Gemfile',
  'composer.json',
  'pom.xml',
  'build.gradle',
] as const;

const INSTRUCTION_FILES = ['AGENTS.md', 'CLAUDE.md'] as const;
const README_FILES = ['README.md', 'README', 'readme.md'] as const;
const SOURCE_DIR_NAMES = ['src', 'lib', 'app', 'pkg', 'cmd'] as const;

const EMPTY_INSPECTION: Omit<RepositoryInspection, 'inspected' | 'path' | 'exists'> = {
  isGitRepository: false,
  topLevelEntries: [],
  hasPackageManifest: false,
  manifestFiles: [],
  hasReadme: false,
  hasExistingAiomState: false,
  hasRepositoryInstructions: false,
  instructionFiles: [],
  hasDocsDirectory: false,
  hasSourceDirectory: false,
};

export function inspectRepository(projectPath: string | undefined): RepositoryInspection {
  if (!projectPath) {
    return { inspected: false, path: undefined, exists: false, ...EMPTY_INSPECTION };
  }

  const exists = existsSync(projectPath) && statSync(projectPath).isDirectory();
  if (!exists) {
    return { inspected: true, path: projectPath, exists: false, ...EMPTY_INSPECTION };
  }

  const entries = readdirSync(projectPath).sort();
  const has = (name: string): boolean => entries.includes(name);

  const manifestFiles = MANIFEST_FILES.filter(has);
  const instructionFiles = INSTRUCTION_FILES.filter(has);

  return {
    inspected: true,
    path: projectPath,
    exists: true,
    isGitRepository: existsSync(path.join(projectPath, '.git')),
    topLevelEntries: entries,
    hasPackageManifest: manifestFiles.length > 0,
    manifestFiles,
    hasReadme: README_FILES.some(has),
    hasExistingAiomState: existsSync(path.join(projectPath, '.aiom')),
    hasRepositoryInstructions: instructionFiles.length > 0,
    instructionFiles,
    hasDocsDirectory: has('docs'),
    hasSourceDirectory: SOURCE_DIR_NAMES.some(has),
  };
}
