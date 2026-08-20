/**
 * The smallest stable, provider-neutral Runtime Requirement ID vocabulary
 * needed to make an Atomic Capability's abstract runtime requirement, or a
 * project's recorded `runtime_requirement_reference`, mechanically
 * comparable against Runtime Probe evidence.
 *
 * This is a bounded normalization, not a redesign of the Capability
 * Architecture (see seed/capabilities/capabilities.md): capability
 * definitions keep their existing free-text "Runtime requirement
 * (abstract)" prose unchanged. Only two of the eight v0.1 capabilities
 * (`repository-inspection`, `bounded-delivery`) already describe their
 * requirement in a way that reduces cleanly to one of these IDs; the other
 * six describe context-dependent requirements by design (see
 * CAPABILITY_REQUIREMENT_MAP below) and are deliberately left unmapped
 * rather than forced.
 *
 * Initiative 5 (src/kernel/validation/references.ts) already considered
 * and excluded matching a capability's abstract requirement against a
 * project's free-text `runtime_requirement_reference`, reasoning that doing
 * so would require judging whether a reference is *appropriate*, not merely
 * whether it resolves. This vocabulary does not reopen that judgment call:
 * comparison against Runtime Evidence (see evidence.ts) is exact-string
 * equality against a known ID only — a reference that isn't one of these
 * IDs is simply not mechanically comparable, not silently accepted or
 * rejected.
 */
export const RUNTIME_REQUIREMENT_IDS = [
  'filesystem-read',
  'filesystem-write',
  'process-execution',
  'repository-read',
  'repository-write',
  'network-access',
] as const;

export type RuntimeRequirementId = (typeof RUNTIME_REQUIREMENT_IDS)[number];

export function isRuntimeRequirementId(value: string): value is RuntimeRequirementId {
  return (RUNTIME_REQUIREMENT_IDS as readonly string[]).includes(value);
}

/**
 * Best-effort, non-exhaustive mapping from an Atomic Capability's stable ID
 * to the single Runtime Requirement ID its capabilities.md prose already
 * unambiguously names, where one exists. Deliberately `undefined` for
 * capabilities whose abstract requirement is context-dependent in the
 * canonical definition itself (see seed/capabilities/capabilities.md) —
 * see Falsification Gate C / capability-runtime-mapping evidence for why
 * forcing those to a single ID would misrepresent the capability
 * definition, not merely normalize it.
 */
export const CAPABILITY_REQUIREMENT_MAP: Readonly<
  Record<string, RuntimeRequirementId | undefined>
> = {
  'repository-inspection': 'repository-read',
  'bounded-delivery': 'repository-write',
  'software-implementation': undefined,
  'deterministic-validation': undefined,
  'ui-implementation': undefined,
  'research-discovery': undefined,
  'external-action-execution': undefined,
  'persistent-continuation': undefined,
};
