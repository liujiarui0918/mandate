/**
 * `mandate status` — show current court state.
 * Reads constitution, recent chronicle entries, ratified reforms,
 * model health cache, and active workspace dir. Pure read-only.
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import {
  loadConstitution,
  loadModelHealth,
  readChronicle,
  chronicleDate,
} from '@mandateai/runtime';

export async function runStatus(targetDir = '.', { tail = 10 } = {}) {
  const root = resolve(targetDir);
  const status = {
    project_root: root,
    constitution: null,
    workspace_present: existsSync(join(root, '.mandate', 'workspace')),
    workspace_artifacts: listWorkspace(root),
    snapshots: listSnapshots(root),
    model_health: null,
    recent_chronicle: [],
    reforms: countReforms(root),
    audits: countAudits(root),
  };
  const loaded = loadConstitution(root);
  if (loaded.ok) {
    status.constitution = loaded.constitution;
  } else {
    status.constitution_error = loaded.errors?.[0]?.message ?? 'unknown error';
  }
  try {
    status.model_health = await loadModelHealth(root);
  } catch { /* ignore */ }
  try {
    const today = chronicleDate();
    const events = await readChronicle(root, today);
    status.recent_chronicle = events.slice(-tail);
  } catch { /* no chronicle yet */ }
  return { ok: true, status };
}

function listWorkspace(root) {
  const ws = join(root, '.mandate', 'workspace');
  if (!existsSync(ws)) return [];
  return readdirSync(ws, { withFileTypes: true })
    .map((e) => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' }));
}

function listSnapshots(root) {
  const snapDir = join(root, '.mandate', 'workspace_snapshots');
  if (!existsSync(snapDir)) return [];
  return readdirSync(snapDir).sort();
}

function countReforms(root) {
  const dir = join(root, 'reforms');
  if (!existsSync(dir)) return { pending: 0, ratified: 0, vetoed: 0 };
  const all = readdirSync(dir).filter((f) => f.startsWith('PR-') && f.endsWith('.md'));
  const ratifiedPath = join(dir, '_ratified.yaml');
  let ratified = [];
  if (existsSync(ratifiedPath)) {
    try { ratified = yaml.load(readFileSync(ratifiedPath, 'utf8'))?.ratified ?? []; }
    catch { ratified = []; }
  }
  const vetoedDir = join(dir, '_rejected');
  const vetoedCount = existsSync(vetoedDir)
    ? readdirSync(vetoedDir).filter((f) => f.endsWith('.md')).length
    : 0;
  return {
    total_drafted: all.length,
    pending: all.length,
    ratified: ratified.length,
    vetoed: vetoedCount,
  };
}

function countAudits(root) {
  const dir = join(root, 'audits');
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith('.md')).length;
}

export function formatStatusReport(result) {
  if (!result.ok) return result.message ?? 'unknown error';
  const s = result.status;
  const lines = [];
  lines.push(`📜 Mandate court @ ${s.project_root}`);
  if (s.constitution) {
    const c = s.constitution;
    lines.push(`   Constitution: v${c.version} (project=${c.project ?? 'unknown'} censor=${c.censor?.default_tier ?? 'balanced'})`);
  } else if (s.constitution_error) {
    lines.push(`   Constitution: ERROR — ${s.constitution_error}`);
  } else {
    lines.push(`   Constitution: (not initialized)`);
  }
  lines.push(`   Workspace: ${s.workspace_present ? 'present' : 'absent'} (${s.workspace_artifacts.length} top-level artifacts)`);
  if (s.snapshots.length) {
    lines.push(`   Snapshots: ${s.snapshots.length} (latest: ${s.snapshots[s.snapshots.length - 1]})`);
  }
  lines.push(`   Reforms: ${s.reforms.total_drafted ?? 0} drafted, ${s.reforms.ratified ?? 0} ratified, ${s.reforms.vetoed ?? 0} vetoed`);
  lines.push(`   Audits: ${s.audits}`);
  if (s.recent_chronicle.length) {
    lines.push(`   Recent chronicle (${s.recent_chronicle.length} events):`);
    for (const e of s.recent_chronicle) {
      lines.push(`     ${e.ts ?? '?'} ${e.type ?? 'event'} ${e.role ?? ''}`);
    }
  } else {
    lines.push(`   Recent chronicle: (empty for today)`);
  }
  return lines.join('\n');
}
