import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  parseCapabilityActivationDocument,
  parseGovernedWorkItemDocument,
  parseOwnerApprovalDocument,
  parseProjectProfileDocument,
} from '../documents.js';
import type { ParseResult } from '../parsing/index.js';
import type { CapabilityActivationRecord } from '../schemas/capability-activation.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { ProjectProfile } from '../schemas/project-profile.js';

/**
 * Reads an AIOM project-state directory — either a fixture directory
 * shaped like `.aiom/`, or a real, live `.aiom/` directory materialized
 * by Bootstrap into an external project and reached through the Runtime
 * Invocation Layer (src/invocation/, Initiative 10). This repository
 * itself never gains its own live `.aiom/` state — see AGENTS.md and
 * seed/README.md — but that is a statement about this repository, not a
 * limitation of this function.
 *
 * Layout accepted, matching seed/templates/README.md's target paths:
 * - `profile.md`                      → Project Profile (at most one)
 * - `capabilities.yaml`               → Capability Activation Record (at most one)
 * - `work-item*.md`, `work/*.md`      → zero or more Governed Work Items
 * - `approval*.yaml`, `approvals/*.yaml` → zero or more Owner Approval Artifacts
 */

export interface LoadedDocument<T> {
  readonly path: string;
  readonly result: ParseResult<T>;
}

export interface LoadedProjectState {
  readonly dir: string;
  readonly profile: LoadedDocument<ProjectProfile> | undefined;
  readonly capabilityActivation: LoadedDocument<CapabilityActivationRecord> | undefined;
  readonly workItems: readonly LoadedDocument<GovernedWorkItem>[];
  readonly approvals: readonly LoadedDocument<OwnerApprovalArtifact>[];
}

function listDirectoryFiles(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function isFile(fullPath: string): boolean {
  try {
    return statSync(fullPath).isFile();
  } catch {
    return false;
  }
}

function findMatchingFiles(
  dir: string,
  topLevelPattern: RegExp,
  subdir: string,
  extension: string,
): string[] {
  const matches: string[] = [];

  for (const entry of listDirectoryFiles(dir)) {
    if (topLevelPattern.test(entry) && isFile(path.join(dir, entry))) {
      matches.push(entry);
    }
  }

  const subdirPath = path.join(dir, subdir);
  for (const entry of listDirectoryFiles(subdirPath)) {
    if (entry.endsWith(extension) && isFile(path.join(subdirPath, entry))) {
      matches.push(path.join(subdir, entry));
    }
  }

  return matches.sort();
}

export function loadProjectState(dir: string): LoadedProjectState {
  const profilePath = path.join(dir, 'profile.md');
  const profile = isFile(profilePath)
    ? { path: 'profile.md', result: parseProjectProfileDocument(readFileSync(profilePath, 'utf8')) }
    : undefined;

  const capabilitiesPath = path.join(dir, 'capabilities.yaml');
  const capabilityActivation = isFile(capabilitiesPath)
    ? {
        path: 'capabilities.yaml',
        result: parseCapabilityActivationDocument(readFileSync(capabilitiesPath, 'utf8')),
      }
    : undefined;

  const workItems = findMatchingFiles(dir, /^work-item.*\.md$/, 'work', '.md').map(
    (relativePath) => ({
      path: relativePath,
      result: parseGovernedWorkItemDocument(readFileSync(path.join(dir, relativePath), 'utf8')),
    }),
  );

  const approvals = findMatchingFiles(dir, /^approval.*\.yaml$/, 'approvals', '.yaml').map(
    (relativePath) => ({
      path: relativePath,
      result: parseOwnerApprovalDocument(readFileSync(path.join(dir, relativePath), 'utf8')),
    }),
  );

  return { dir, profile, capabilityActivation, workItems, approvals };
}
