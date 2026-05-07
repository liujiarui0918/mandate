// @mandate/adapters/openclaw-skill — adapter for OpenClaw skills.
//
// OpenClaw skills live under ~/.openclaw/skills/<skill-name>/ and are
// distributed via ClawHub. Like claude-skill, in v0.3-alpha this adapter
// resolves manifest metadata and defers invocation to a host-provided
// invoker (the OpenClaw runtime).

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { assertSkillSpec, AdapterError, NotImplementedError, makeRunnable } from './base.mjs';

let INVOKER = null;
let SKILLS_DIR = null;

export function setInvoker(fn) {
  if (fn !== null && typeof fn !== 'function') {
    throw new AdapterError('setInvoker expects a function or null');
  }
  INVOKER = fn;
}

export function setSkillsDir(dir) {
  SKILLS_DIR = dir;
}

export function defaultSkillsDir() {
  return SKILLS_DIR ?? join(homedir(), '.openclaw', 'skills');
}

export function skillDir(skillName) {
  return join(defaultSkillsDir(), skillName);
}

// Look for skill.yaml or skill.json (OpenClaw permits both); returns null
// if the skill is not installed.
function readManifest(skillName) {
  const dir = skillDir(skillName);
  if (!existsSync(dir)) return null;
  for (const file of ['skill.yaml', 'skill.yml', 'skill.json']) {
    const path = join(dir, file);
    if (existsSync(path)) {
      const raw = readFileSync(path, 'utf8');
      if (file.endsWith('.json')) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      // Lightweight yaml extraction — full yaml parsing is the host's job.
      const out = {};
      for (const line of raw.split(/\r?\n/)) {
        const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
        if (m && m[2]) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      }
      return out;
    }
  }
  return {};
}

export function isSkillInstalled(skillName) {
  return existsSync(skillDir(skillName));
}

export function listInstalledSkills() {
  const dir = defaultSkillsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

export function clearOpenclawSkill() {
  INVOKER = null;
  SKILLS_DIR = null;
}

export function resolve(spec) {
  assertSkillSpec(spec);
  if (spec.protocol !== 'openclaw-skill') {
    throw new AdapterError(`openclaw-skill adapter received protocol "${spec.protocol}"`, {
      protocol: spec.protocol,
      skillName: spec.name,
    });
  }
  const manifest = readManifest(spec.name) ?? {};

  return makeRunnable({
    name: spec.name,
    protocol: 'openclaw-skill',
    description: manifest.description ?? '',
    input_schema: null,
    output_schema: null,
    source: skillDir(spec.name),
    async run(input) {
      if (!INVOKER) {
        throw new NotImplementedError('openclaw-skill', spec.name);
      }
      return INVOKER(spec.name, input);
    },
  });
}

export const protocol = 'openclaw-skill';
