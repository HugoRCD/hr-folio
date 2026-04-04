---
name: create-pr-commit
description: "Generate branch names, conventional commit messages, and PR titles from real project conventions. Use when asked to propose commit/PR text (especially /create-commit or /create-pr) while validating types/scopes against repo standards."
---

# Create Commit / PR / Branch Names

## Overview
Produce high-signal Git metadata that matches the repository's **actual** conventions instead of inventing random types or scopes.

## Workflow

1. **Classify the change intent**
   - Determine the primary change type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, or `revert`.
   - If multiple apply, choose the dominant user-facing impact.

2. **Discover project conventions before proposing text**
   - Inspect repo convention sources in this order:
     1. `.github/` (PR templates, issue forms, workflows, actions, labels, release config)
     2. `CONTRIBUTING*`, `README*`, commit lint config (`commitlint.*`, `package.json`, `.cz*`, `.commitlintrc*`)
     3. Existing git history (if available) for recurring scopes/types
   - Extract:
     - allowed commit types (if restricted)
     - known scopes (directory or domain names)
     - branch naming pattern (if documented)
     - title casing rules for PRs/commits

3. **Pick a scope using evidence**
   - Prefer scopes explicitly documented by the repo.
   - If none are documented, derive from affected area (e.g., `api`, `ui`, `docs`, `ci`).
   - **Never fabricate an arbitrary scope** when confidence is low.
   - If a new scope is reasonable, output: `suggest new scope: <scope>` with one short reason.

4. **Generate branch name options**
   - Output 1-3 options using detected pattern. If unknown, default to:
     - `<type>/<short-kebab-title>`
     - `<type>/<scope>-<short-kebab-title>` (only when scope is validated)

5. **Generate commit title options**
   - Output 1-3 options using:
     - `type(scope): title`
     - or `type: title` when scope is omitted.
   - Use lowercase English, imperative mood, no trailing period.
   - Keep under ~72 characters when possible.

6. **Generate PR title options**
   - Output 1-3 options aligned with repository style.
   - If no explicit PR style exists, mirror commit title semantics but allow natural readability.

7. **Return a compact rationale block**
   - Include:
     - `type chosen`
     - `scope source` (or `no reliable scope found`)
     - `branch pattern source` (or fallback used)

## Output Template

```text
branch names:
- ...
- ...

commit titles:
- ...
- ...

pr titles:
- ...
- ...

notes:
- type chosen: ...
- scope source: ...
- branch pattern source: ...
- suggest new scope: ... (optional)
```

## Heuristics

- Prefer clarity over cleverness.
- Omit scope when uncertain.
- Keep semantic consistency across branch, commit, and PR titles.
- Avoid over-specific scopes tied to one file unless repo conventions do so.

## Examples

- Branch: `docs/update-contributing-guidelines`
- Commit: `docs: update contributing guidelines`
- PR: `docs: update contributing guidelines`

- Branch: `feat/auth-add-oauth-callback`
- Commit: `feat(auth): add oauth callback handler`
- PR: `feat(auth): add oauth callback handler`

- Notes: `suggest new scope: auth-flow (repo has auth and billing, but no flow-level scope yet)`
