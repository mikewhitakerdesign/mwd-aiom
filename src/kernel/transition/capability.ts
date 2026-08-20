import type { CapabilityActivationRecord } from '../schemas/capability-activation.js';
import type { CapabilityIndex } from '../validation/capability-index.js';
import { isRuntimeRequirementId, type RuntimeEvidenceMap } from '../runtime/index.js';
import { gateIssue, type GateIssue } from './types.js';

/**
 * Deterministic capability-activation checking for the Transition Gate
 * (Initiative 6 brief Section 14). This checks activation, never
 * authorization — a `required` capability makes the gate's capability
 * check pass, but never by itself satisfies an authority-boundary check
 * elsewhere in the gate (see gate.ts and Falsification Gate B question 6).
 *
 * Interpretation adopted, per the brief's suggested reading (Section 14),
 * because nothing in seed/capabilities/ contradicts it:
 * - required        -> active for current project need (passes).
 * - on-demand        -> potentially available but activation may need
 *                       explicit work context (indeterminate).
 * - recommended      -> a recommendation, not activation (blocked).
 * - deferred         -> not active now (blocked).
 * - not-applicable   -> invalid for use (blocked).
 * - no recorded entry -> activation status not recorded for this project
 *                        (indeterminate).
 *
 * Initiative 7 resolves the previously unconditional
 * `runtime-prerequisite-unverified` indeterminate for the `required` case:
 * when `runtimeEvidence` is supplied and the capability's recorded
 * `runtime_requirement_reference` exactly matches a known Runtime
 * Requirement ID (see runtime/requirements.ts), the matching evidence
 * resolves this dimension deterministically — available clears the issue,
 * unavailable blocks it, and unknown (or a reference that isn't a
 * recognized ID at all, e.g. still free prose) leaves it indeterminate,
 * exactly as before Initiative 7. Activation and runtime availability
 * remain independent checks either way (Falsification Gate B question 7):
 * this never treats runtime evidence as itself proof of activation, and
 * never treats activation as itself proof of runtime availability.
 */
export function evaluateCapabilityRequirement(
  capabilityId: string,
  index: CapabilityIndex,
  capabilityActivation: CapabilityActivationRecord,
  runtimeEvidence?: RuntimeEvidenceMap,
): GateIssue[] {
  if (!index.capabilities.has(capabilityId)) {
    return [
      gateIssue(
        'unknown-capability-id',
        'error',
        `unknown Atomic Capability ID: ${capabilityId}`,
        'capabilityId',
      ),
    ];
  }

  const entry = capabilityActivation.capabilities.find(
    (capability) => capability.capability_id === capabilityId,
  );

  if (!entry) {
    return [
      gateIssue(
        'capability-activation-unrecorded',
        'indeterminate',
        `capability "${capabilityId}" has no activation entry in the Capability Activation Record`,
        'capabilityId',
      ),
    ];
  }

  const issues: GateIssue[] = [];

  switch (entry.status) {
    case 'not-applicable':
      issues.push(
        gateIssue(
          'capability-not-applicable',
          'error',
          `capability "${capabilityId}" is marked not-applicable`,
          'capabilityId',
        ),
      );
      break;
    case 'deferred':
      issues.push(
        gateIssue(
          'capability-not-active',
          'error',
          `capability "${capabilityId}" is deferred, not active now`,
          'capabilityId',
        ),
      );
      break;
    case 'recommended':
      issues.push(
        gateIssue(
          'capability-not-activated',
          'error',
          `capability "${capabilityId}" is recommended but not activated`,
          'capabilityId',
        ),
      );
      break;
    case 'on-demand':
      issues.push(
        gateIssue(
          'capability-on-demand-context-required',
          'indeterminate',
          `capability "${capabilityId}" is on-demand; activation for this specific transition cannot be mechanically confirmed`,
          'capabilityId',
        ),
      );
      break;
    case 'required':
      if (entry.runtime_requirement_reference) {
        issues.push(
          ...evaluateRuntimePrerequisite(
            capabilityId,
            entry.runtime_requirement_reference,
            runtimeEvidence,
          ),
        );
      }
      break;
  }

  return issues;
}

function evaluateRuntimePrerequisite(
  capabilityId: string,
  reference: string,
  runtimeEvidence: RuntimeEvidenceMap | undefined,
): GateIssue[] {
  const evidence =
    runtimeEvidence && isRuntimeRequirementId(reference) ? runtimeEvidence.get(reference) : undefined;

  if (evidence?.availability === 'available') {
    return [];
  }

  if (evidence?.availability === 'unavailable') {
    return [
      gateIssue(
        'runtime-requirement-unavailable',
        'error',
        `capability "${capabilityId}" requires runtime capability "${reference}", which Runtime Probe evidence reports unavailable (${evidence.reason ?? evidence.mechanism})`,
        'capabilityId',
        reference,
      ),
    ];
  }

  return [
    gateIssue(
      'runtime-prerequisite-unverified',
      'indeterminate',
      evidence
        ? `capability "${capabilityId}" records a runtime requirement ("${reference}") but Runtime Probe evidence reports it as unknown`
        : `capability "${capabilityId}" records a runtime requirement ("${reference}") but no Runtime Probe evidence exists yet to confirm it is available`,
      'capabilityId',
      isRuntimeRequirementId(reference) ? reference : undefined,
    ),
  ];
}
