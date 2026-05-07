// @mandate/adapters/claude-skill — adapter for Claude Code skills.
//
// Claude Code skills live under ~/.claude/skills/<skill-name>/SKILL.md
// and are surfaced through the host editor's Skill tool. In v0.3-alpha,
// this adapter resolves and validates skill metadata; the actual
// invocation is delegated to a host-provided invoker because skills
// run in the Claude Code session, not in @mandate/runtime's process.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { assertSkillSpec, AdapterError, NotImplementedError, makeRunnable } from './base.mjs';

let INVOKER = null;       // (skillName, input) => Promise<output>
let SKILLS_DIR = null;    // override for tests; defaults to ~/.claude/skills

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
  return SKILLS_DIR ?? join(homedir(), '.claude', 'skills');
}

export function skillManifestPath(skillName) {
  return join(defaultSkillsDir(), skillName, 'SKILL.md');
}

export function isSkillInstalled(skillName) {
  return existsSync(skillManifestPath(skillName));
}

// Best-effort YAML frontmatter extraction. Hosts that need richer parsing
// can replace this; for now we surface name + description only.
function parseFrontmatter(text) {
  const match = /^---\s*\n([\s\S]*?)\n---/.exec(text);
  if (!match) return {};
  const front = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (m) front[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return front;
}

export function readSkillManifest(skillName) {
  const path = skillManifestPath(skillName);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  return parseFrontmatter(text);
}

export function clearClaudeSkill() {
  INVOKER = null;
  SKILLS_DIR = null;
}

export function resolve(spec) {
  assertSkillSpec(spec);
  if (spec.protocol !== 'claude-skill') {
    throw new AdapterError(`claude-skill adapter received protocol "${spec.protocol}"`, {
      protocol: spec.protocol,
      skillName: spec.name,
    });
  }
  const manifest = readSkillManifest(spec.name) ?? {};

  return makeRunnable({
    name: spec.name,
    protocol: 'claude-skill',
    description: manifest.description ?? '',
    input_schema: null,
    output_schema: null,
    source: skillManifestPath(spec.name),
    async run(input) {
      if (!INVOKER) {
        throw new NotImplementedError('claude-skill', spec.name);
      }
      return INVOKER(spec.name, input);
    },
  });
}

export const protocol = 'claude-skill';
