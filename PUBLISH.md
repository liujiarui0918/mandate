# Mandate npm Publish Playbook

Step-by-step guide to publish `@mandate/validators`, `@mandate/cli` (with `create-mandate` bin), and future packages to npm registry.

> **Status as of v0.3.1-alpha (May 2026):** Two packages ready to publish. v0.4 will add `@mandate/runtime`, `@mandate/adapters`, `@mandate/registry`, `@mandate/packs-imperial-v1`.

---

## 1. npm Name Availability

Checked 2026-05-08 via `curl https://registry.npmjs.org/<pkg>`:

| Package | Status | Action |
|---|---|---|
| `@mandate/validators` | ✅ available | Publish first |
| `@mandate/cli` | ✅ available | Publish second (depends on validators) |
| `create-mandate` | ✅ available | (Provided by `@mandate/cli` via `bin`) |
| `@mandate/runtime` | ✅ available | v0.4 |
| `@mandate/adapters` | ✅ available | v0.4 |
| `@mandate/registry` | ✅ available | v0.4 |
| `@mandate/packs-imperial-v1` | ✅ available | v0.4 |
| `mandateai`, `mandate-os` | ✅ available | reserved fallbacks |
| `@mandate/core` | ❌ TAKEN | Renamed to `@mandate/runtime` |
| `mandate` | ❌ TAKEN | Use `create-mandate` as the entry name instead |

---

## 2. Prerequisites (you do once)

### 2.1 npm account

```bash
# Verify
npm whoami
# If not logged in:
npm login
```

If you don't have a `@mandate` scope yet, npm will create it automatically on the first publish (free for public packages).

### 2.2 2FA (recommended, npm encourages it)

```bash
npm profile enable-2fa auth-and-writes
```

When publishing you'll be prompted for an OTP from your authenticator app.

### 2.3 Git working tree clean

```bash
cd /path/to/mandate
git status              # should be clean
git pull --rebase       # latest main
npm test                # 37/37 must pass
```

---

## 3. Publish `@mandate/validators` (foundation, no internal deps)

```bash
cd packages/validators

# Dry run — inspect what will be uploaded
npm publish --dry-run --access public

# Verify the file list contains:
#   src/topology-check.mjs
#   src/schema-validator.mjs
#   src/index.mjs
#   package.json
#   README.md
#   LICENSE  (copy from repo root if missing)

# Real publish
npm publish --access public
# You'll be prompted for OTP
```

After publish:
```bash
npm view @mandate/validators
# version, dist tags, dependencies should be visible
```

---

## 4. Publish `@mandate/cli` + `create-mandate` (depends on validators)

```bash
cd ../cli

# Dry run
npm publish --dry-run --access public

# Verify file list contains:
#   src/index.mjs
#   src/commands/create.mjs
#   src/commands/validate.mjs
#   bin/mandate.mjs
#   bin/create-mandate.mjs
#   templates/research/.mandate/...
#   templates/self-governance/.mandate/...
#   package.json
#   README.md
#   LICENSE

# Real publish
npm publish --access public
```

After publish, the `create-mandate` command becomes available globally via:

```bash
npx create-mandate my-empire --template both
```

---

## 5. Verify the live experience

From a fresh directory:

```bash
cd /tmp
npx create-mandate test-empire --template both
# Expected:
# ✓ Mandate court scaffolded at /tmp/test-empire/.mandate (template=both)

cd test-empire
npx mandate validate .
# Expected:
# 📜 mandate validate — /tmp/test-empire
#   ✓ constitution.yaml schema
#   ✓ decomposition.yaml (skipped)
#   ✓ All checks passed.
```

---

## 6. Tag the GitHub release

```bash
cd /path/to/mandate
git tag -a v0.3.1-alpha.1 -m "v0.3.1-alpha.1: first npm publish (@mandate/validators + @mandate/cli)"
git push origin v0.3.1-alpha.1
```

Open https://github.com/liujiarui0918/mandate/releases/new — write the release notes summarizing what npm install gets users.

---

## 7. Post-publish housekeeping

### Bump version for next iteration

```bash
# At project root
npm version prerelease --preid=alpha --workspaces --include-workspace-root
git push --follow-tags
```

This bumps every workspace package + root from `0.3.1-alpha.0` → `0.3.1-alpha.1` and creates a tag.

### If publish fails

| Error | Cause | Fix |
|---|---|---|
| `403 Forbidden — package name not yet available` | Scope not created | First publish to `@mandate/*` will create the scope automatically; ensure `--access public` is set |
| `402 You must sign up for private packages` | Forgot `--access public` for scoped pkg | Add `--access public` flag |
| `OTP required` | 2FA enabled | Enter the 6-digit code from your authenticator |
| `Cannot publish over existing version` | Version already published | Bump version with `npm version patch` (or `prerelease --preid=alpha`) |

---

## 8. Unpublish window (72 hours)

If something is broken right after publish, you have 72 hours to unpublish:

```bash
npm unpublish @mandate/validators@0.3.0-alpha.0
```

After 72 hours, npm only allows deprecation, not removal:

```bash
npm deprecate @mandate/validators@0.3.0-alpha.0 "broken — use 0.3.0-alpha.1 instead"
```

---

## 9. Trademark + ownership

`@mandate` scope on npm is yours after first publish. Lock it down:

```bash
# Add a maintainer (optional)
npm owner add <username> @mandate/validators

# View current owners
npm owner ls @mandate/validators
```

---

## 10. After v0.3.1-alpha is on npm

Update root `README.md` to remove the "until npm publish, run from this repo" callout — `npx create-mandate` now Just Works.
