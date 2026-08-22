import { describe, expect, it } from 'vitest';
import { bootstrapReasoningDecisionsSchema } from '../../../src/invocation/contracts/decisions.js';
import type { BootstrapReasoningDecisions } from '../../../src/kernel/bootstrap/index.js';
import { allUnknownSignals, confirmation, readyAssessment, signal } from '../../kernel/helpers/bootstrap-fixtures.js';

/**
 * Drift protection (Initiative 10 Section 7): the invocation boundary's
 * Zod schema must accept exactly what the kernel's own
 * BootstrapReasoningDecisions TypeScript type accepts, and produce a
 * value assignable back to it. If the two diverge, this file fails to
 * typecheck (the `satisfies`/assignment below) before any runtime
 * assertion even runs.
 */

function minimalDecisions(): BootstrapReasoningDecisions {
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

describe('bootstrapReasoningDecisionsSchema — TS/Zod drift protection', () => {
  it('a value typed as the kernel BootstrapReasoningDecisions interface parses successfully', () => {
    const decisions: BootstrapReasoningDecisions = minimalDecisions();
    const parsed = bootstrapReasoningDecisionsSchema.parse(decisions);
    // Compile-time assertion: the schema's inferred output must remain
    // assignable back to the kernel's own type.
    const _assignableBack: BootstrapReasoningDecisions = parsed;
    expect(_assignableBack.durableStateJustified).toBe(false);
  });

  it('accepts a fully-populated decisions object including optional nested decisions', () => {
    const decisions: BootstrapReasoningDecisions = {
      ...minimalDecisions(),
      durableStateJustified: true,
      durableStateRationale: 'needs durable continuation',
      bundles: [{ bundleId: 'software-engineering', relevant: 'true', rationale: 'x', evidence: 'x', provenance: 'owner-stated' }],
      capabilities: [
        {
          capabilityId: 'software-implementation',
          status: 'required',
          provenance: 'ai-inferred',
          rationale: 'x',
          evidence: 'x',
          reconsiderationTrigger: 'x',
          runtimeRequirementReference: 'repository-write',
          standardsGates: ['gate-a'],
        },
      ],
      workItem: {
        id: 'do-the-thing',
        title: 'Do the thing',
        objective: 'Do it',
        stage: 'research',
        activeCapability: 'software-implementation',
        bundleReferences: ['software-engineering'],
        authorityRequirement: 'none',
        currentResponsibility: 'orchestrator',
        objectiveNarrative: 'narrative',
        contextNarrative: 'context',
      },
      approvalNeed: {
        id: 'approve-x',
        relatedWorkItemId: 'do-the-thing',
        targetContext: 'x',
        requestedDecision: 'x',
        scope: 'x',
        ownerIdentity: 'Owner',
        mode: 'one-time',
        provenance: 'owner-stated',
      },
    };
    expect(() => bootstrapReasoningDecisionsSchema.parse(decisions)).not.toThrow();
  });

  it('rejects a decisions object missing a required signal field', () => {
    const decisions = minimalDecisions() as unknown as Record<string, unknown>;
    const profile = decisions.profile as Record<string, unknown>;
    const signals = profile.signals as Record<string, unknown>;
    delete signals.repository_backed;
    const result = bootstrapReasoningDecisionsSchema.safeParse(decisions);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid signal value', () => {
    const decisions = minimalDecisions();
    const invalid = {
      ...decisions,
      profile: {
        ...decisions.profile,
        signals: { ...decisions.profile.signals, repository_backed: signal('maybe' as never) },
      },
    };
    const result = bootstrapReasoningDecisionsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
