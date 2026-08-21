import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { invoke } from '../../src/invocation/dispatch.js';
import { resolveRuntimeVersion } from '../../src/invocation/version.js';
import { allUnknownSignals, confirmation, readyAssessment } from '../kernel/helpers/bootstrap-fixtures.js';

const fixturesRoot = fileURLToPath(new URL('../fixtures/', import.meta.url));

function minimalBootstrapDecisions(overrides: Record<string, unknown> = {}) {
  return {
    durableStateJustified: true,
    profile: {
      projectName: 'Invocation Test Project',
      projectIntent: 'Prove the invocation layer works end to end.',
      ownerIdentity: 'Owner',
      existingStateAssessmentPerformed: false,
      lifecyclePosition: 'research',
      signals: allUnknownSignals(),
      consequenceConfirmations: {
        consequential_external_action: confirmation('no', 'owner-confirmed'),
        sensitive_or_high_consequence_data: confirmation('no', 'owner-confirmed'),
      },
    },
    bundles: [],
    capabilities: [],
    bootstrapReadyAssessment: readyAssessment(),
    bootstrapReady: false,
    nextGovernedAction: 'research',
    ...overrides,
  };
}

describe('invoke() — the Runtime Invocation Layer', () => {
  const tempDirs: string[] = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      try {
        chmodSync(dir, 0o755);
      } catch {
        // best effort — some tests intentionally lock permissions down
      }
      rmSync(dir, { recursive: true, force: true });
    }
  });
  function tempDir(prefix = 'aiom-invoke-'): string {
    const dir = mkdtempSync(path.join(tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  }

  describe('bootstrap', () => {
    it('runs in ephemeral (inspect-only) mode and returns a structured, versioned response', () => {
      const response = invoke({
        operation: 'bootstrap',
        projectRoot: tempDir(),
        ownerContext: 'a small research question',
        decisions: minimalBootstrapDecisions({ durableStateJustified: false }),
      });
      expect(response.status).toBe('ok');
      expect(response.aiom.version).toBe(resolveRuntimeVersion());
      if (response.status === 'ok' && response.operation === 'bootstrap') {
        expect(response.result.mode).toBe('ephemeral');
        expect(response.result.materialized).toBeUndefined();
      }
    });

    it('materializes .aiom/ under the supplied project root, never under a raw .aiom path', () => {
      const projectRoot = tempDir();
      const response = invoke({
        operation: 'bootstrap',
        projectRoot,
        ownerContext: 'a small durable project',
        materialize: true,
        decisions: minimalBootstrapDecisions(),
      });
      expect(response.status).toBe('ok');
      if (response.status === 'ok' && response.operation === 'bootstrap') {
        expect(response.result.materialized?.projectDir).toBe(path.resolve(projectRoot));
        expect(response.result.materialized?.stateDir).toBe(path.join(path.resolve(projectRoot), '.aiom'));
        expect(existsSync(path.join(projectRoot, '.aiom', 'profile.md'))).toBe(true);
      }
    });

    it('never materializes when materialize is omitted, even in aiom-managed mode', () => {
      const projectRoot = tempDir();
      const response = invoke({
        operation: 'bootstrap',
        projectRoot,
        ownerContext: 'x',
        decisions: minimalBootstrapDecisions(),
      });
      expect(response.status).toBe('ok');
      if (response.status === 'ok' && response.operation === 'bootstrap') {
        expect(response.result.materialized).toBeUndefined();
      }
      expect(existsSync(path.join(projectRoot, '.aiom'))).toBe(false);
    });
  });

  describe('validate', () => {
    it('reports a structured, successful invocation even when the kernel finds errors (kernel outcomes are not transport failures)', () => {
      const response = invoke({ operation: 'validate', projectRoot: tempDir() });
      expect(response.status).toBe('ok');
      if (response.status === 'ok' && response.operation === 'validate') {
        expect(response.result.valid).toBe(false);
        expect(response.result.errors.length).toBeGreaterThan(0);
      }
    });

    it('reads from <projectRoot>/.aiom, not from projectRoot itself', () => {
      const projectRoot = tempDir();
      mkdirSync(path.join(projectRoot, '.aiom'));
      cpSync(path.join(fixturesRoot, 'project-states', 'runtime-orchestration'), path.join(projectRoot, '.aiom'), {
        recursive: true,
      });
      const response = invoke({ operation: 'validate', projectRoot });
      expect(response.status).toBe('ok');
      if (response.status === 'ok' && response.operation === 'validate') {
        expect(response.result.valid).toBe(true);
      }
    });
  });

  describe('transition and orchestrate', () => {
    function projectRootWithFixtureState(fixtureRelativePath: string): string {
      const projectRoot = tempDir();
      mkdirSync(path.join(projectRoot, '.aiom'));
      cpSync(path.join(fixturesRoot, fixtureRelativePath), path.join(projectRoot, '.aiom'), { recursive: true });
      return projectRoot;
    }

    it('evaluates a transition against <projectRoot>/.aiom and reports a mechanically-blocked outcome as a successful invocation', () => {
      const projectRoot = projectRootWithFixtureState('project-states/invalid/unknown-capability');
      const response = invoke({
        operation: 'transition',
        projectRoot,
        transition: { workItemId: 'anything', fromStage: 'research', toStage: 'implementation' },
      });
      expect(response.status).toBe('ok');
      if (response.status === 'ok' && response.operation === 'transition') {
        expect(response.result.outcome).toBe('mechanically-blocked');
      }
    });

    it('composes runtimeRequirementIds into real RuntimeEvidence for orchestrate (network-access available)', () => {
      const projectRoot = projectRootWithFixtureState('project-states/runtime-orchestration');
      const response = invoke({
        operation: 'orchestrate',
        projectRoot,
        transition: {
          workItemId: 'wi-runtime-authorized',
          fromStage: 'approval',
          toStage: 'delivery',
          action: 'notify the external monitoring endpoint',
        },
        runtimeRequirementIds: ['filesystem-read'],
      });
      expect(response.status).toBe('ok');
      // filesystem-read evidence is real and available, but this fixture's
      // work item requires network-access specifically — supplying an
      // unrelated requirement should not manufacture coverage for it.
      if (response.status === 'ok' && response.operation === 'orchestrate') {
        expect(response.result.disposition).toBe('runtime-unknown');
      }
    });

    it('accepts an ISO-8601 "now" override and converts it to a Date before reaching the kernel', () => {
      const projectRoot = projectRootWithFixtureState('project-states/runtime-orchestration');
      const response = invoke({
        operation: 'transition',
        projectRoot,
        transition: {
          workItemId: 'wi-runtime-authorized',
          fromStage: 'approval',
          toStage: 'delivery',
          action: 'notify the external monitoring endpoint',
        },
        now: '2026-08-21T18:00:00.000Z',
      });
      expect(response.status).toBe('ok');
    });
  });

  describe('malformed and invalid requests', () => {
    it('returns a structured malformed-request error for an unrecognized payload, never a thrown exception', () => {
      const response = invoke({ operation: 'bootstrap' });
      expect(response.status).toBe('error');
      if (response.status === 'error') {
        expect(response.error.category).toBe('malformed-request');
        expect(response.error.details).toBeDefined();
      }
    });

    it('returns malformed-request for an unknown operation string', () => {
      const response = invoke({ operation: 'frobnicate', projectRoot: '/tmp/x' });
      expect(response.status).toBe('error');
      if (response.status === 'error') {
        expect(response.error.category).toBe('malformed-request');
        expect(response.operation).toBeNull();
      }
    });

    it('returns invalid-target when the project root exists but is not a directory', () => {
      const root = tempDir();
      const filePath = path.join(root, 'a-file');
      writeFileSync(filePath, 'x', 'utf8');
      const response = invoke({ operation: 'validate', projectRoot: filePath });
      expect(response.status).toBe('error');
      if (response.status === 'error') {
        expect(response.error.category).toBe('invalid-target');
      }
    });

    it('never leaks a raw exception for a genuine internal failure (e.g. an unwritable materialization target)', () => {
      const projectRoot = tempDir();
      chmodSync(projectRoot, 0o500); // read+execute only — mkdirSync of .aiom underneath should fail
      const response = invoke({
        operation: 'bootstrap',
        projectRoot,
        ownerContext: 'x',
        materialize: true,
        decisions: minimalBootstrapDecisions(),
      });
      expect(response.status).toBe('error');
      if (response.status === 'error') {
        expect(response.error.category).toBe('internal');
        expect(typeof response.error.message).toBe('string');
      }
    });
  });
});
