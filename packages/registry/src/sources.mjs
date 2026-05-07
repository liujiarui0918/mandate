// @mandate/registry/sources — pluggable skill discovery sources.
//
// Per SPEC §9.2, skill resolution walks a configurable source chain:
//   discovery_order: [local, mandate-registry, npm, clawhub]
//
// Each source is a small object: { name, check(skillName) -> hit | null }.
// "Hit" = { source, name, protocol, location, manifest? }. Sources do NOT
// invoke skills; they only locate. Adapter dispatch happens after resolve.

import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve as pathResolve } from 'node:path';
import { claudeSkill, openclawSkill } from '@mandate/adapters';

// ---- local: ~/.claude/skills, ~/.openclaw/skills, ./node_modules

export function makeLocalSource({ projectRoot = process.cwd() } = {}) {
  return {
    name: 'local',
    check(skillName) {
      // Claude Code skills
      const claudeDir = claudeSkill.defaultSkillsDir();
      if (existsSync(join(claudeDir, skillName, 'SKILL.md'))) {
        return {
          source: 'local',
          subsource: 'claude-skill',
          name: skillName,
          protocol: 'claude-skill',
          location: join(claudeDir, skillName),
          manifest: claudeSkill.readSkillManifest(skillName),
        };
      }
      // OpenClaw skills
      const ocDir = openclawSkill.defaultSkillsDir();
      if (existsSync(join(ocDir, skillName))) {
        return {
          source: 'local',
          subsource: 'openclaw-skill',
          name: skillName,
          protocol: 'openclaw-skill',
          location: join(ocDir, skillName),
          manifest: null,
        };
      }
      // node_modules/@mandate-skills/<name>
      const npmDir = pathResolve(projectRoot, 'node_modules', '@mandate-skills', skillName);
      if (existsSync(npmDir)) {
        return {
          source: 'local',
          subsource: 'npm-vendored',
          name: skillName,
          protocol: 'mandate-builtin',
          location: npmDir,
          manifest: null,
        };
      }
      return null;
    },
  };
}

// ---- npm: @mandate-skills/* on npm registry (offline-aware stub)

export function makeNpmSource({ projectRoot = process.cwd() } = {}) {
  return {
    name: 'npm',
    check(skillName) {
      // For v0.3-alpha we only confirm presence; install is deferred to
      // host (`mandate install <skill>` will shell out to `npm install`).
      const candidate = pathResolve(projectRoot, 'node_modules', '@mandate-skills', skillName);
      if (existsSync(candidate)) {
        return {
          source: 'npm',
          name: skillName,
          protocol: 'mandate-builtin',
          location: candidate,
          installed: true,
        };
      }
      return {
        source: 'npm',
        name: skillName,
        protocol: 'mandate-builtin',
        location: `npm:@mandate-skills/${skillName}`,
        installed: false,
        installHint: `npm install @mandate-skills/${skillName}`,
      };
    },
  };
}

// ---- mandate-registry: official HTTP index (stub for v0.3-alpha)

export function makeMandateRegistrySource({ baseUrl = 'https://registry.mandate.dev', fetcher = null } = {}) {
  return {
    name: 'mandate-registry',
    baseUrl,
    async check(skillName) {
      if (!fetcher) {
        // Without an injected fetcher we cannot hit the network; return null
        // so the chain falls through to the next source.
        return null;
      }
      try {
        const meta = await fetcher(`${baseUrl}/skills/${encodeURIComponent(skillName)}`);
        if (!meta) return null;
        return {
          source: 'mandate-registry',
          name: skillName,
          protocol: meta.protocol ?? 'mandate-builtin',
          location: meta.url ?? `${baseUrl}/skills/${skillName}`,
          manifest: meta,
          signed: meta.signature ?? null,
        };
      } catch {
        return null;
      }
    },
  };
}

// ---- clawhub: OpenClaw's registry, wrapped through openclaw-skill adapter

export function makeClawhubSource({ baseUrl = 'https://clawhub.openclaw.dev', fetcher = null } = {}) {
  return {
    name: 'clawhub',
    baseUrl,
    async check(skillName) {
      // First check if already installed locally via openclaw — that's the
      // common case. Network lookup is a host concern.
      if (openclawSkill.isSkillInstalled(skillName)) {
        return {
          source: 'clawhub',
          subsource: 'local-openclaw',
          name: skillName,
          protocol: 'openclaw-skill',
          location: openclawSkill.skillDir(skillName),
        };
      }
      if (!fetcher) return null;
      try {
        const meta = await fetcher(`${baseUrl}/api/skills/${encodeURIComponent(skillName)}`);
        if (!meta) return null;
        return {
          source: 'clawhub',
          name: skillName,
          protocol: 'openclaw-skill',
          location: meta.url ?? `${baseUrl}/skills/${skillName}`,
          manifest: meta,
          installHint: `openclaw install ${skillName}`,
        };
      } catch {
        return null;
      }
    },
  };
}

// All built-in sources, keyed by canonical name.
export function defaultSources(opts = {}) {
  return {
    local: makeLocalSource(opts),
    npm: makeNpmSource(opts),
    'mandate-registry': makeMandateRegistrySource(opts),
    clawhub: makeClawhubSource(opts),
  };
}
