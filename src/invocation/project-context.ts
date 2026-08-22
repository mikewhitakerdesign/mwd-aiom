import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Maps a caller-supplied project root to the state directory the kernel's
 * post-Bootstrap operations actually read/evaluate. External callers only
 * ever supply a project root (Initiative 10's required correction over
 * the earlier plan, which left this ambiguous) — this module is the one
 * place that owns knowing `.aiom/` lives under it.
 *
 * Deliberately lenient about existence: `validateProjectState`/
 * `loadProjectState` already degrade a missing directory into structured
 * "missing" validation issues rather than throwing (see
 * src/kernel/validation/project-state.ts's listDirectoryFiles), and
 * `materializeProjectState` can create a brand-new project directory via
 * `mkdirSync(..., { recursive: true })`. Only the unambiguous case — the
 * resolved root already exists but is not a directory — is treated as an
 * invocation-layer error here; anything else is left to the kernel
 * functions' own already-established graceful behavior.
 */
export class InvalidProjectRootError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProjectRootError';
  }
}

export interface ProjectContext {
  readonly projectRoot: string;
  readonly stateDir: string;
}

export function resolveProjectContext(rawProjectRoot: string): ProjectContext {
  const projectRoot = path.resolve(rawProjectRoot);
  if (existsSync(projectRoot) && !statSync(projectRoot).isDirectory()) {
    throw new InvalidProjectRootError(`project root exists but is not a directory: ${projectRoot}`);
  }
  return {
    projectRoot,
    stateDir: path.join(projectRoot, '.aiom'),
  };
}
