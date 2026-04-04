# Dependency & versioning tooling

## Renovate

Create `renovate.json` with the shared config:

```json
{
  "extends": ["github>hugorcd/renovate-config"]
}
```

Optional overrides:
- `ignoreDeps`: exclude dependencies.
- `packageRules`: disable updates for specific dep types.
- `postUpdateOptions`: add "pnpmDedupe" for lockfile dedupe.

## Changesets

`.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main"
}
```

## .npmrc

```ini
shamefully-hoist=true
auto-install-peers=true
```

## automd

`.config/automd.ts` (minimal example):

```ts
import { defineConfig } from 'automd'

export default defineConfig({
  contributors: true,
  sponsors: true,
})
```
