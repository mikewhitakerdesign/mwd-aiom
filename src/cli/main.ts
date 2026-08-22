#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { invoke } from '../invocation/dispatch.js';
import { resolveRuntimeVersion } from '../invocation/version.js';
import { errorResponse, type InvocationResponse } from '../invocation/contracts/response.js';
import type { InvocationOperation } from '../invocation/contracts/request.js';

/**
 * mwd-aiom: the first supported transport over the Runtime Invocation
 * Layer (Initiative 10). This file is a thin JSON-in/JSON-out wrapper —
 * it parses which operation and project root were requested, assembles
 * the payload from --input/stdin, and hands the whole thing to
 * invoke(). It performs zero interpretation of Owner intent or Bootstrap
 * reasoning; the caller (an AI reasoning runtime or a human) must supply
 * already-structured decisions.
 */

const KNOWN_OPERATIONS = ['bootstrap', 'validate', 'transition', 'orchestrate'] as const;
type Operation = (typeof KNOWN_OPERATIONS)[number];

function isKnownOperation(value: string): value is Operation {
  return (KNOWN_OPERATIONS as readonly string[]).includes(value);
}

function printAndExit(payload: InvocationResponse | { aiom: { version: string } }, exitCode: number): never {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(exitCode);
}

/** CLI-usage failures still produce the structured envelope (on stdout), per Initiative 10's decision to prefer machine-readable errors even here — exit 1 distinguishes them from invocation-layer failures (exit 2). */
function cliUsageExit(operation: InvocationOperation | null, message: string): never {
  printAndExit(errorResponse(resolveRuntimeVersion(), operation, { category: 'cli-usage', message }), 1);
}

function readStdinIfPiped(): string {
  if (process.stdin.isTTY) {
    return '';
  }
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main(): void {
  const argv = process.argv.slice(2);

  if (argv.includes('--version') || argv.includes('-v')) {
    process.stdout.write(`${JSON.stringify({ aiom: { version: resolveRuntimeVersion() } })}\n`);
    process.exit(0);
  }

  let parsed: ReturnType<typeof parseArgs<{
    options: { project: { type: 'string'; short: 'p' }; input: { type: 'string'; short: 'i' } };
    allowPositionals: true;
  }>>;
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        project: { type: 'string', short: 'p' },
        input: { type: 'string', short: 'i' },
      },
      allowPositionals: true,
    });
  } catch (err) {
    cliUsageExit(null, `failed to parse arguments: ${err instanceof Error ? err.message : String(err)}`);
  }

  const operationArg = parsed.positionals[0];
  if (!operationArg || !isKnownOperation(operationArg)) {
    cliUsageExit(
      null,
      `missing or unknown operation "${operationArg ?? ''}"; expected one of: ${KNOWN_OPERATIONS.join(', ')}`,
    );
  }
  const operation = operationArg;

  const projectRoot = parsed.values.project;
  if (!projectRoot) {
    cliUsageExit(operation, 'missing required --project argument');
  }

  let payload: Record<string, unknown> = {};

  if (parsed.values.input) {
    const inputPath = parsed.values.input;
    let raw: string;
    try {
      raw = readFileSync(inputPath, 'utf8');
    } catch (err) {
      cliUsageExit(operation, `could not read --input file "${inputPath}": ${err instanceof Error ? err.message : String(err)}`);
    }
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
      cliUsageExit(operation, `--input file did not contain valid JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    const raw = readStdinIfPiped();
    if (raw.trim().length > 0) {
      try {
        payload = JSON.parse(raw) as Record<string, unknown>;
      } catch (err) {
        cliUsageExit(operation, `stdin did not contain valid JSON: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  const needsPayload = operation !== 'validate';
  if (needsPayload && Object.keys(payload).length === 0) {
    cliUsageExit(operation, 'no input JSON provided (use --input <file> or pipe JSON via stdin)');
  }

  const request = { ...payload, operation, projectRoot };
  const response = invoke(request);
  printAndExit(response, response.status === 'ok' ? 0 : 2);
}

try {
  main();
} catch (err) {
  // Truly catastrophic only: main() itself is synchronous and every
  // expected failure path already exits via cliUsageExit/printAndExit
  // above with a structured envelope. Reaching here means even producing
  // that envelope failed.
  process.stderr.write(`mwd-aiom: fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}
