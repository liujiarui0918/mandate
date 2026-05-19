/**
 * @mandateai/runtime — workspace lifecycle (memory).
 *
 * `<courtDir>/.mandate/workspace/` is the ephemeral scratchpad for the
 * current mandate run.
 *
 * `mandate run` resets workspace at start; on completion (or when historian
 * needs to preserve a snapshot), workspace is copied to
 * `<courtDir>/.mandate/chronicle/_snapshots/<ts>/`.
 */

import { existsSync, readdirSync } from 'node:fs';
import { mkdir, rm, cp, readdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveMandateDir } from './constitution.mjs';

/**
 * Compute the workspace path for a court.
 */
export function workspacePath(courtDir) {
  return join(resolveMandateDir(courtDir), 'workspace');
}

/**
 * Compute the snapshot directory path.
 */
export function snapshotDirPath(courtDir) {
  return join(resolveMandateDir(courtDir), 'chronicle', '_snapshots');
}

/**
 * Generate an ISO 8601 timestamp safe for filesystem use.
 * Replaces ':' and '.' with '-' (Windows-safe).
 */
export function snapshotTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

/**
 * Initialize a fresh workspace for a new mandate run.
 *
 * Behavior:
 *   - if workspace doesn't exist → create empty
 *   - if workspace exists with content → snapshot first (unless opt-out), then clear
 *
 * @param {string} courtDir
 * @param {{snapshotPrevious?: boolean}} [options] default snapshot=true
 * @returns {Promise<{path:string, snapshot:string|null}>}
 */
export async function initWorkspace(courtDir, options = {}) {
  const { snapshotPrevious = true } = options;
  const ws = workspacePath(courtDir);
  let snapshot = null;
  if (existsSync(ws)) {
    if (snapshotPrevious && hasContent(ws)) {
      snapshot = await snapshotWorkspace(courtDir);
    }
    await rm(ws, { recursive: true, force: true });
  }
  await mkdir(ws, { recursive: true });
  return { path: ws, snapshot };
}

function hasContent(path) {
  if (!existsSync(path)) return false;
  try {
    return readdirSync(path).length > 0;
  } catch {
    return false;
  }
}

/**
 * Snapshot the current workspace into chronicle/_snapshots/<ts>/.
 * Returns the snapshot directory path, or null if workspace was missing.
 *
 * @param {string} courtDir
 * @param {{ts?: string}} [options]
 * @returns {Promise<string|null>}
 */
export async function snapshotWorkspace(courtDir, options = {}) {
  const ws = workspacePath(courtDir);
  if (!existsSync(ws)) return null;
  const ts = options.ts ?? snapshotTimestamp();
  const dest = join(snapshotDirPath(courtDir), ts);
  await mkdir(dest, { recursive: true });
  await cp(ws, dest, { recursive: true });
  return dest;
}

/**
 * Clear a single project group's workspace (used between hook stages).
 *
 * @param {string} courtDir
 * @param {string} groupId
 * @returns {Promise<{cleared: boolean, path: string}>}
 */
export async function clearGroupWorkspace(courtDir, groupId) {
  const groupPath = join(workspacePath(courtDir), 'groups', groupId);
  if (existsSync(groupPath)) {
    await rm(groupPath, { recursive: true, force: true });
    await mkdir(groupPath, { recursive: true });
    return { cleared: true, path: groupPath };
  }
  await mkdir(groupPath, { recursive: true });
  return { cleared: false, path: groupPath };
}

/**
 * Read a workspace artifact file (text content).
 * Returns null if missing.
 *
 * @param {string} courtDir
 * @param {string} relativePath
 * @returns {Promise<string|null>}
 */
export async function readArtifact(courtDir, relativePath) {
  const path = join(workspacePath(courtDir), relativePath);
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

/**
 * Write a workspace artifact (creating parent dirs as needed).
 *
 * @param {string} courtDir
 * @param {string} relativePath
 * @param {string} content
 * @returns {Promise<string>}
 */
export async function writeArtifact(courtDir, relativePath, content) {
  const path = join(workspacePath(courtDir), relativePath);
  const parent = path.replace(/[/\\][^/\\]+$/, '');
  await mkdir(parent, { recursive: true });
  await writeFile(path, content, 'utf8');
  return path;
}

/**
 * List all snapshot timestamps available for this court.
 *
 * @param {string} courtDir
 * @returns {Promise<string[]>} sorted ascending
 */
export async function listSnapshots(courtDir) {
  const dir = snapshotDirPath(courtDir);
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}
