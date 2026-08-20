import { projectProfileFrontmatterSchema, projectProfileSchema } from '../schemas/project-profile.js';
import type { ConfirmationValue } from '../schemas/common.js';
import type { ProjectProfile } from '../schemas/project-profile.js';
import {
  SEED_VERSION,
  type BootstrapReasoningDecisions,
  type ConfirmationDecision,
  type ConsequenceConfirmationDecisions,
} from './types.js';

const OWNER_PROVENANCE = new Set(['owner-stated', 'owner-confirmed']);

/**
 * The consequence-confirmation guardrail (Section 7, Falsification Gate D
 * question 3): the two mandatory consequence questions may only be
 * resolved away from "unresolved" when their provenance is
 * `owner-stated` or `owner-confirmed`. A reasoning runtime attempting to
 * resolve one from `ai-inferred`, `directly-inspected`, or any other
 * provenance is deterministically overridden back to `unresolved` here —
 * Bootstrap mechanics never trust reasoning input to silently promote
 * inference into Owner-confirmed fact, regardless of what the reasoning
 * decisions claim.
 */
function enforceConfirmationProvenance(decision: ConfirmationDecision): {
  readonly value: ConfirmationValue;
  readonly overridden: boolean;
} {
  if (decision.value !== 'unresolved' && !OWNER_PROVENANCE.has(decision.provenance)) {
    return {
      overridden: true,
      value: {
        value: 'unresolved',
        provenance: decision.provenance,
        rationale:
          `Bootstrap will not resolve this consequence confirmation from "${decision.provenance}" ` +
          'provenance; Owner confirmation (owner-stated or owner-confirmed) is required.',
      },
    };
  }
  return {
    overridden: false,
    value: { value: decision.value, provenance: decision.provenance, ...(decision.rationale ? { rationale: decision.rationale } : {}) },
  };
}

function buildConsequenceConfirmations(
  decisions: ConsequenceConfirmationDecisions,
): { readonly value: ProjectProfile['frontmatter']['consequence_confirmations']; readonly overrideNotes: readonly string[] } {
  const externalAction = enforceConfirmationProvenance(decisions.consequential_external_action);
  const sensitiveData = enforceConfirmationProvenance(decisions.sensitive_or_high_consequence_data);

  const overrideNotes: string[] = [];
  if (externalAction.overridden) {
    overrideNotes.push(
      'Owner confirmation needed: will this project perform consequential external actions? (an attempted non-Owner resolution was not accepted)',
    );
  }
  if (sensitiveData.overridden) {
    overrideNotes.push(
      'Owner confirmation needed: will this project handle sensitive/private/high-consequence data? (an attempted non-Owner resolution was not accepted)',
    );
  }

  return {
    value: {
      consequential_external_action: externalAction.value,
      sensitive_or_high_consequence_data: sensitiveData.value,
    },
    overrideNotes,
  };
}

function buildBody(contextNarrative: string | undefined, existingStateNarrative: string | undefined): string {
  const sections = [
    '## Context',
    '',
    (contextNarrative ?? '').trim(),
    '',
    '## Existing-State Assessment',
    '',
    (existingStateNarrative ?? '').trim(),
  ];
  return sections.join('\n').trim();
}

export type ProfileBuildInput = Pick<
  BootstrapReasoningDecisions,
  'profile' | 'unresolvedItems' | 'bootstrapReady' | 'nextGovernedAction'
>;

/**
 * Assembles a candidate Project Profile from the reasoning contract
 * (Section 8). Applies the consequence-confirmation guardrail, then
 * schema-validates the result via `.parse` (not `.safeParse`) so an
 * invalid or incomplete reasoning decision fails loudly instead of
 * producing a silently-malformed artifact. Takes only the slice of
 * BootstrapReasoningDecisions this construction actually needs — a full
 * BootstrapReasoningDecisions object satisfies this type structurally, so
 * bootstrap.ts's call site needs no change.
 */
export function buildCandidateProfile(
  decisions: ProfileBuildInput,
  now: Date = new Date(),
): ProjectProfile {
  const { profile } = decisions;
  const { value: consequenceConfirmations, overrideNotes } = buildConsequenceConfirmations(
    profile.consequenceConfirmations,
  );

  const unresolvedItems = Array.from(
    new Set([...(decisions.unresolvedItems ?? []), ...overrideNotes]),
  );

  const frontmatter = projectProfileFrontmatterSchema.parse({
    seed_version: SEED_VERSION,
    project: { name: profile.projectName, intent: profile.projectIntent },
    owner: { identity: profile.ownerIdentity },
    existing_state_assessment: {
      performed: profile.existingStateAssessmentPerformed,
      ...(profile.existingStateAssessmentPerformed
        ? { performed_at: now.toISOString() }
        : {}),
    },
    lifecycle_position: profile.lifecyclePosition,
    signals: profile.signals,
    consequence_confirmations: consequenceConfirmations,
    bootstrap: {
      ready: decisions.bootstrapReady,
      ...(unresolvedItems.length > 0 ? { unresolved_items: unresolvedItems } : {}),
      next_governed_action: decisions.nextGovernedAction,
    },
    ...(profile.runtimeRequirements ? { runtime_requirements: profile.runtimeRequirements } : {}),
  });

  return projectProfileSchema.parse({
    frontmatter,
    body: buildBody(profile.contextNarrative, profile.existingStateNarrative),
  });
}
