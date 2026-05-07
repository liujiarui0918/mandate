/**
 * `mandate ratify <PR-id>` — Emperor's vermillion seal.
 * Applies a reform PR's structured proposed_changes to constitution.yaml,
 * bumps the version (default minor), records to reforms/_ratified.yaml.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import {
  loadConstitution,
  saveConstitution,
  bumpConstitutionVersion,
} from '@mandate/runtime';

const RATIFIED_LEDGER = '_ratified.yaml';

export async function runRatify(prId, targetDir = '.', { bump = 'minor', dryRun = false } = {}) {
  if (!prId) return { ok: false, message: 'PR id required (e.g., mandate ratify PR-001)' };
  if (!/^PR-\d{3,}$/.test(prId)) {
    return { ok: false, message: `invalid PR id "${prId}". Expected pattern: PR-NNN (3+ digits)` };
  }
  const root = resolve(targetDir);
  const reformsDir = join(root, 'reforms');
  if (!existsSync(reformsDir)) {
    return { ok: false, message: `reforms/ does not exist at ${root}` };
  }
  const prFile = findPrFile(reformsDir, prId);
  if (!prFile) {
    return { ok: false, message: `${prId} not found in reforms/` };
  }
  let parsed;
  try {
    const text = readFileSync(prFile, 'utf8');
    parsed = matter(text);
  } catch (err) {
    return { ok: false, message: `failed to parse ${prFile}: ${err.message}` };
  }
  const reform = parsed.data ?? {};
  if (reform.status === 'ratified') {
    return { ok: false, message: `${prId} is already ratified` };
  }
  if (reform.status === 'vetoed') {
    return { ok: false, message: `${prId} is vetoed; cannot ratify` };
  }
  const changes = Array.isArray(reform.proposed_changes) ? reform.proposed_changes : [];
  if (changes.length === 0) {
    return { ok: false, message: `${prId} has no proposed_changes to apply` };
  }

  const loaded = loadConstitution(root);
  if (!loaded.ok) {
    return { ok: false, message: `failed to load constitution: ${loaded.errors?.[0]?.message ?? 'unknown error'}` };
  }
  const cfg = loaded.constitution;
  const previousVersion = cfg.version;

  const applyResult = applyChanges(cfg, changes);
  if (!applyResult.ok) {
    return { ok: false, message: `failed to apply changes: ${applyResult.errors.join('; ')}` };
  }

  const nextVersion = bumpConstitutionVersion(applyResult.cfg.version, bump);
  const next = { ...applyResult.cfg, version: nextVersion };
  const ratifiedAt = new Date().toISOString();

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      prId,
      previousVersion,
      newVersion: nextVersion,
      changesApplied: applyResult.applied,
      message: `dry-run: would ratify ${prId} (constitution ${previousVersion} → ${nextVersion})`,
    };
  }

  try {
    saveConstitution(root, next);
  } catch (err) {
    return { ok: false, message: `failed to save constitution: ${err.message}` };
  }

  const updatedFront = { ...reform, status: 'ratified', ratified_at: ratifiedAt };
  const updatedText = matter.stringify(parsed.content, updatedFront);
  writeFileSync(prFile, updatedText, 'utf8');

  appendToLedger(reformsDir, {
    pr_id: prId,
    title: reform.title ?? null,
    ratified_at: ratifiedAt,
    constitution_version: nextVersion,
    bump,
  });

  return {
    ok: true,
    prId,
    previousVersion,
    newVersion: nextVersion,
    changesApplied: applyResult.applied,
    message: `${prId} ratified — constitution v${previousVersion} → v${nextVersion}`,
  };
}

function findPrFile(reformsDir, prId) {
  const exact = join(reformsDir, `${prId}.md`);
  if (existsSync(exact)) return exact;
  for (const f of readdirSync(reformsDir)) {
    if (f.startsWith(`${prId}-`) && f.endsWith('.md')) return join(reformsDir, f);
  }
  return null;
}

// Apply a list of structured ops to a constitution. Returns updated cfg.
// Supported ops mirror reform.schema.json: merge_groups, split_group,
// add_role, remove_role, set_param, set_model.
function applyChanges(cfg, changes) {
  const out = JSON.parse(JSON.stringify(cfg));
  const applied = [];
  const errors = [];
  for (const change of changes) {
    try {
      switch (change.op) {
        case 'set_param': {
          if (typeof change.path !== 'string') throw new Error('set_param needs path');
          setByPath(out, change.path, change.value);
          applied.push(change);
          break;
        }
        case 'set_model': {
          if (!change.role) throw new Error('set_model needs role');
          out.models = out.models ?? {};
          out.models[change.role] = {
            ...(out.models[change.role] ?? {}),
            ...(change.preferred ? { preferred: change.preferred } : {}),
            ...(change.fallback ? { fallback: change.fallback } : {}),
          };
          applied.push(change);
          break;
        }
        case 'add_role':
        case 'remove_role':
        case 'merge_groups':
        case 'split_group': {
          out._pending_ops = out._pending_ops ?? [];
          out._pending_ops.push({ op: change.op, ...change });
          applied.push(change);
          break;
        }
        default:
          throw new Error(`unsupported op "${change.op}"`);
      }
    } catch (err) {
      errors.push(`${change.op}: ${err.message}`);
    }
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, cfg: out, applied };
}

function setByPath(obj, path, value) {
  const segs = path.split('.');
  let cur = obj;
  for (let i = 0; i < segs.length - 1; i++) {
    if (cur[segs[i]] == null || typeof cur[segs[i]] !== 'object') cur[segs[i]] = {};
    cur = cur[segs[i]];
  }
  cur[segs[segs.length - 1]] = value;
}

function appendToLedger(reformsDir, entry) {
  const path = join(reformsDir, RATIFIED_LEDGER);
  let ledger = { ratified: [] };
  if (existsSync(path)) {
    try {
      const parsed = yaml.load(readFileSync(path, 'utf8'));
      if (parsed && Array.isArray(parsed.ratified)) ledger = parsed;
    } catch { /* fall back to empty ledger */ }
  }
  ledger.ratified.push(entry);
  writeFileSync(path, yaml.dump(ledger, { sortKeys: false }), 'utf8');
}
