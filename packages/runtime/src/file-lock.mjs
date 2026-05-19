/**
 * @mandateai/runtime — cooperative file lock.
 *
 * Lockfile-based mutual exclusion for shared resource access (chronicle
 * appends, constitution writes, group artifact merges).
 *
 * Convention: for a target file `foo.yaml`, the lock is `foo.yaml.lock`.
 * The lockfile contains:
 *   { pid, hostname, lock_id, acquired_at }
 *
 * Locks have a TTL (default 60s). Locks older than TTL are considered
 * stale and may be force-acquired (with audit logging by caller).
 *
 * IMPORTANT: This is a *cooperative* lock — only enforced for processes
 * that voluntarily call acquire/release. Not a kernel-level mandatory lock.
 */

import { existsSync, openSync, closeSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';

/**
 * @typedef {Object} LockInfo
 * @property {number} pid
 * @property {string} hostname
 * @property {string} lock_id
 * @property {string} acquired_at
 */

/**
 * Compute the lockfile path for a target.
 */
export function lockfilePath(targetPath) {
  return `${targetPath}.lock`;
}

/**
 * Try to acquire a lock atomically (using O_EXCL).
 *
 * @param {string} targetPath
 * @param {{ttlMs?:number, force?:boolean}} [options]
 * @returns {LockInfo|null}
 */
export function tryAcquireLock(targetPath, options = {}) {
  const { ttlMs = 60000, force = false } = options;
  const lockPath = lockfilePath(targetPath);
  const info = {
    pid: process.pid,
    hostname: hostname(),
    lock_id: randomUUID(),
    acquired_at: new Date().toISOString(),
  };

  if (existsSync(lockPath) && !force) {
    const stale = isStale(lockPath, ttlMs);
    if (!stale) return null;
    try {
      unlinkSync(lockPath);
    } catch {
      // someone else may have grabbed it; fall through to retry below
    }
  }

  try {
    const fd = openSync(lockPath, 'wx');
    writeFileSync(fd, JSON.stringify(info));
    closeSync(fd);
    return info;
  } catch (e) {
    if (e && e.code === 'EEXIST' && force) {
      try {
        writeFileSync(lockPath, JSON.stringify(info));
        return info;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Check whether a lockfile is stale (older than TTL).
 */
export function isStale(lockPath, ttlMs = 60000) {
  if (!existsSync(lockPath)) return true;
  let info;
  try {
    info = JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch {
    return true;
  }
  const acquiredAt = Date.parse(info.acquired_at);
  if (Number.isNaN(acquiredAt)) return true;
  return Date.now() - acquiredAt > ttlMs;
}

/**
 * Read the current lock holder's info (or null if no lock).
 */
export function readLock(targetPath) {
  const lockPath = lockfilePath(targetPath);
  if (!existsSync(lockPath)) return null;
  try {
    return JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Release a lock you hold. Verifies your lock_id matches before deleting.
 *
 * @param {string} targetPath
 * @param {string} lockId
 * @returns {boolean}
 */
export function releaseLock(targetPath, lockId) {
  const lockPath = lockfilePath(targetPath);
  if (!existsSync(lockPath)) return false;
  const current = readLock(targetPath);
  if (!current || current.lock_id !== lockId) return false;
  try {
    unlinkSync(lockPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convenience: run an async function under a lock with retry.
 *
 * @template T
 * @param {string} targetPath
 * @param {() => Promise<T>} fn
 * @param {{ttlMs?:number, retries?:number, retryDelayMs?:number}} [options]
 * @returns {Promise<T>}
 */
export async function withLock(targetPath, fn, options = {}) {
  const { ttlMs = 60000, retries = 30, retryDelayMs = 100 } = options;
  let acquired = null;
  for (let i = 0; i <= retries; i++) {
    acquired = tryAcquireLock(targetPath, { ttlMs });
    if (acquired) break;
    if (i < retries) {
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
  if (!acquired) {
    throw new Error(`Failed to acquire lock for ${targetPath} after ${retries} retries`);
  }
  try {
    return await fn();
  } finally {
    releaseLock(targetPath, acquired.lock_id);
  }
}
