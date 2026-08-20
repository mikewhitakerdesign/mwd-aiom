import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Deterministic index of the Capability Architecture defined in
 * seed/capabilities/bundles.md and seed/capabilities/capabilities.md.
 *
 * This is a read-only, derived lookup — not a second canonical registry.
 * seed/capabilities/*.md remain the sole source of truth for what a
 * Capability Bundle or Atomic Capability is; this module only extracts
 * the stable IDs and membership relationships those Markdown documents
 * already record, so validation can resolve references against them
 * without duplicating their content by hand.
 */

export interface BundleDefinition {
  readonly id: string;
  readonly name: string;
}

export interface CapabilityDefinition {
  readonly id: string;
  readonly name: string;
  readonly crossCutting: boolean;
  /** null when crossCutting is true, or when the bundle name could not be resolved. */
  readonly bundleId: string | null;
}

export interface CapabilityIndex {
  readonly bundles: ReadonlyMap<string, BundleDefinition>;
  readonly capabilities: ReadonlyMap<string, CapabilityDefinition>;
  /** bundleId -> capability IDs that declare membership in that bundle. */
  readonly bundleMembership: ReadonlyMap<string, ReadonlySet<string>>;
}

const SECTION_SEPARATOR = /\n---\n/;
const BUNDLE_HEADER = /^##\s+\d+\.\s+(.+?)\s*$/m;
const BUNDLE_ID = /\*\*ID:\*\*\s+`([a-z][a-z0-9]*(?:-[a-z0-9]+)*)`/;
const CAPABILITY_HEADER = /^##\s+\d+\.\s+`([a-z][a-z0-9]*(?:-[a-z0-9]+)*)`\s*$/m;
const CAPABILITY_NAME = /\*\*Name:\*\*\s+(.+?)\s*$/m;
const CAPABILITY_BUNDLE = /\*\*Bundle:\*\*\s+(.+?)\s*$/m;

function parseBundleDefinitions(markdown: string): BundleDefinition[] {
  const bundles: BundleDefinition[] = [];
  for (const section of markdown.split(SECTION_SEPARATOR)) {
    const name = section.match(BUNDLE_HEADER)?.[1];
    const id = section.match(BUNDLE_ID)?.[1];
    if (name && id) {
      bundles.push({ id, name: name.trim() });
    }
  }
  return bundles;
}

interface RawCapability {
  readonly id: string;
  readonly name: string;
  readonly bundleField: string;
}

function parseCapabilityDefinitions(markdown: string): RawCapability[] {
  const capabilities: RawCapability[] = [];
  for (const section of markdown.split(SECTION_SEPARATOR)) {
    const id = section.match(CAPABILITY_HEADER)?.[1];
    const name = section.match(CAPABILITY_NAME)?.[1];
    const bundleField = section.match(CAPABILITY_BUNDLE)?.[1];
    if (id && name && bundleField) {
      capabilities.push({ id, name: name.trim(), bundleField: bundleField.trim() });
    }
  }
  return capabilities;
}

/**
 * Builds a CapabilityIndex from the raw Markdown content of bundles.md and
 * capabilities.md. Pure/synchronous so it can be unit-tested without disk
 * I/O — see loadCapabilityIndex() for the disk-backed entry point used by
 * project-state validation.
 */
export function buildCapabilityIndex(
  bundlesMarkdown: string,
  capabilitiesMarkdown: string,
): CapabilityIndex {
  const bundleDefinitions = parseBundleDefinitions(bundlesMarkdown);
  const bundles = new Map<string, BundleDefinition>(
    bundleDefinitions.map((bundle) => [bundle.id, bundle]),
  );
  const bundleIdByName = new Map<string, string>(
    bundleDefinitions.map((bundle) => [bundle.name, bundle.id]),
  );

  const capabilities = new Map<string, CapabilityDefinition>();
  const bundleMembership = new Map<string, Set<string>>();

  for (const raw of parseCapabilityDefinitions(capabilitiesMarkdown)) {
    const crossCutting = raw.bundleField.toLowerCase().startsWith('cross-cutting');
    const bundleId = crossCutting ? null : (bundleIdByName.get(raw.bundleField) ?? null);

    capabilities.set(raw.id, {
      id: raw.id,
      name: raw.name,
      crossCutting,
      bundleId,
    });

    if (bundleId !== null) {
      const members = bundleMembership.get(bundleId) ?? new Set<string>();
      members.add(raw.id);
      bundleMembership.set(bundleId, members);
    }
  }

  return { bundles, capabilities, bundleMembership };
}

const capabilitiesDir = fileURLToPath(
  new URL('../../../seed/capabilities/', import.meta.url),
);

/**
 * Loads the CapabilityIndex from this repository's own
 * seed/capabilities/bundles.md and seed/capabilities/capabilities.md.
 */
export function loadCapabilityIndex(): CapabilityIndex {
  const bundlesMarkdown = readFileSync(`${capabilitiesDir}bundles.md`, 'utf8');
  const capabilitiesMarkdown = readFileSync(`${capabilitiesDir}capabilities.md`, 'utf8');
  return buildCapabilityIndex(bundlesMarkdown, capabilitiesMarkdown);
}
