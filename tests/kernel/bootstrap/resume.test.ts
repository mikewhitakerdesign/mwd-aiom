import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runBootstrap } from '../../../src/kernel/bootstrap/bootstrap.js';
import type { BootstrapReasoningDecisions } from '../../../src/kernel/bootstrap/types.js';
import { loadProjectState } from '../../../src/kernel/validation/project-state.js';
import { validateProjectState } from '../../../src/kernel/validation/validate-project.js';
import { orchestrate } from '../../../src/kernel/orchestration/orchestrate.js';
import { allUnknownSignals, confirmation, readyAssessment, signal } from '../helpers/bootstrap-fixtures.js';

/**
 * Fresh-Session Resume Test (Section 25). A real, separate Claude Code
 * session was not launched programmatically as part of this automated
 * suite — this test instead proves the *mechanical* half of resumption:
 * that everything a fresh runtime would need is reconstructable from the
 * materialized `.aiom/`-shaped directory alone, using fresh top-level
 * kernel calls that read only from disk and never touch the
 * BootstrapResult object this test's own "Bootstrap step" produced. See
 * the Initiative 8 completion report for the accompanying real-agent
 * cross-check and the manual protocol for a genuinely separate session.
 */
describe('fresh-session resume (disk-only reconstruction)', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reconstructs Profile, Capability Activation, Work Item, validation, and Orchestrator disposition from .aiom/ alone', () => {
    const projectDir = mkdtempSync(path.join(tmpdir(), 'aiom-bootstrap-resume-'));
    tempDirs.push(projectDir);

    // --- Bootstrap step: produces durable state and is then discarded ----
    const decisions: BootstrapReasoningDecisions = {
      durableStateJustified: true,
      profile: {
        projectName: 'Neighborhood Running Club Website',
        projectIntent: 'A simple website for a neighborhood running club.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'not-yet-started',
        signals: {
          ...allUnknownSignals(),
          repository_backed: signal('true', 'owner-stated'),
          software_producing: signal('true', 'owner-stated'),
        },
        consequenceConfirmations: {
          consequential_external_action: confirmation('no', 'owner-confirmed'),
          sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
        },
      },
      bundles: [{ bundleId: 'software-engineering', relevant: 'true', provenance: 'owner-stated' }],
      capabilities: [
        { capabilityId: 'software-implementation', status: 'required', provenance: 'owner-confirmed' },
      ],
      bootstrapReadyAssessment: readyAssessment(),
      bootstrapReady: true,
      nextGovernedAction: 'Begin implementation planning for the running club website.',
      workItem: {
        id: 'resume-proof-item',
        title: 'Resume proof item',
        objective: 'A Work Item used only to prove fresh-session resumption from disk.',
        stage: 'research',
        currentResponsibility: 'orchestrator',
      },
    };

    (() => {
      const bootstrapResult = runBootstrap(
        { ownerContext: decisions.profile.projectIntent },
        decisions,
        { materializeTo: projectDir },
      );
      expect(bootstrapResult.materialized).toBeDefined();
    })();

    // --- Fresh-session step: only the directory path survives ------------
    const stateDir = path.join(projectDir, '.aiom');

    const validation = validateProjectState(stateDir);
    expect(validation.valid).toBe(true);

    const state = loadProjectState(stateDir);
    expect(state.profile?.result.ok).toBe(true);
    if (state.profile?.result.ok) {
      expect(state.profile.result.data.frontmatter.project.name).toBe(
        'Neighborhood Running Club Website',
      );
    }
    expect(state.capabilityActivation?.result.ok).toBe(true);
    expect(state.workItems).toHaveLength(1);
    expect(state.workItems[0]?.result.ok).toBe(true);
    if (state.workItems[0]?.result.ok) {
      expect(state.workItems[0].result.data.frontmatter.id).toBe('resume-proof-item');
      expect(state.workItems[0].result.data.frontmatter.stage).toBe('research');
    }

    const orchestration = orchestrate(stateDir, {
      workItemId: 'resume-proof-item',
      fromStage: 'research',
      toStage: 'implementation',
    });
    expect(orchestration.disposition).toBe('ready-for-governed-execution');

    // Project-facing discovery assets are present and self-describing,
    // without depending on this test's own conversational context.
    const agents = readFileSync(path.join(projectDir, 'AGENTS.md'), 'utf8');
    expect(agents).toContain('.aiom/profile.md');
    expect(agents).toContain('.aiom/work/');
    expect(agents).toContain('.aiom/approvals/');
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'core.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'safeguards.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'capabilities', 'bundles.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, '.aiom', 'seed', 'capabilities', 'capabilities.md'))).toBe(
      true,
    );
  });
});
