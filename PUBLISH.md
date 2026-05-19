# Mandate npm Publish Playbook

Step-by-step guide to publish the four Mandate npm packages.

> **Status as of v0.3.0-alpha.1 (2026-05-19):** All four packages live on npm.
>
> | Package | Version | Notes |
> |---|---|---|
> | [`@mandateai/validators`](https://www.npmjs.com/package/@mandateai/validators) | 0.3.0-alpha.1 | foundation, no internal deps |
> | [`@mandateai/runtime`](https://www.npmjs.com/package/@mandateai/runtime) | 0.3.0-alpha.1 | depends on validators |
> | [`@mandateai/cli`](https://www.npmjs.com/package/@mandateai/cli) | 0.3.0-alpha.1 | depends on runtime + validators, exposes `mandate` + `create-mandate` bins |
> | [`create-mandate`](https://www.npmjs.com/package/create-mandate) | 0.3.0-alpha.1 | top-level scaffolder, thin wrapper around `@mandateai/cli` |
>
> v0.4 will add `@mandateai/adapters`, `@mandateai/registry`, `@mandateai/packs-imperial-v1`.

---

## 1. npm Name Availability (2026-05 status)

| Package | Status |
|---|---|
| `@mandateai/validators` | ✅ owned (published) |
| `@mandateai/runtime` | ✅ owned (published) |
| `@mandateai/cli` | ✅ owned (published) |
| `create-mandate` | ✅ owned (published) |
| `@mandateai/adapters` | ✅ available (v0.4) |
| `@mandateai/registry` | ✅ available (v0.4) |
| `@mandateai/packs-imperial-v1` | ✅ available (v0.4) |
| `@mandate/*` | ❌ scope taken on npm — original target was `@mandate` but the org name was claimed by someone else. Renamed everything to `@mandateai`. |
| `mandate` | ❌ taken — use `create-mandate` as the unscoped entry name. |

---

## 2. Prerequisites (one-time setup)

### 2.1 npm account & 2FA

npm now (post-2025-11) **requires 2FA or a granular token with "Bypass 2FA" for all publish operations**. Classic tokens were revoked on 2025-12-09.

```bash
npm whoami
# If not logged in:
npm login
```

### 2.2 Organization

`@mandateai` scope is owned by the `mandateai` organization on npm. To publish, you must be a member of that org. If you're forking, create your own org first:

1. Go to https://www.npmjs.com/org/create
2. Pick an org name (becomes your scope), select **Free** plan (public packages)
3. Org name must be unique across all npm users + orgs

### 2.3 Granular Access Token

Token UI: https://www.npmjs.com/settings/~/tokens → **Generate New Token** → **Granular Access Token**

For publishing all four packages (including the unscoped `create-mandate`), the token needs:

| Field | Value |
|---|---|
| Name | e.g. `mandateai-publish` |
| Expiration | 90 days (max for write tokens) |
| Permissions | **Read and write** |
| Packages and scopes | **All packages** (required because `create-mandate` is unscoped — a scope-only token can't touch it) |
| **Bypass 2FA** | ✅ **must be enabled** for non-interactive publish |
| IP allowlist | (optional) leave empty |

Add to `~/.npmrc`:

```
//registry.npmjs.org/:_authToken=npm_xxxxxxxx
```

> ⚠️ **A scope-limited token (only `@mandateai`) cannot publish a brand-new unscoped package like `create-mandate`.** Use All Packages. After the package exists on npm, you can switch to a narrower token.

### 2.4 Git working tree clean

```bash
cd /path/to/mandate
git status              # should be clean
npm install             # install all workspaces
npm test                # all packages must pass
```

---

## 3. Publish order

Strict dependency order:

```
validators → runtime → cli → create-mandate
```

Each `cd` + `npm publish --access public --tag alpha`.

### 3.1 `@mandateai/validators` (no internal deps)

```bash
cd packages/validators
npm publish --dry-run --access public --tag alpha   # inspect tarball
npm publish --access public --tag alpha
```

Tarball must include `spec/*.schema.json` (without these, downstream `mandate validate` fails with ENOENT — see §6).

### 3.2 `@mandateai/runtime` (depends on validators)

```bash
cd ../runtime
npm publish --access public --tag alpha
```

### 3.3 `@mandateai/cli` (depends on runtime + validators)

```bash
cd ../cli
npm publish --access public --tag alpha
```

### 3.4 `create-mandate` (depends on cli)

```bash
cd ../create-mandate
npm publish --access public --tag alpha
```

After this, `npx create-mandate my-empire` works for everyone.

---

## 4. Why `--tag alpha`?

Prerelease versions (anything with `-alpha`, `-beta`, etc.) **cannot use the default `latest` dist-tag** — npm rejects with "You must specify a tag using --tag when publishing a prerelease version." Use `--tag alpha` to publish to the `alpha` dist-tag instead. Users who `npm install @mandateai/cli` without specifying `@alpha` will not get prereleases.

---

## 5. Verify the live experience

From a fresh directory (uses real npm registry, not local):

```bash
cd /tmp
npx --yes create-mandate@alpha test-empire --template both
# Expected:
# ok Mandate court scaffolded at /tmp/test-empire/.mandate (template=both)

cd test-empire
npx --yes -p @mandateai/cli@alpha mandate validate .
# Expected:
# 📜 mandate validate — /tmp/test-empire
#   ✓ constitution.yaml schema
#   ✓ decomposition.yaml (optional) (skipped)
# ✓ All checks passed.
```

The `-p @mandateai/cli@alpha` flag is necessary because npm's `npx mandate` would look for a top-level package named `mandate` (which is taken by someone else); we have to point it at the scoped package and ask for the `mandate` bin.

---

## 6. Known issue & fix: schema file packaging

**Bug discovered after 0.3.0-alpha.0:** `@mandateai/validators` looked for JSON Schema files at `<package>/../../../spec/`, which works in the monorepo but **does not exist after `npm install`**. Result: `mandate validate` crashed with `ENOENT: spec/constitution.schema.json`.

**Fix in 0.3.0-alpha.1:**

1. Copy `spec/*.schema.json` into `packages/validators/spec/` (physical copy, packaged with `npm publish`)
2. Update `packages/validators/package.json` `files` array to include `"spec"`
3. Update `resolveSchemaRoot()` in `schema-validator.mjs` to check `<package>/spec/` first, then fall back to `<repo>/spec/` for monorepo development:

   ```js
   const packaged = resolve(__dirname, '../spec');
   if (existsSync(packaged)) return packaged;
   return resolve(__dirname, '../../../spec');
   ```

When making any new package, double-check the `files` array — anything outside `src/` (schemas, templates, config) must be listed explicitly.

---

## 7. Tag the GitHub release

```bash
cd /path/to/mandate
git tag -a v0.3.0-alpha.1 -m "v0.3.0-alpha.1: 4 npm packages live (@mandateai/{validators,runtime,cli} + create-mandate)"
git push origin v0.3.0-alpha.1
```

Open https://github.com/liujiarui0918/mandate/releases/new — write release notes summarizing what `npx create-mandate` gives users.

---

## 8. Post-publish housekeeping

### Bump version for next iteration

```bash
# At project root — bumps every workspace + root
npm version prerelease --preid=alpha --workspaces --include-workspace-root
git push --follow-tags
```

### If publish fails

| Error | Cause | Fix |
|---|---|---|
| `404 Not Found - PUT @mandateai/...` | Token doesn't cover this scope/package (granular token snapshot) | Regenerate token after the org/scope exists; or use All Packages |
| `403 Forbidden — Two-factor authentication required` | Token created without Bypass 2FA | Regenerate token, enable Bypass 2FA |
| `403 Forbidden — You may not perform that action` | Token scope mismatch (e.g. scoped token trying to publish unscoped `create-mandate`) | Use All Packages token |
| `402 Payment required` | Forgot `--access public` for scoped pkg | Add `--access public` |
| `You must specify a tag using --tag` | Prerelease version (`-alpha.N`) without explicit dist-tag | Add `--tag alpha` |
| `Cannot publish over existing version` | Version already on npm | Bump version (npm doesn't allow republish of same version even after unpublish) |

---

## 9. Unpublish window (72 hours)

If something is broken right after publish:

```bash
npm unpublish @mandateai/validators@0.3.0-alpha.0
```

After 72 hours, npm only allows deprecation:

```bash
npm deprecate @mandateai/validators@0.3.0-alpha.0 "broken — use 0.3.0-alpha.1 instead (schema files missing)"
```

> The broken `0.3.0-alpha.0` of all four packages can be deprecated/unpublished — `0.3.0-alpha.1` supersedes them.

---

## 10. Ownership

`@mandateai` org and `create-mandate` are owned by `ljrwcx99` after first publish.

```bash
# Add a maintainer
npm owner add <username> @mandateai/validators

# View current owners
npm owner ls @mandateai/validators
```

---

## 11. Token hygiene

Tokens used during a publish session are sensitive credentials. After publishing:

1. **If a token was exposed** (in chat, terminal screenshot, log files, etc.) — **revoke immediately** at https://www.npmjs.com/settings/~/tokens
2. **For routine local publishing** — use a token with the narrowest possible scope. A 90-day token limited to `@mandateai` is fine after the org exists; All Packages is only needed when bootstrapping new unscoped packages.
3. **For CI/CD** — prefer [Trusted Publishing with OIDC](https://docs.npmjs.com/trusted-publishers/) over long-lived tokens.

---

## 12. After publish — README cleanup

Update root `README.md` to drop any "until npm publish, run from this repo" callout — `npx create-mandate@alpha` now Just Works. (As of 2026-05-19, the four packages are live.)
