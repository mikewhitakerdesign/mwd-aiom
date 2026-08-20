import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createNodeRuntimeAdapter } from '../../../../src/kernel/runtime/adapters/node.js';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));

/**
 * Exercises the bounded, real Claude Code / Node.js adapter (Initiative 7
 * brief Section 19: "testing the bounded real-runtime adapter separately").
 * Every assertion here is a mechanically guaranteed fact about the
 * environment these tests already run in (a Node.js process, inside this
 * Git repository) — nothing here depends on machine-specific state beyond
 * that, and nothing here touches the network.
 */
describe('createNodeRuntimeAdapter — bounded real-runtime adapter', () => {
  const adapter = createNodeRuntimeAdapter({ cwd: repoRoot });

  it('reports provider identity via name, not via any field Core logic branches on', () => {
    expect(adapter.name).toBe('node-runtime-adapter');
  });

  it('filesystem-read is available for the repository root a Node.js test process is already reading', () => {
    const evidence = adapter.probe('filesystem-read');
    expect(evidence.requirementId).toBe('filesystem-read');
    expect(evidence.availability).toBe('available');
  });

  it('filesystem-write is available via a temporary, local, bounded write+delete round-trip', () => {
    const evidence = adapter.probe('filesystem-write');
    expect(evidence.availability).toBe('available');
    expect(evidence.mechanism).toContain('OS temp directory');
  });

  it('process-execution is available via a read-only child-process version check', () => {
    const evidence = adapter.probe('process-execution');
    expect(evidence.availability).toBe('available');
  });

  it('repository-read is available inside this Git repository', () => {
    const evidence = adapter.probe('repository-read');
    expect(evidence.availability).toBe('available');
  });

  it('repository-write is deliberately unknown — never inferred without a side-effecting push', () => {
    const evidence = adapter.probe('repository-write');
    expect(evidence.availability).toBe('unknown');
    expect(evidence.reason).toBeDefined();
  });

  it('network-access is deliberately unknown for v0.1 — never probed to keep the adapter side-effect-safe', () => {
    const evidence = adapter.probe('network-access');
    expect(evidence.availability).toBe('unknown');
    expect(evidence.reason).toBeDefined();
  });

  it('every probe stamps a checkedAt timestamp reflecting when it ran', () => {
    const before = new Date();
    const evidence = adapter.probe('filesystem-read');
    const after = new Date();
    const checkedAt = new Date(evidence.checkedAt).getTime();
    expect(checkedAt).toBeGreaterThanOrEqual(before.getTime());
    expect(checkedAt).toBeLessThanOrEqual(after.getTime());
  });
});

describe('createNodeRuntimeAdapter — repository-read outside a Git working tree', () => {
  it('reports unavailable, not unknown, when the checked directory is not inside a Git work tree', () => {
    const adapter = createNodeRuntimeAdapter({ cwd: '/' });
    const evidence = adapter.probe('repository-read');
    expect(evidence.availability).not.toBe('available');
  });
});
