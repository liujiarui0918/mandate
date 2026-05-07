/**
 * `mandate explain <role>` — print the role's hooks + skills + visible files.
 * Pure read-only inspection. Resolves hooks from .mandate/constitution/<role>/hooks.yaml
 * (if present) and skills from the role's pack (if installed).
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import { loadConstitution, loadI18n } from '@mandate/runtime';

const KNOWN_ROLES = [
  'emperor', 'chancellor', 'cto', 'scout',
  'soldier', 'secretary', 'censor', 'historian',
];

export async function runExplain(roleArg, targetDir = '.', { format = 'text' } = {}) {
  if (!roleArg) {
    return { ok: false, message: 'role required. Try: mandate explain chancellor' };
  }
  const root = resolve(targetDir);

  let canonical = roleArg.toLowerCase();
  try {
    const i18n = loadI18n();
    canonical = i18n.canonicalize(roleArg) ?? canonical;
  } catch {
    // terms.yaml not findable — fall back to raw input
  }

  if (!KNOWN_ROLES.includes(canonical)) {
    return { ok: false, message: `unknown role "${roleArg}". Known: ${KNOWN_ROLES.join(', ')}` };
  }

  let cfg = null;
  const loaded = loadConstitution(root);
  if (loaded.ok) cfg = loaded.constitution;

  const report = {
    role: canonical,
    constitution_present: cfg !== null,
    model: cfg?.models?.[canonical] ?? null,
    censor: cfg?.censor?.overrides?.[canonical]
      ?? { tier: cfg?.censor?.default_tier ?? 'balanced' },
    hooks: null,
    pack: null,
    visible_files: roleVisibleFiles(canonical),
  };

  const hooksPath = join(root, '.mandate', 'constitution', canonical, 'hooks.yaml');
  if (existsSync(hooksPath)) {
    try { report.hooks = yaml.load(readFileSync(hooksPath, 'utf8')); }
    catch (err) { report.hooks = { _parse_error: err.message }; }
  }

  const packYaml = packPath(canonical);
  if (existsSync(packYaml)) {
    try { report.pack = yaml.load(readFileSync(packYaml, 'utf8')); }
    catch (err) { report.pack = { _parse_error: err.message }; }
  }

  return { ok: true, report, format };
}

function packPath(role) {
  const candidates = [
    resolve('packages/packs-imperial-v1/packs', `${role}.pack.yaml`),
    resolve('node_modules/@mandate/packs-imperial-v1/packs', `${role}.pack.yaml`),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

function roleVisibleFiles(role) {
  const map = {
    emperor: ['constitution/', 'reforms/', 'workspace/final_to_emperor.md'],
    chancellor: ['constitution/charter.md', 'workspace/decomposition.yaml', 'workspace/groups/'],
    cto: ['workspace/groups/{{group}}/', 'workspace/groups/{{group}}/scout_report.md'],
    scout: ['workspace/groups/{{group}}/investigation_brief.md', 'workspace/groups/{{group}}/scout_report.md'],
    soldier: ['workspace/groups/{{group}}/workers/{{worker}}/'],
    secretary: ['workspace/groups/{{group}}/first_draft.md', 'workspace/groups/{{group}}/final_draft.md'],
    censor: ['(read-only) all hook outputs', 'audits/'],
    historian: ['(read-only) chronicle/', 'reforms/', 'audits/'],
  };
  return map[role] ?? [];
}

export function formatExplainReport(result) {
  if (!result.ok) return result.message;
  const r = result.report;
  if (result.format === 'json') return JSON.stringify(r, null, 2);
  const lines = [];
  lines.push(`📜 Role: ${r.role}`);
  if (r.model) lines.push(`   Model: preferred=${r.model.preferred} fallback=${(r.model.fallback ?? []).join(', ')}`);
  lines.push(`   Censor: ${JSON.stringify(r.censor)}`);
  lines.push(`   Visible files:`);
  for (const f of r.visible_files) lines.push(`     - ${f}`);
  if (r.hooks?.hooks) {
    lines.push(`   Hooks (${Object.keys(r.hooks.hooks).length} events):`);
    for (const [event, hooks] of Object.entries(r.hooks.hooks)) {
      lines.push(`     ${event}:`);
      for (const h of hooks) lines.push(`       - ${h.must}`);
    }
  } else if (r.hooks) {
    lines.push(`   Hooks: parse error (${r.hooks._parse_error})`);
  } else {
    lines.push(`   Hooks: (none declared at .mandate/constitution/${r.role}/hooks.yaml)`);
  }
  if (r.pack) {
    lines.push(`   Pack: ${r.pack.name} (${(r.pack.skills ?? []).length} skills)`);
    for (const s of r.pack.skills ?? []) lines.push(`     - [${s.protocol}] ${s.name}`);
  } else {
    lines.push(`   Pack: (not installed)`);
  }
  return lines.join('\n');
}
