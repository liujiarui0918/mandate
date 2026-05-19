// @mandateai/adapters/base — adapter contract.
//
// Per SPEC §9.1, every adapter exposes a uniform shape:
//   { name, input_schema, output_schema, run(input) -> output }
//
// Adapters resolve a skill spec ({protocol, name, args?}) into a runnable
// handle. They do not own the skill registry — that is @mandateai/registry.

export class AdapterError extends Error {
  constructor(message, { protocol, skillName, cause } = {}) {
    super(message);
    this.name = 'AdapterError';
    this.protocol = protocol;
    this.skillName = skillName;
    if (cause) this.cause = cause;
  }
}

export class NotImplementedError extends AdapterError {
  constructor(protocol, skillName) {
    super(
      `Adapter "${protocol}" does not implement skill "${skillName}" in this build. ` +
        `In v0.3-alpha, MCP / claude-skill / openclaw-skill adapters require host integration; ` +
        `wire them via the runtime main loop (B.M4) before invoking.`,
      { protocol, skillName },
    );
    this.name = 'NotImplementedError';
  }
}

// Validate a skill spec carries the minimum fields all adapters expect.
export function assertSkillSpec(spec) {
  if (!spec || typeof spec !== 'object') {
    throw new AdapterError('skill spec must be an object');
  }
  if (typeof spec.protocol !== 'string' || !spec.protocol) {
    throw new AdapterError('skill spec missing "protocol"');
  }
  if (typeof spec.name !== 'string' || !spec.name) {
    throw new AdapterError('skill spec missing "name"', { protocol: spec.protocol });
  }
}

// Standard runnable shape every adapter must return from resolve().
export function makeRunnable({
  name,
  protocol,
  description = '',
  input_schema = null,
  output_schema = null,
  source = null,
  run,
}) {
  if (typeof run !== 'function') {
    throw new AdapterError(`makeRunnable: "run" must be a function for ${protocol}/${name}`);
  }
  return Object.freeze({
    name,
    protocol,
    description,
    input_schema,
    output_schema,
    source,
    run,
  });
}
