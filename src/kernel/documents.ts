import {
  fromZodSafeParse,
  parseFrontmatterDocument,
  parseYamlDocument,
  type ParseResult,
} from './parsing/index.js';
import {
  projectProfileSchema,
  type ProjectProfile,
} from './schemas/project-profile.js';
import {
  capabilityActivationRecordSchema,
  type CapabilityActivationRecord,
} from './schemas/capability-activation.js';
import {
  governedWorkItemSchema,
  type GovernedWorkItem,
} from './schemas/work-item.js';
import {
  ownerApprovalArtifactSchema,
  type OwnerApprovalArtifact,
} from './schemas/approval.js';

export function parseProjectProfileDocument(
  raw: string,
): ParseResult<ProjectProfile> {
  const parsed = parseFrontmatterDocument(raw);
  if (!parsed.ok) {
    return parsed;
  }
  return fromZodSafeParse(projectProfileSchema.safeParse(parsed.data));
}

export function parseCapabilityActivationDocument(
  raw: string,
): ParseResult<CapabilityActivationRecord> {
  const parsed = parseYamlDocument(raw);
  if (!parsed.ok) {
    return parsed;
  }
  return fromZodSafeParse(
    capabilityActivationRecordSchema.safeParse(parsed.data),
  );
}

export function parseGovernedWorkItemDocument(
  raw: string,
): ParseResult<GovernedWorkItem> {
  const parsed = parseFrontmatterDocument(raw);
  if (!parsed.ok) {
    return parsed;
  }
  return fromZodSafeParse(governedWorkItemSchema.safeParse(parsed.data));
}

export function parseOwnerApprovalDocument(
  raw: string,
): ParseResult<OwnerApprovalArtifact> {
  const parsed = parseYamlDocument(raw);
  if (!parsed.ok) {
    return parsed;
  }
  return fromZodSafeParse(ownerApprovalArtifactSchema.safeParse(parsed.data));
}
