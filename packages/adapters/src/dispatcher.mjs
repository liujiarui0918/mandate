// @mandate/adapters/dispatcher — protocol-aware skill spec resolver.
//
// Given a skill spec ({protocol, name, args?}) from a pack manifest,
// route it to the matching adapter and return a runnable handle.

import { AdapterError } from './base.mjs';
import * as mcp from './mcp.mjs';
import * as claudeSkill from './claude-skill.mjs';
import * as openclawSkill from './openclaw-skill.mjs';
import * as cli from './cli.mjs';
import * as builtin from './mandate-builtin.mjs';

const ADAPTERS = Object.freeze({
  mcp,
  'claude-skill': claudeSkill,
  'openclaw-skill': openclawSkill,
  cli,
  'mandate-builtin': builtin,
});

export const SUPPORTED_PROTOCOLS = Object.freeze(Object.keys(ADAPTERS));

export function getAdapter(protocol) {
  const adapter = ADAPTERS[protocol];
  if (!adapter) {
    throw new AdapterError(
      `Unknown protocol "${protocol}". Supported: ${SUPPORTED_PROTOCOLS.join(', ')}`,
    );
  }
  return adapter;
}

// Resolve a skill spec into a runnable. Adapters handle their own
// "not yet wired" state — caller decides whether to surface or skip.
export function resolveSkill(spec) {
  const adapter = getAdapter(spec?.protocol);
  return adapter.resolve(spec);
}

// Convenience: run with one call. Errors propagate.
export async function runSkill(spec, input, opts) {
  const runnable = resolveSkill(spec);
  return runnable.run(input, opts);
}
