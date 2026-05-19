/**
 * @mandateai/runtime — chronicle (JSONL append log).
 *
 * Append-only event log per day:
 *   <courtDir>/.mandate/chronicle/YYYY-MM-DD.jsonl
 *
 * Each line is a JSON event. The chronicle is the historian's source of truth
 * for periodic reflection (-> reform PRs) and event-driven audits.
 */

import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { resolveMandateDir } from './constitution.mjs';

/**
 * @typedef {Object} ChronicleEvent
 * @property {string} ts
 * @property {string} agent_id
 * @property {string} hook_name
 * @property {string[]} [file_writes]
 * @property {number} [model_tokens]
 * @property {string} [outcome]
 * @property {object} [meta]
 */

/**
 * Compute the date string used for chronicle filenames.
 * Always UTC to keep cross-timezone consistency with audit trails.
 *
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD
 */
export function chronicleDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Resolve the chronicle file path for a given date.
 *
 * @param {string} courtDir
 * @param {Date|string} [dateOrString]
 * @returns {string}
 */
export function chroniclePath(courtDir, dateOrString) {
  const d = typeof dateOrString === 'string'
    ? dateOrString
    : chronicleDate(dateOrString instanceof Date ? dateOrString : new Date());
  const mandateDir = resolveMandateDir(courtDir);
  return join(mandateDir, 'chronicle', `${d}.jsonl`);
}

/**
 * Append a single event to today's chronicle.
 *
 * @param {string} courtDir
 * @param {ChronicleEvent} event
 * @returns {Promise<{path:string, line:string}>}
 */
export async function appendEvent(courtDir, event) {
  const ev = { ts: new Date().toISOString(), ...event };
  const path = chroniclePath(courtDir, ev.ts.slice(0, 10));
  const dir = dirname(path);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const line = JSON.stringify(ev) + '\n';
  await appendFile(path, line, 'utf8');
  return { path, line };
}

/**
 * Read and parse a chronicle file (one date) into an event array.
 *
 * @param {string} courtDir
 * @param {Date|string} [date]
 * @returns {Promise<ChronicleEvent[]>}
 */
export async function readChronicle(courtDir, date) {
  const path = chroniclePath(courtDir, date);
  if (!existsSync(path)) return [];
  const raw = await readFile(path, 'utf8');
  const events = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // skip malformed lines but keep going
    }
  }
  return events;
}

/**
 * Read events across a date range (inclusive on both ends).
 *
 * @param {string} courtDir
 * @param {string} fromDate YYYY-MM-DD
 * @param {string} toDate   YYYY-MM-DD
 * @returns {Promise<ChronicleEvent[]>}
 */
export async function readChronicleRange(courtDir, fromDate, toDate) {
  const out = [];
  const cursor = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  while (cursor.getTime() <= end.getTime()) {
    const events = await readChronicle(courtDir, chronicleDate(cursor));
    out.push(...events);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}
