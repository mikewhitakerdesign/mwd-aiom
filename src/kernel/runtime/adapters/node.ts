import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { RuntimeAdapter } from '../adapter.js';
import { runtimeEvidence, type RuntimeEvidence } from '../evidence.js';
import type { RuntimeRequirementId } from '../requirements.js';

/**
 * The bounded, real Claude Code / Node.js runtime adapter (Initiative 7
 * brief Sections 7–8): the first proving runtime's provider-specific
 * inspection mechanism, kept entirely behind the RuntimeAdapter interface.
 * Every check here is read-only, a version/existence check, or a
 * temporary/local bounded round-trip — never a consequential or external
 * side effect (Section 7). `cwd` defaults to the current process's working
 * directory and is used only for the repository-read check.
 */
export interface NodeRuntimeAdapterOptions {
  readonly cwd?: string;
}

export function createNodeRuntimeAdapter(
  options: NodeRuntimeAdapterOptions = {},
): RuntimeAdapter {
  const cwd = options.cwd ?? process.cwd();

  return {
    name: 'node-runtime-adapter',
    probe(requirementId: RuntimeRequirementId, now: Date = new Date()): RuntimeEvidence {
      switch (requirementId) {
        case 'filesystem-read':
          return probeFilesystemRead(now, cwd);
        case 'filesystem-write':
          return probeFilesystemWrite(now);
        case 'process-execution':
          return probeProcessExecution(now);
        case 'repository-read':
          return probeRepositoryRead(now, cwd);
        case 'repository-write':
          return probeRepositoryWrite(now);
        case 'network-access':
          return probeNetworkAccess(now);
      }
    },
  };
}

function probeFilesystemRead(now: Date, cwd: string): RuntimeEvidence {
  try {
    readdirSync(cwd);
    return runtimeEvidence('filesystem-read', 'available', `fs.readdirSync(${cwd})`, now);
  } catch (error) {
    return runtimeEvidence(
      'filesystem-read',
      'unavailable',
      `fs.readdirSync(${cwd})`,
      now,
      describeError(error),
    );
  }
}

function probeFilesystemWrite(now: Date): RuntimeEvidence {
  const mechanism = 'mkdtemp + write + rm round-trip in the OS temp directory';
  let dir: string | undefined;
  try {
    dir = mkdtempSync(path.join(tmpdir(), 'aiom-runtime-probe-'));
    writeFileSync(path.join(dir, 'probe.txt'), 'aiom runtime probe');
    rmSync(dir, { recursive: true, force: true });
    return runtimeEvidence('filesystem-write', 'available', mechanism, now);
  } catch (error) {
    if (dir) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup only; the probe result already reflects failure
      }
    }
    return runtimeEvidence('filesystem-write', 'unavailable', mechanism, now, describeError(error));
  }
}

function probeProcessExecution(now: Date): RuntimeEvidence {
  const mechanism = `spawnSync(process.execPath, ['--version'])`;
  const result = spawnSync(process.execPath, ['--version'], { encoding: 'utf8' });
  if (result.error) {
    return runtimeEvidence(
      'process-execution',
      'unavailable',
      mechanism,
      now,
      describeError(result.error),
    );
  }
  if (result.status !== 0) {
    return runtimeEvidence(
      'process-execution',
      'unavailable',
      mechanism,
      now,
      `child process exited with status ${String(result.status)}`,
    );
  }
  return runtimeEvidence('process-execution', 'available', mechanism, now);
}

function probeRepositoryRead(now: Date, cwd: string): RuntimeEvidence {
  const mechanism = `spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: '${cwd}' })`;
  const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd,
    encoding: 'utf8',
  });
  if (result.error) {
    return runtimeEvidence(
      'repository-read',
      'unknown',
      mechanism,
      now,
      `git binary could not be invoked: ${describeError(result.error)}`,
    );
  }
  if (result.status === 0 && result.stdout.trim() === 'true') {
    return runtimeEvidence('repository-read', 'available', mechanism, now);
  }
  return runtimeEvidence(
    'repository-read',
    'unavailable',
    mechanism,
    now,
    `not inside a Git working tree (exit ${String(result.status)})`,
  );
}

/**
 * Deliberately always "unknown" (Section 7 / probe safety): whether the
 * current runtime can actually push to a remote is not mechanically
 * knowable from a read-only or local check — the only way to prove it is
 * to attempt a write, which this probe must not do just to answer a
 * capability question. This is a documented v0.1 limitation, not an
 * omission — see the Initiative 7 completion report.
 */
function probeRepositoryWrite(now: Date): RuntimeEvidence {
  return runtimeEvidence(
    'repository-write',
    'unknown',
    'not probed',
    now,
    'repository-write availability cannot be mechanically confirmed without a side-effecting push; probing it would itself be the consequential action this Seed requires Owner authorization for, so it is left unknown rather than inferred',
  );
}

/**
 * Deliberately always "unknown" for v0.1 (Section 7 / probe safety): a
 * genuinely side-effect-free network reachability check (e.g. a live DNS
 * or HTTP round-trip) is still an outbound action, and this repository's
 * normal test suite must not require network access. See the Initiative 7
 * completion report for this bounded scope decision.
 */
function probeNetworkAccess(now: Date): RuntimeEvidence {
  return runtimeEvidence(
    'network-access',
    'unknown',
    'not probed',
    now,
    'network-access was not probed for v0.1 — a live reachability check is itself an outbound action, not a side-effect-free inspection; left unknown pending a bounded, Owner-approved check',
  );
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
