// @mandate/adapters/mandate-builtin — adapter for skills that ship with
// @mandate/runtime itself. Built-in skills are pure ESM functions registered
// at runtime startup; this adapter is a thin lookup-and-invoke shim.

import { assertSkillSpec, AdapterError, makeRunnable } from './base.mjs';

// Registry of built-in skills. The runtime main loop populates this before
// dispatching the first hook. Tests / hosts may register skills directly.
const REGISTRY = new Map();

export function registerBuiltin(name, impl) {
  if (typeof name !== 'string' || !name) {
    throw new AdapterError('registerBuiltin: name must be a non-empty string');
  }
  if (!impl || typeof impl.run !== 'function') {
    throw new AdapterError(`registerBuiltin: ${name} requires { run }`);
  }
  REGISTRY.set(name, impl);
}

export function unregisterBuiltin(name) {
  REGISTRY.delete(name);
}

export function listBuiltins() {
  return [...REGISTRY.keys()].sort();
}

export function clearBuiltins() {
  REGISTRY.clear();
}

export function resolve(spec) {
  assertSkillSpec(spec);
  if (spec.protocol !== 'mandate-builtin') {
    throw new AdapterError(
      `mandate-builtin adapter received protocol "${spec.protocol}"`,
      { protocol: spec.protocol, skillName: spec.name },
    );
  }
  const impl = REGISTRY.get(spec.name);
  if (!impl) {
    throw new AdapterError(
      `mandate-builtin: skill "${spec.name}" not registered. Register via registerBuiltin() before invoking.`,
      { protocol: 'mandate-builtin', skillName: spec.name },
    );
  }
  return makeRunnable({
    name: spec.name,
    protocol: 'mandate-builtin',
    description: impl.description ?? '',
    input_schema: impl.input_schema ?? null,
    output_schema: impl.output_schema ?? null,
    source: 'mandate-builtin',
    run: impl.run,
  });
}

export const protocol = 'mandate-builtin';
