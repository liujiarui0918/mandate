/**
 * Mandate topology checker.
 *
 * Implements the runtime layer of Mandate's three-layer parent-child defense
 * (see SPEC §3.3). A cross-group dependency with `kind: decision_affecting`
 * violates Conway-clean parallelism and must be flagged.
 *
 * @typedef {Object} Dep
 * @property {string} from
 * @property {'result_only'|'decision_affecting'} kind
 *
 * @typedef {Object} Group
 * @property {string} id
 * @property {string} goal
 * @property {string} deadline
 * @property {number} budget_tokens
 * @property {Dep[]} deps
 *
 * @typedef {Object} Decomposition
 * @property {string} mandate_id
 * @property {Group[]} groups
 *
 * @typedef {Object} Violation
 * @property {string} from
 * @property {string} to
 * @property {'decision_affecting'} kind
 * @property {string} [reason]
 *
 * @typedef {Object} TopologyResult
 * @property {boolean} valid
 * @property {Violation[]} violations
 * @property {string[]} suggestedMerges
 * @property {string} [error]
 */

/**
 * Walk the decomposition's inter-group dependency graph and surface every
 * decision-affecting cross-group dep. Result-only deps are legal (one group
 * may wait for another's output without changing its own decisions).
 *
 * @param {Decomposition} decomposition
 * @returns {TopologyResult}
 */
export function checkTopology(decomposition) {
  if (!decomposition || !Array.isArray(decomposition.groups)) {
    return { valid: false, violations: [], suggestedMerges: [], error: 'invalid decomposition shape' };
  }
  const violations = [];
  const groupIds = new Set(decomposition.groups.map((g) => g.id));
  for (const group of decomposition.groups) {
    if (!Array.isArray(group.deps)) continue;
    for (const dep of group.deps) {
      if (!dep || !dep.from || !dep.kind) continue;
      if (!groupIds.has(dep.from)) {
        violations.push({ from: dep.from, to: group.id, kind: 'decision_affecting', reason: 'unknown_group' });
        continue;
      }
      if (dep.kind === 'decision_affecting') {
        violations.push({ from: dep.from, to: group.id, kind: 'decision_affecting' });
      }
    }
  }
  const suggestedMerges = proposeAutoMerges(violations);
  return { valid: violations.length === 0, violations, suggestedMerges };
}

/**
 * Given violations, propose minimum-merge sets that would absorb the offending
 * cross-group edges into a single project group. The default heuristic is
 * pairwise merge: for every {from, to} edge, suggest merging those two ids.
 *
 * @param {Violation[]} violations
 * @returns {string[]}
 */
export function proposeAutoMerges(violations) {
  const seen = new Set();
  const proposals = [];
  for (const v of violations) {
    const sorted = [v.from, v.to].sort();
    const pair = sorted.join('+');
    if (seen.has(pair)) continue;
    seen.add(pair);
    proposals.push(`merge_groups: [${sorted[0]}, ${sorted[1]}] -> ${sorted[0]}-and-${sorted[1]}`);
  }
  return proposals;
}
