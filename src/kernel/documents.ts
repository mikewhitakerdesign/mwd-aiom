import {
  fromZodSafeParse,
  parseFrontmatterDocument,
  parseYamlDocument,
  stringifyFrontmatterDocument,
  stringifyYamlDocument,
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

/**
 * Write-side counterparts, needed starting with Project Bootstrap
 * (Initiative 8) materializing artifacts it constructs. Each serializer
 * re-validates through the same schema used to parse (`.parse`, not
 * `.safeParse` — a caller constructing a document programmatically should
 * fail loudly on an invalid shape, not receive a silently-wrong file), so
 * a round-trip through parse -> serialize -> parse is guaranteed schema-
 * conformant.
 */

export function serializeProjectProfileDocument(profile: ProjectProfile): string {
  const validated = projectProfileSchema.parse(profile);
  return stringifyFrontmatterDocument(validated.frontmatter, validated.body);
}

export function serializeCapabilityActivationDocument(
  record: CapabilityActivationRecord,
): string {
  return stringifyYamlDocument(capabilityActivationRecordSchema.parse(record));
}

export function serializeGovernedWorkItemDocument(item: GovernedWorkItem): string {
  const validated = governedWorkItemSchema.parse(item);
  return stringifyFrontmatterDocument(validated.frontmatter, validated.body);
}

export function serializeOwnerApprovalDocument(approval: OwnerApprovalArtifact): string {
  return stringifyYamlDocument(ownerApprovalArtifactSchema.parse(approval));
}
