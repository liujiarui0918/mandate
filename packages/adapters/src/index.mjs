// @mandateai/adapters — multi-protocol skill adapters for Mandate.
//
// Pack manifests (@mandateai/packs-imperial-v1) declare skills like:
//   { protocol: 'mcp', name: 'brave-search' }
// The runtime uses this package to resolve those specs into runnable
// handles regardless of which protocol they target.

export { AdapterError, NotImplementedError, assertSkillSpec, makeRunnable } from './base.mjs';
export {
  SUPPORTED_PROTOCOLS,
  getAdapter,
  resolveSkill,
  runSkill,
} from './dispatcher.mjs';

export * as mcp from './mcp.mjs';
export * as claudeSkill from './claude-skill.mjs';
export * as openclawSkill from './openclaw-skill.mjs';
export * as cli from './cli.mjs';
export * as mandateBuiltin from './mandate-builtin.mjs';
