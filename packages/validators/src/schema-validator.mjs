/**
 * Mandate schema validators.
 *
 * Wraps ajv to validate the four Mandate JSON Schemas:
 *   - constitution.schema.json
 *   - hooks.schema.json
 *   - decomposition.schema.json
 *   - reform.schema.json
 *
 * Schemas are loaded from a schemaRoot directory (typically `<repo>/spec/`).
 * Each compile is cached by $id so repeated calls share the compiled validator.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const compiledCache = new Map();

/**
 * Resolve the canonical schema directory relative to the repo root.
 *
 * @param {string|undefined} schemaRoot
 * @returns {string}
 */
export function resolveSchemaRoot(schemaRoot) {
  if (schemaRoot) return resolve(schemaRoot);
  if (process.env.MANDATE_SCHEMA_ROOT) return resolve(process.env.MANDATE_SCHEMA_ROOT);
  return resolve(__dirname, '../../../spec');
}

/**
 * Load and compile a schema by basename.
 *
 * @param {'constitution'|'hooks'|'decomposition'|'reform'} name
 * @param {string} [schemaRoot]
 * @returns {Function} ajv ValidateFunction
 */
export function loadValidator(name, schemaRoot) {
  const cacheKey = `${schemaRoot ?? 'default'}::${name}`;
  if (compiledCache.has(cacheKey)) return compiledCache.get(cacheKey);
  const root = resolveSchemaRoot(schemaRoot);
  const path = resolve(root, `${name}.schema.json`);
  const raw = readFileSync(path, 'utf8');
  const schema = JSON.parse(raw);
  let validator;
  if (schema.$id) {
    const existing = ajv.getSchema(schema.$id);
    validator = existing ?? ajv.compile(schema);
  } else {
    validator = ajv.compile(schema);
  }
  compiledCache.set(cacheKey, validator);
  return validator;
}

/**
 * Generic validate helper.
 *
 * @param {string} name
 * @param {unknown} value
 * @param {string} [schemaRoot]
 * @returns {{valid:boolean, errors: object[]|null}}
 */
export function validate(name, value, schemaRoot) {
  const fn = loadValidator(name, schemaRoot);
  const ok = fn(value);
  return { valid: !!ok, errors: fn.errors ?? null };
}

export const validateConstitution = (v, root) => validate('constitution', v, root);
export const validateHooks = (v, root) => validate('hooks', v, root);
export const validateDecomposition = (v, root) => validate('decomposition', v, root);
export const validateReform = (v, root) => validate('reform', v, root);
