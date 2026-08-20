import { existsSync, mkdtempSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { runBootstrap } from '../../../src/kernel/bootstrap/bootstrap.js';
import type { BootstrapReasoningDecisions } from '../../../src/kernel/bootstrap/types.js';
import type { ProposedTransition } from '../../../src/kernel/transition/types.js';
import { createSimulatedAdapter } from '../helpers/runtime-fixtures.js';
import { allUnknownSignals, confirmation, readyAssessment, signal } from '../helpers/bootstrap-fixtures.js';

const fixturesRoot = fileURLToPath(new URL('../../fixtures/bootstrap/', import.meta.url));
const brownfieldRepoFixture = path.join(fixturesRoot, 'brownfield-repo');

describe('runBootstrap', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function tempDir(prefix: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  }

  // --- Scenario A: minimal research-only idea -----------------------------

  it('Scenario A (research-only): stays ephemeral, does not write .aiom/, next action is research', () => {
    const decisions: BootstrapReasoningDecisions = {
      durableStateJustified: false,
      durableStateRationale:
        'A bounded research question with no repository, no continuation need, and no authority to track yet.',
      profile: {
        projectName: 'Chicago Hill-Repeat Finder (concept)',
        projectIntent:
          "Investigate whether a website helping Chicago runners find good hills for workouts is worth building.",
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: false,
        lifecyclePosition: 'not-yet-assessed',
        signals: {
          ...allUnknownSignals(),
          content_heavy_narrative_heavy: signal('unknown', 'unknown'),
        },
        consequenceConfirmations: {
          consequential_external_action: confirmation('unresolved'),
          sensitive_or_high_consequence_data: confirmation('unresolved'),
        },
        contextNarrative: 'Owner is not yet sure this is worth building.',
      },
      bundles: [
        { bundleId: 'content-publication', relevant: 'unknown', rationale: 'possible if it proceeds' },
        { bundleId: 'software-engineering', relevant: 'unknown' },
      ],
      capabilities: [
        { capabilityId: 'research-discovery', status: 'required', provenance: 'ai-inferred', rationale: 'the entire next step is research' },
      ],
      bootstrapReadyAssessment: readyAssessment({
        existingStateAssessmentAdequate: false,
        consequenceQuestionsResolvedWhereNecessary: false,
      }),
      bootstrapReady: false,
      nextGovernedAction: 'Research whether runner demand and available hill data justify building anything.',
      unresolvedItems: ['Is there enough runner demand to justify building this?'],
    };

    const result = runBootstrap({ ownerContext: decisions.profile.projectIntent }, decisions);

    expect(result.mode).toBe('ephemeral');
    expect(result.materialized).toBeUndefined();
    expect(result.workItem).toBeUndefined();
    expect(result.nextGovernedAction).toMatch(/research/i);
    expect(result.nextGovernedAction).not.toMatch(/implement/i);
    expect(result.validation.valid).toBe(true);
  });

  // --- Scenario B: simple greenfield website ------------------------------

  it('Scenario B (greenfield website): aiom-managed, materializes, multiple bundles, no auto sensitive/external assumptions', () => {
    const projectDir = tempDir('aiom-bootstrap-scenario-b-');
    const decisions: BootstrapReasoningDecisions = {
      durableStateJustified: true,
      durableStateRationale: 'A repository-backed, multi-session build needs durable continuation and authority tracking.',
      profile: {
        projectName: 'Neighborhood Running Club Website',
        projectIntent:
          'A simple website for a neighborhood running club: club info, upcoming runs, and a basic calendar, eventually deployed from a GitHub repository.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'not-yet-started',
        signals: {
          repository_backed: signal('true', 'owner-stated'),
          software_producing: signal('true', 'owner-stated'),
          ui_bearing: signal('true', 'owner-stated'),
          externally_acting: signal('unknown', 'unknown'),
          persistent_state_dependent: signal('false', 'ai-inferred', 'a basic calendar does not obviously need a database yet'),
          data_sensitive: signal('unknown', 'unknown'),
          regulated_high_risk_possible: signal('false', 'ai-inferred'),
          long_running_continuous: signal('false', 'ai-inferred'),
          content_heavy_narrative_heavy: signal('true', 'owner-stated', 'club info and run listings are content'),
        },
        consequenceConfirmations: {
          consequential_external_action: confirmation('unresolved'),
          sensitive_or_high_consequence_data: confirmation('unresolved'),
        },
        contextNarrative: 'Owner wants a small public site for their running club.',
      },
      bundles: [
        { bundleId: 'repository-versioned-delivery', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'software-engineering', relevant: 'true', provenance: 'ai-inferred' },
        { bundleId: 'web-ui-experience', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'content-publication', relevant: 'true', provenance: 'ai-inferred' },
        { bundleId: 'external-action-integration', relevant: 'unknown' },
        { bundleId: 'persistent-operation-monitoring', relevant: 'false', provenance: 'ai-inferred' },
      ],
      capabilities: [
        { capabilityId: 'repository-inspection', status: 'on-demand', provenance: 'ai-inferred' },
        { capabilityId: 'bounded-delivery', status: 'deferred', provenance: 'ai-inferred', rationale: 'not until design/scope settles' },
        { capabilityId: 'software-implementation', status: 'deferred', provenance: 'ai-inferred' },
        { capabilityId: 'deterministic-validation', status: 'deferred', provenance: 'ai-inferred' },
        { capabilityId: 'ui-implementation', status: 'deferred', provenance: 'ai-inferred' },
        { capabilityId: 'research-discovery', status: 'required', provenance: 'ai-inferred' },
        { capabilityId: 'external-action-execution', status: 'not-applicable', provenance: 'ai-inferred' },
        { capabilityId: 'persistent-continuation', status: 'not-applicable', provenance: 'ai-inferred' },
      ],
      bootstrapReadyAssessment: readyAssessment({
        capabilityConfigurationSufficient: false,
      }),
      bootstrapReady: false,
      nextGovernedAction: 'Clarify page/content scope and hosting target before any implementation begins.',
      unresolvedItems: ['What pages/content are actually needed?', 'Where will this be deployed?'],
      workItem: {
        id: 'clarify-site-scope',
        title: 'Clarify running club website scope',
        objective: 'Resolve page/content scope and hosting target before implementation planning begins.',
        stage: 'research',
        currentResponsibility: 'orchestrator',
        objectiveNarrative: 'Determine what pages and content are actually needed.',
      },
    };

    const result = runBootstrap({ ownerContext: decisions.profile.projectIntent }, decisions, {
      materializeTo: projectDir,
    });

    expect(result.mode).toBe('aiom-managed');
    expect(result.materialized).toBeDefined();
    expect(existsSync(result.materialized!.profilePath)).toBe(true);
    expect(result.workItem?.frontmatter.stage).toBe('research');
    expect(result.workItem?.frontmatter.stage).not.toBe('implementation');
    expect(result.validation.valid).toBe(true);

    // No automatic sensitive-data assumption, no automatic external-action authorization.
    expect(result.profile.frontmatter.consequence_confirmations.sensitive_or_high_consequence_data.value).toBe(
      'unresolved',
    );
    expect(result.profile.frontmatter.consequence_confirmations.consequential_external_action.value).toBe(
      'unresolved',
    );
    expect(result.approval).toBeUndefined();

    // Multiple bundles relevant, but not every candidate capability in them got activated.
    const relevantBundleCount = result.bundleRelevance.filter((b) => b.relevant === 'true').length;
    expect(relevantBundleCount).toBeGreaterThan(1);
    const activatedNow = result.capabilityActivation.filter((c) => c.status === 'required').length;
    const deferredCount = result.capabilityActivation.filter((c) => c.status === 'deferred').length;
    expect(deferredCount).toBeGreaterThan(0);
    expect(activatedNow).toBeLessThan(result.capabilityActivation.length);
  });

  // --- Scenario C: external-action automation -----------------------------

  it('Scenario C (external-action automation): consequence confirmation stays unresolved, activation never becomes authorization, first Work Item is not "submit applications"', () => {
    const decisions: BootstrapReasoningDecisions = {
      durableStateJustified: true,
      durableStateRationale: 'Recurring, unattended operation against external systems needs durable state and authority tracking.',
      profile: {
        projectName: 'Job Application Assistant (concept)',
        projectIntent:
          'A system that finds jobs matching Owner criteria, prepares application material, and eventually submits applications on the Owner\'s behalf.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: false,
        lifecyclePosition: 'not-yet-started',
        signals: {
          ...allUnknownSignals(),
          externally_acting: signal('true', 'owner-stated'),
          long_running_continuous: signal('true', 'owner-stated'),
          persistent_state_dependent: signal('true', 'ai-inferred'),
        },
        consequenceConfirmations: {
          // Attempted resolution from AI inference — must not be trusted.
          consequential_external_action: confirmation('yes', 'ai-inferred', 'submitting applications is clearly external action'),
          sensitive_or_high_consequence_data: confirmation('unresolved'),
        },
      },
      bundles: [
        { bundleId: 'external-action-integration', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'persistent-operation-monitoring', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'software-engineering', relevant: 'true', provenance: 'ai-inferred' },
      ],
      capabilities: [
        { capabilityId: 'external-action-execution', status: 'required', provenance: 'ai-inferred', rationale: 'submitting applications is the whole point' },
        { capabilityId: 'persistent-continuation', status: 'required', provenance: 'ai-inferred' },
        { capabilityId: 'research-discovery', status: 'required', provenance: 'ai-inferred' },
      ],
      bootstrapReadyAssessment: readyAssessment({
        consequenceQuestionsResolvedWhereNecessary: false,
        ownerDecisionsObtainedWhereRequired: false,
      }),
      bootstrapReady: false,
      nextGovernedAction: 'Confirm with the Owner whether consequential external action (submitting applications) is in scope, and design the matching/preparation flow before any submission capability is authorized.',
      unresolvedItems: [
        'Owner has not yet confirmed consequential external action for this project.',
      ],
      workItem: {
        id: 'design-matching-flow',
        title: 'Design job-matching and application-preparation flow',
        objective: 'Design how candidate jobs are matched and application material is prepared, before any submission step is authorized.',
        stage: 'research',
        currentResponsibility: 'orchestrator',
      },
      approvalNeed: {
        id: 'authorize-application-submission',
        relatedWorkItemId: 'design-matching-flow',
        targetContext: 'Job Application Assistant — automated application submission',
        requestedDecision: 'Authorize this project to submit job applications on the Owner\'s behalf.',
        scope: 'Submitting applications to matched postings only; does not cover any other external action.',
        ownerIdentity: 'Owner',
        mode: 'durable-policy',
      },
    };

    const result = runBootstrap({ ownerContext: decisions.profile.projectIntent }, decisions);

    // The mandatory consequence question was NOT silently resolved by AI inference.
    expect(result.profile.frontmatter.consequence_confirmations.consequential_external_action.value).toBe(
      'unresolved',
    );
    expect(result.requiredOwnerConfirmations).toContain('consequential_external_action');

    // The capability is activated, but that is not authorization.
    const externalActionEntry = result.capabilityActivation.find(
      (c) => c.capability_id === 'external-action-execution',
    );
    expect(externalActionEntry?.status).toBe('required');
    expect(result.approval).toBeDefined();
    expect(result.approval?.status).toBe('pending');
    expect(result.requiredOwnerConfirmations).toContain(`owner-approval:${result.approval?.id}`);

    // The first Work Item is not "submit applications".
    expect(result.workItem?.frontmatter.objective.toLowerCase()).not.toContain('submit');
    expect(result.workItem?.frontmatter.stage).toBe('research');
  });

  // --- Scenario D: existing brownfield repository -------------------------

  it('Scenario D (brownfield): inspects existing repo, preserves its content, materializes only missing AIOM assets', () => {
    const projectDir = tempDir('aiom-bootstrap-scenario-d-');
    cpSync(brownfieldRepoFixture, projectDir, { recursive: true });

    const inspectionOnly = runBootstrap(
      { ownerContext: 'Bootstrap this existing repository using MWD AIOM.', projectPath: projectDir },
      minimalEphemeralDecisions(),
    );
    expect(inspectionOnly.inspection.exists).toBe(true);
    expect(inspectionOnly.inspection.hasPackageManifest).toBe(true);
    expect(inspectionOnly.inspection.hasReadme).toBe(true);
    expect(inspectionOnly.inspection.hasExistingAiomState).toBe(false);

    const decisions: BootstrapReasoningDecisions = {
      durableStateJustified: true,
      durableStateRationale: 'An existing, ongoing codebase needs durable continuation.',
      profile: {
        projectName: 'Brownfield Fixture Project',
        projectIntent: 'Bring an existing repository under AIOM governance.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'active-development',
        signals: {
          ...allUnknownSignals(),
          repository_backed: signal('true', 'directly-inspected'),
          software_producing: signal('true', 'directly-inspected'),
        },
        consequenceConfirmations: {
          consequential_external_action: confirmation('unresolved'),
          sensitive_or_high_consequence_data: confirmation('unresolved'),
        },
        existingStateNarrative: 'Existing package.json, README.md, src/, and docs/ were found; no prior .aiom/ state existed.',
      },
      bundles: [{ bundleId: 'software-engineering', relevant: 'true', provenance: 'ai-inferred' }],
      capabilities: [
        { capabilityId: 'repository-inspection', status: 'required', provenance: 'ai-inferred' },
      ],
      bootstrapReadyAssessment: readyAssessment({ consequenceQuestionsResolvedWhereNecessary: false }),
      bootstrapReady: false,
      nextGovernedAction: 'Inspect existing source structure in more depth before proposing any change.',
      unresolvedItems: ['Consequence questions not yet confirmed by the Owner.'],
    };

    const result = runBootstrap({ ownerContext: decisions.profile.projectIntent, projectPath: projectDir }, decisions, {
      materializeTo: projectDir,
    });

    expect(result.materialized).toBeDefined();
    // Pre-existing brownfield content untouched.
    expect(readFileSync(path.join(projectDir, 'package.json'), 'utf8')).toContain('brownfield-fixture');
    expect(existsSync(path.join(projectDir, 'src', 'index.js'))).toBe(true);
    expect(existsSync(path.join(projectDir, 'docs', 'notes.md'))).toBe(true);
    // Missing AIOM assets were added alongside it.
    expect(existsSync(path.join(projectDir, '.aiom', 'profile.md'))).toBe(true);
    expect(existsSync(path.join(projectDir, 'AGENTS.md'))).toBe(true);
  });

  // --- Scenario E: information-rich application ---------------------------

  it('Scenario E (information-rich): consumes supplied context instead of re-asking, surfaces unresolved consequence questions, next action reflects lifecycle position not implementation', () => {
    const existingContext = [
      'Product brief: a patient-facing intake and scheduling application for a multi-location clinic network.',
      'Existing design system and component library already exist from a prior phase.',
      'Backend API contracts are already drafted; no implementation has started.',
    ];

    const decisions: BootstrapReasoningDecisions = {
      durableStateJustified: true,
      durableStateRationale: 'A multi-session, multi-bundle build with real authority questions needs durable state.',
      profile: {
        projectName: 'Clinic Intake & Scheduling App',
        projectIntent: 'A patient-facing intake and scheduling application for a multi-location clinic network.',
        ownerIdentity: 'Owner',
        existingStateAssessmentPerformed: true,
        lifecyclePosition: 'design-complete-implementation-not-started',
        signals: {
          repository_backed: signal('true', 'owner-stated'),
          software_producing: signal('true', 'owner-stated'),
          ui_bearing: signal('true', 'owner-stated'),
          externally_acting: signal('unknown', 'unknown'),
          persistent_state_dependent: signal('true', 'owner-stated'),
          data_sensitive: signal('unknown', 'unknown'),
          regulated_high_risk_possible: signal('true', 'ai-inferred', 'patient intake data is plausibly regulated'),
          long_running_continuous: signal('false', 'ai-inferred'),
          content_heavy_narrative_heavy: signal('false', 'ai-inferred'),
        },
        consequenceConfirmations: {
          consequential_external_action: confirmation('unresolved'),
          sensitive_or_high_consequence_data: confirmation('unresolved'),
        },
        contextNarrative: existingContext.join(' '),
      },
      bundles: [
        { bundleId: 'repository-versioned-delivery', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'software-engineering', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'web-ui-experience', relevant: 'true', provenance: 'owner-stated' },
        { bundleId: 'external-action-integration', relevant: 'unknown' },
      ],
      capabilities: [
        { capabilityId: 'software-implementation', status: 'recommended', provenance: 'ai-inferred' },
        { capabilityId: 'ui-implementation', status: 'recommended', provenance: 'ai-inferred' },
        { capabilityId: 'deterministic-validation', status: 'recommended', provenance: 'ai-inferred' },
      ],
      bootstrapReadyAssessment: readyAssessment({
        consequenceQuestionsResolvedWhereNecessary: false,
      }),
      bootstrapReady: false,
      nextGovernedAction:
        'Confirm the two consequence questions with the Owner (external action, sensitive data) before implementation planning, given design is already complete.',
      unresolvedItems: [
        'Owner has not yet confirmed whether patient data handling is in scope for consequence purposes.',
      ],
      workItem: {
        id: 'confirm-consequence-questions',
        title: 'Confirm consequence questions before implementation planning',
        objective: 'Resolve external-action and sensitive-data confirmations before implementation planning begins.',
        stage: 'approval',
        currentResponsibility: 'owner',
      },
    };

    const result = runBootstrap(
      { ownerContext: decisions.profile.projectIntent, existingContext },
      decisions,
    );

    // Context supplied up front is reflected, not re-requested.
    expect(result.profile.frontmatter.lifecycle_position).toBe('design-complete-implementation-not-started');
    expect(result.unresolvedQuestions.join(' ')).not.toMatch(/what is this project/i);

    // Consequential questions correctly surfaced as unresolved, not silently answered.
    expect(result.requiredOwnerConfirmations).toContain('consequential_external_action');
    expect(result.requiredOwnerConfirmations).toContain('sensitive_or_high_consequence_data');

    // Next action reflects lifecycle position (confirm/approve), not a default jump to implementation.
    expect(result.workItem?.frontmatter.stage).not.toBe('implementation');
    expect(result.nextGovernedAction.toLowerCase()).toContain('confirm');
  });

  // --- Guardrails ----------------------------------------------------------

  it('never materializes .aiom/ state just because Bootstrap was invoked, even in aiom-managed mode, without an explicit materializeTo destination', () => {
    const decisions = minimalManagedDecisions();
    const result = runBootstrap({ ownerContext: 'x' }, decisions);
    expect(result.mode).toBe('aiom-managed');
    expect(result.materialized).toBeUndefined();
  });

  it('never creates a Work Item in ephemeral mode even if a reasoning decision mistakenly supplies one', () => {
    const decisions: BootstrapReasoningDecisions = {
      ...minimalEphemeralDecisions(),
      workItem: {
        id: 'should-not-exist',
        title: 'x',
        objective: 'x',
        stage: 'research',
        currentResponsibility: 'orchestrator',
      },
    };
    const result = runBootstrap({ ownerContext: 'x' }, decisions);
    expect(result.mode).toBe('ephemeral');
    expect(result.workItem).toBeUndefined();
  });

  it('composes Runtime Evidence and the Orchestrator once state is materialized and a transition is proposed', () => {
    const projectDir = tempDir('aiom-bootstrap-orchestration-');
    const decisions: BootstrapReasoningDecisions = {
      ...minimalManagedDecisions(),
      workItem: {
        id: 'orchestration-probe',
        title: 'Orchestration probe',
        objective: 'A trivial Work Item to exercise Runtime Probe + Orchestrator composition.',
        stage: 'research',
        currentResponsibility: 'orchestrator',
      },
    };

    const proposedTransition: ProposedTransition = {
      workItemId: 'orchestration-probe',
      fromStage: 'research',
      toStage: 'implementation',
    };

    const result = runBootstrap({ ownerContext: 'x' }, decisions, {
      materializeTo: projectDir,
      runtimeAdapter: createSimulatedAdapter('bootstrap-test-adapter', { 'filesystem-read': 'available' }),
      runtimeRequirementIds: ['filesystem-read'],
      proposedTransition,
    });

    expect(result.runtimeEvidence?.get('filesystem-read')?.availability).toBe('available');
    expect(result.orchestration?.disposition).toBe('ready-for-governed-execution');
  });

  it('never fabricates approval: activating a capability with an authority boundary produces no approved Owner Approval Artifact', () => {
    const decisions: BootstrapReasoningDecisions = {
      ...minimalManagedDecisions(),
      capabilities: [
        { capabilityId: 'external-action-execution', status: 'required', provenance: 'ai-inferred' },
      ],
    };
    const result = runBootstrap({ ownerContext: 'x' }, decisions);
    expect(result.approval).toBeUndefined();
  });
});

function minimalEphemeralDecisions(): BootstrapReasoningDecisions {
  return {
    durableStateJustified: false,
    profile: {
      projectName: 'x',
      projectIntent: 'x',
      ownerIdentity: 'x',
      existingStateAssessmentPerformed: false,
      lifecyclePosition: 'research',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('unresolved'),
        sensitive_or_high_consequence_data: confirmation('unresolved'),
      },
    },
    bundles: [],
    capabilities: [],
    bootstrapReadyAssessment: readyAssessment(),
    bootstrapReady: false,
    nextGovernedAction: 'research',
    unresolvedItems: [],
  };
}

function minimalManagedDecisions(): BootstrapReasoningDecisions {
  return {
    ...minimalEphemeralDecisions(),
    durableStateJustified: true,
    profile: {
      ...minimalEphemeralDecisions().profile,
      consequenceConfirmations: {
        consequential_external_action: confirmation('no', 'owner-confirmed'),
        sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
      },
    },
  };
}
