# Publishing

Use this when the repo contains publishable npm packages.

## pkg-pr-new (CI publish job)

Add a `publish` job to `ci.yml` that runs after checks pass and only on PRs or manual dispatch.

```yml
  publish:
    if: ${{ github.event_name == 'pull_request' || github.event_name == 'workflow_dispatch' }}
    needs: [build, lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: latest
          cache: pnpm
      - run: corepack enable
      - run: pnpm install
      - run: pnpx pkg-pr-new publish --compact --no-template --pnpm './packages/<package-name>'
```

Notes:
- Adapt the `--pnpm` path(s) for mono vs single package.
- If no `test` job, remove it from `needs`.
- Requires the pkg-pr-new GitHub App installed on the repo.

## NPM Trusted Publishing (release workflow)

Requirements:
- Use OIDC (no npm tokens).
- Set top-level permissions to `{}`.
- Grant `id-token: write` and `contents: write` at the release job level.
- Pin action versions to commit SHAs.

Template:

```yml
name: release
on:
  push:
    tags:
      - 'v*'
permissions: {}

jobs:
  release:
    permissions:
      contents: write
      id-token: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<SHA>
        with:
          fetch-depth: 0
      - uses: actions/setup-node@<SHA>
        with:
          node-version: latest
      - run: corepack enable
      - run: pnpm install
      - run: pnpm build
      - run: pnpm publish --no-git-checks
```

Document required npm setup:
- In npmjs.com package settings, link the GitHub repo and workflow as a Trusted Publisher.
- Optionally enable "Require two-factor authentication and disallow tokens".
