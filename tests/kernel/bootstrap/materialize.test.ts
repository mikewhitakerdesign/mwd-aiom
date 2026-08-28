import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { materializeProjectState } from '../../../src/kernel/bootstrap/materialize.js';
import { buildCandidateProfile } from '../../../src/kernel/bootstrap/profile.js';
import { buildCapabilityActivationRecord } from '../../../src/kernel/bootstrap/capability-record.js';
import { buildFirstWorkItem } from '../../../src/kernel/bootstrap/work-item.js';
import { buildApprovalRequest } from '../../../src/kernel/bootstrap/approval.js';
import { validateProjectState } from '../../../src/kernel/validation/validate-project.js';
import { allUnknownSignals, confirmation } from '../helpers/bootstrap-fixtures.js';

function readyProfile() {
  return buildCandidateProfile({
    profile: {
      projectName: 'Materialize Fixture',
      projectIntent: 'Prove Bootstrap materialization is bounded and non-destructive.',
      ownerIdentity: 'Sam',
      existingStateAssessmentPerformed: true,
      lifecyclePosition: 'active-development',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('no', 'owner-confirmed'),
        sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
      },
    },
    unresolvedItems: [],
    bootstrapReady: true,
    nextGovernedAction: 'Begin implementation planning.',
  });
}

describe('materializeProjectState', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a validateProjectState-clean .aiom directory, plus seed assets and project instructions', () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-materialize-'));
    tempDirs.push(projectDir);

    const profile = readyProfile();
    const capabilityActivation = buildCapabilityActivationRecord(
      [{ bundleId: 'software-engineering', relevant: 'true' }],
      [{ capabilityId: 'software-implementation', status: 'required', provenance: 'owner-confirmed' }],
    );
    const workItem = buildFirstWorkItem({
      id: 'first-work-item',
      title: 'First work item',
      objective: 'Prove a materialized Work Item is present and valid.',
      stage: 'research',
      currentResponsibility: 'orchestrator',
    });
    const approval = buildApprovalRequest({
      id: 'first-approval',
      relatedWorkItemId: 'first-work-item',
      targetContext: 'x',
      requestedDecision: 'y',
      scope: 'z',
      ownerIdentity: 'Sam',
      mode: 'one-time',
    });

    const result = materializeProjectState(projectDir, {
      profile,
      capabilityActivation,
      workItems: [workItem],
      approvals: [approval],
    });

    expect(existsSync(result.profilePath)).toBe(true);
    expect(existsSync(result.capabilitiesPath)).toBe(true);
    expect(result.workItemPath && existsSync(result.workItemPath)).toBe(true);
    expect(result.approvalPath && existsSync(result.approvalPath)).toBe(true);
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'core.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'safeguards.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'capabilities', 'bundles.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, 'AGENTS.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, 'CLAUDE.md'))).toBe(true);
    expect(readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8')).toContain(
      'must invoke `mwd-aiom validate --project <path>`',
    );

    const validation = validateProjectState(result.stateDir);
    expect(validation.valid).toBe(true);
  });

  it('never overwrites an existing brownfield AGENTS.md/CLAUDE.md', () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-materialize-'));
    tempDirs.push(projectDir);
    writeFileSync(path.join(projectDir, 'AGENTS.md'), 'pre-existing brownfield instructions', 'utf8');

    const profile = readyProfile();
    const capabilityActivation = buildCapabilityActivationRecord([], []);
    const result = materializeProjectState(projectDir, {
      profile,
      capabilityActivation,
      workItems: [],
      approvals: [],
    });

    expect(readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8')).toBe(
      'pre-existing brownfield instructions',
    );
    expect(result.projectInstructionPaths).not.toContain(path.join(projectDir, 'AGENTS.md'));
    expect(existsSync(path.join(projectDir, 'CLAUDE.md'))).toBe(true);
  });

  it('never writes outside the given projectDir', () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-materialize-'));
    tempDirs.push(projectDir);
    const sibling = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-sibling-'));
    tempDirs.push(sibling);
    writeFileSync(path.join(sibling, 'untouched.txt'), 'sibling', 'utf8');

    materializeProjectState(projectDir, {
      profile: readyProfile(),
      capabilityActivation: buildCapabilityActivationRecord([], []),
      workItems: [],
      approvals: [],
    });

    expect(readFileSync(path.join(sibling, 'untouched.txt'), 'utf8')).toBe('sibling');
  });
});
