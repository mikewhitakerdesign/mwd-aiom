import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  serializeCapabilityActivationDocument,
  serializeGovernedWorkItemDocument,
  serializeOwnerApprovalDocument,
  serializeProjectProfileDocument,
} from '../documents.js';
import type { CapabilityActivationRecord } from '../schemas/capability-activation.js';
import type { GovernedWorkItem } from '../schemas/work-item.js';
import type { OwnerApprovalArtifact } from '../schemas/approval.js';
import type { ProjectProfile } from '../schemas/project-profile.js';
import { materializeProjectInstructions, materializeSeedAssets } from './seed-assets.js';
import type { MaterializationResult } from './types.js';

/**
 * State Creation Boundary (Section 16): the only place in this repository
 * that writes a `.aiom`-shaped project-state directory to disk. Callers
 * choose `projectDir` explicitly — nothing here defaults to `process.cwd()`
 * or writes anywhere without an explicit target, so `mwd-aiom` itself is
 * never at risk of gaining live `.aiom/` state just because Bootstrap ran.
 * Writes only inside `projectDir` (`.aiom/` for state, plus a project
 * AGENTS.md/CLAUDE.md pointer at the root only if absent) — never deletes
 * or overwrites unrelated repository content, satisfying brownfield
 * preservation (Section 23) as long as `projectDir` is the target
 * project's own root.
 */
export function materializeProjectState(
  projectDir: string,
  candidate: {
    readonly profile: ProjectProfile;
    readonly capabilityActivation: CapabilityActivationRecord;
    readonly workItems: readonly GovernedWorkItem[];
    readonly approvals: readonly OwnerApprovalArtifact[];
  },
): MaterializationResult {
  const stateDir = path.join(projectDir, '.aiom');
  mkdirSync(stateDir, { recursive: true });

  const profilePath = path.join(stateDir, 'profile.md');
  writeFileSync(profilePath, serializeProjectProfileDocument(candidate.profile), 'utf8');

  const capabilitiesPath = path.join(stateDir, 'capabilities.yaml');
  writeFileSync(
    capabilitiesPath,
    serializeCapabilityActivationDocument(candidate.capabilityActivation),
    'utf8',
  );

  let workItemPath: string | undefined;
  if (candidate.workItems.length > 0) {
    const workDir = path.join(stateDir, 'work');
    mkdirSync(workDir, { recursive: true });
    for (const item of candidate.workItems) {
      const itemPath = path.join(workDir, `${item.frontmatter.id}.md`);
      writeFileSync(itemPath, serializeGovernedWorkItemDocument(item), 'utf8');
      workItemPath = itemPath;
    }
  }

  let approvalPath: string | undefined;
  if (candidate.approvals.length > 0) {
    const approvalsDir = path.join(stateDir, 'approvals');
    mkdirSync(approvalsDir, { recursive: true });
    for (const approval of candidate.approvals) {
      const thisPath = path.join(approvalsDir, `${approval.id}.yaml`);
      writeFileSync(thisPath, serializeOwnerApprovalDocument(approval), 'utf8');
      approvalPath = thisPath;
    }
  }

  const seedAssetPaths = materializeSeedAssets(projectDir);
  const projectInstructionPaths = materializeProjectInstructions(projectDir);

  return {
    projectDir,
    stateDir,
    profilePath,
    capabilitiesPath,
    workItemPath,
    approvalPath,
    seedAssetPaths,
    projectInstructionPaths,
  };
}
