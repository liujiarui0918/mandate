// @mandateai/adapters/mcp — adapter for Model Context Protocol skills.
//
// In v0.3-alpha this adapter is a SHIM: it tracks registered MCP server
// configs and resolves a runnable handle, but the actual transport
// (stdio / SSE / WebSocket) is delegated to a host-provided client. The
// runtime main loop (B.M4) injects the real client; tests inject a mock.
//
// Why a shim? Bundling a full MCP client would lock @mandateai/runtime to a
// single transport. The shim keeps the adapter-side contract testable
// without taking a dependency on @modelcontextprotocol/sdk yet.

import { assertSkillSpec, AdapterError, NotImplementedError, makeRunnable } from './base.mjs';

const SERVERS = new Map();   // serverName -> { transport, command, args, env }
const TOOLS = new Map();     // toolName -> { server, description, input_schema, output_schema }
let CLIENT_FACTORY = null;   // (serverConfig) => Promise<{ callTool(name, input) }>

export function registerServer(name, config) {
  if (typeof name !== 'string' || !name) {
    throw new AdapterError('registerServer: name required');
  }
  SERVERS.set(name, config);
}

export function registerTool(toolName, { server, description = '', input_schema = null, output_schema = null }) {
  if (typeof toolName !== 'string' || !toolName) {
    throw new AdapterError('registerTool: toolName required');
  }
  if (typeof server !== 'string' || !SERVERS.has(server)) {
    throw new AdapterError(`registerTool: ${toolName} references unknown server "${server}"`);
  }
  TOOLS.set(toolName, { server, description, input_schema, output_schema });
}

export function setClientFactory(factory) {
  if (factory !== null && typeof factory !== 'function') {
    throw new AdapterError('setClientFactory expects a function or null');
  }
  CLIENT_FACTORY = factory;
}

export function listServers() {
  return [...SERVERS.keys()].sort();
}

export function listTools() {
  return [...TOOLS.keys()].sort();
}

export function clearMcp() {
  SERVERS.clear();
  TOOLS.clear();
  CLIENT_FACTORY = null;
}

export function resolve(spec) {
  assertSkillSpec(spec);
  if (spec.protocol !== 'mcp') {
    throw new AdapterError(`mcp adapter received protocol "${spec.protocol}"`, {
      protocol: spec.protocol,
      skillName: spec.name,
    });
  }
  const tool = TOOLS.get(spec.name);
  if (!tool) {
    throw new AdapterError(
      `mcp: tool "${spec.name}" not registered. Register the server + tool before invoking.`,
      { protocol: 'mcp', skillName: spec.name },
    );
  }
  const serverConfig = SERVERS.get(tool.server);

  return makeRunnable({
    name: spec.name,
    protocol: 'mcp',
    description: tool.description,
    input_schema: tool.input_schema,
    output_schema: tool.output_schema,
    source: `mcp://${tool.server}/${spec.name}`,
    async run(input) {
      if (!CLIENT_FACTORY) {
        throw new NotImplementedError('mcp', spec.name);
      }
      const client = await CLIENT_FACTORY(serverConfig);
      return client.callTool(spec.name, input);
    },
  });
}

export const protocol = 'mcp';
