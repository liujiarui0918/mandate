// @mandateai/packs-imperial-v1 — Imperial v1 skill pack loader.
//
// Loads the eight role-default skill packs that ship with Mandate's
// reference court topology. Each pack is a YAML manifest under packs/
// declaring which skills the role uses across MCP, Claude Code,
// OpenClaw, CLI, and built-in adapters.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PACKS_DIR = resolve(__dirname, '..', 'packs');

export const ROLES = Object.freeze([
  'emperor',
  'chancellor',
  'cto',
  'scout',
  'soldier',
  'secretary',
  'censor',
  'historian',
]);

export const PROTOCOLS = Object.freeze([
  'mcp',
  'claude-skill',
  'openclaw-skill',
  'cli',
  'mandate-builtin',
]);

const ROLE_TO_PACKNAME = Object.freeze({
  emperor: 'imperial-emperor-v1',
  chancellor: 'imperial-chancellor-v1',
  cto: 'imperial-cto-v1',
  scout: 'imperial-scout-v1',
  soldier: 'imperial-soldier-v1',
  secretary: 'imperial-secretary-v1',
  censor: 'imperial-censor-v1',
  historian: 'imperial-historian-v1',
});

const PACKNAME_TO_FILE = Object.freeze({
  'imperial-emperor-v1': 'emperor.pack.yaml',
  'imperial-chancellor-v1': 'chancellor.pack.yaml',
  'imperial-cto-v1': 'cto.pack.yaml',
  'imperial-scout-v1': 'scout.pack.yaml',
  'imperial-soldier-v1': 'soldier.pack.yaml',
  'imperial-secretary-v1': 'secretary.pack.yaml',
  'imperial-censor-v1': 'censor.pack.yaml',
  'imperial-historian-v1': 'historian.pack.yaml',
});

export function packPathForRole(role) {
  const packName = ROLE_TO_PACKNAME[role];
  if (!packName) {
    throw new Error(`Unknown role: ${role}. Valid roles: ${ROLES.join(', ')}`);
  }
  return join(PACKS_DIR, PACKNAME_TO_FILE[packName]);
}

export function packPathForName(packName) {
  const file = PACKNAME_TO_FILE[packName];
  if (!file) {
    throw new Error(
      `Unknown pack: ${packName}. Valid packs: ${Object.keys(PACKNAME_TO_FILE).join(', ')}`,
    );
  }
  return join(PACKS_DIR, file);
}

export function validatePack(pack, sourceLabel = '<inline>') {
  const errors = [];

  if (!pack || typeof pack !== 'object') {
    errors.push(`${sourceLabel}: pack must be an object`);
    return { valid: false, errors };
  }

  if (typeof pack.name !== 'string' || !pack.name) {
    errors.push(`${sourceLabel}: missing required field "name" (string)`);
  }

  if (typeof pack.version !== 'string' || !pack.version) {
    errors.push(`${sourceLabel}: missing required field "version" (string)`);
  }

  if (typeof pack.role !== 'string' || !pack.role) {
    errors.push(`${sourceLabel}: missing required field "role" (string)`);
  } else if (!ROLES.includes(pack.role)) {
    errors.push(
      `${sourceLabel}: role "${pack.role}" is not a valid imperial role. Valid: ${ROLES.join(', ')}`,
    );
  }

  if (!pack.description || typeof pack.description !== 'object') {
    errors.push(`${sourceLabel}: missing required field "description" (object with en/zh)`);
  } else {
    if (typeof pack.description.en !== 'string' || !pack.description.en) {
      errors.push(`${sourceLabel}: description.en is required (string)`);
    }
    if (typeof pack.description.zh !== 'string' || !pack.description.zh) {
      errors.push(`${sourceLabel}: description.zh is required (string)`);
    }
  }

  if (!Array.isArray(pack.skills)) {
    errors.push(`${sourceLabel}: skills must be an array`);
  } else {
    pack.skills.forEach((skill, idx) => {
      const ctx = `${sourceLabel}: skills[${idx}]`;
      if (!skill || typeof skill !== 'object') {
        errors.push(`${ctx}: must be an object`);
        return;
      }
      if (typeof skill.protocol !== 'string' || !skill.protocol) {
        errors.push(`${ctx}: missing "protocol"`);
      } else if (!PROTOCOLS.includes(skill.protocol)) {
        errors.push(
          `${ctx}: protocol "${skill.protocol}" is invalid. Valid: ${PROTOCOLS.join(', ')}`,
        );
      }
      if (typeof skill.name !== 'string' || !skill.name) {
        errors.push(`${ctx}: missing "name"`);
      }
      if (skill.args !== undefined && !Array.isArray(skill.args)) {
        errors.push(`${ctx}: args (when present) must be an array of strings`);
      }
    });
  }

  if (pack.prompt_includes !== undefined) {
    if (!Array.isArray(pack.prompt_includes)) {
      errors.push(`${sourceLabel}: prompt_includes (when present) must be an array of strings`);
    } else {
      pack.prompt_includes.forEach((line, idx) => {
        if (typeof line !== 'string') {
          errors.push(`${sourceLabel}: prompt_includes[${idx}] must be a string`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

async function loadAndValidate(filePath) {
  const text = await readFile(filePath, 'utf8');
  const pack = yaml.load(text);
  const result = validatePack(pack, filePath);
  if (!result.valid) {
    throw new Error(
      `Invalid skill pack at ${filePath}:\n  - ${result.errors.join('\n  - ')}`,
    );
  }
  return pack;
}

export async function loadPack(packName) {
  const filePath = packPathForName(packName);
  return loadAndValidate(filePath);
}

export async function loadPackByRole(role) {
  const filePath = packPathForRole(role);
  return loadAndValidate(filePath);
}

export async function loadAllPacks() {
  const packs = {};
  for (const role of ROLES) {
    packs[role] = await loadPackByRole(role);
  }
  return packs;
}

export async function listPacks() {
  const entries = await readdir(PACKS_DIR);
  return entries
    .filter((f) => f.endsWith('.pack.yaml'))
    .map((f) => {
      const role = f.replace(/\.pack\.yaml$/, '');
      return {
        file: f,
        role,
        path: join(PACKS_DIR, f),
        packName: ROLE_TO_PACKNAME[role] ?? null,
      };
    });
}
