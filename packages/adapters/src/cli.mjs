// @mandateai/adapters/cli — adapter for raw CLI tools.
//
// Wraps a binary as a skill: stdin receives JSON input, stdout returns JSON
// output. Used for skills like `gemini-search` (gemini CLI), `codex-batch`
// (codex CLI), or any tool that follows the JSON-stdio contract.

import { spawn } from 'node:child_process';
import { assertSkillSpec, AdapterError, makeRunnable } from './base.mjs';

// Map skill names to their CLI binary + default args. Hosts can override.
const REGISTRY = new Map();

export function registerCli(name, { command, args = [], description = '', input_schema = null, output_schema = null }) {
  if (typeof name !== 'string' || !name) {
    throw new AdapterError('registerCli: name required');
  }
  if (typeof command !== 'string' || !command) {
    throw new AdapterError(`registerCli: ${name} missing "command"`);
  }
  REGISTRY.set(name, { command, args, description, input_schema, output_schema });
}

export function unregisterCli(name) {
  REGISTRY.delete(name);
}

export function listCli() {
  return [...REGISTRY.keys()].sort();
}

export function clearCli() {
  REGISTRY.clear();
}

// Default executor: spawn child, write JSON stdin, read JSON stdout.
function runCommand({ command, args, input, env, cwd, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: env ?? process.env,
      cwd: cwd ?? process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdoutChunks = [];
    const stderrChunks = [];
    let timer = null;
    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new AdapterError(`cli timeout after ${timeoutMs}ms: ${command}`));
      }, timeoutMs);
    }
    child.stdout.on('data', (b) => stdoutChunks.push(b));
    child.stderr.on('data', (b) => stderrChunks.push(b));
    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      reject(new AdapterError(`cli spawn failed: ${command}`, { cause: err }));
    });
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      const stdout = Buffer.concat(stdoutChunks).toString('utf8');
      const stderr = Buffer.concat(stderrChunks).toString('utf8');
      if (code !== 0) {
        reject(
          new AdapterError(`cli exit ${code}: ${command}\n${stderr}`, {
            cause: { code, stderr },
          }),
        );
        return;
      }
      resolve({ stdout, stderr });
    });
    if (input !== undefined) {
      child.stdin.end(typeof input === 'string' ? input : JSON.stringify(input));
    } else {
      child.stdin.end();
    }
  });
}

export function resolve(spec) {
  assertSkillSpec(spec);
  if (spec.protocol !== 'cli') {
    throw new AdapterError(`cli adapter received protocol "${spec.protocol}"`, {
      protocol: spec.protocol,
      skillName: spec.name,
    });
  }
  const entry = REGISTRY.get(spec.name);
  if (!entry) {
    throw new AdapterError(
      `cli: skill "${spec.name}" not registered. Register via registerCli({command, args}).`,
      { protocol: 'cli', skillName: spec.name },
    );
  }
  const extraArgs = Array.isArray(spec.args) ? spec.args : [];
  const fullArgs = [...entry.args, ...extraArgs];

  return makeRunnable({
    name: spec.name,
    protocol: 'cli',
    description: entry.description,
    input_schema: entry.input_schema,
    output_schema: entry.output_schema,
    source: `${entry.command} ${fullArgs.join(' ')}`.trim(),
    async run(input, opts = {}) {
      const { stdout } = await runCommand({
        command: entry.command,
        args: fullArgs,
        input,
        env: opts.env,
        cwd: opts.cwd,
        timeoutMs: opts.timeoutMs,
      });
      const trimmed = stdout.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    },
  });
}

export const protocol = 'cli';
// Exposed for tests that want to swap out the executor.
export const __runCommand = runCommand;
