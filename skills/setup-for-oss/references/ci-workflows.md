# CI workflows

Use these templates as starting points. Ensure each check runs as a separate job in `ci.yml`.

## .github/workflows/autofix.yml

```yml
name: autofix.ci
on:
  pull_request:
permissions: {}

jobs:
  autofix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: autofix-ci/action@v1
```

## .github/workflows/ci.yml

```yml
name: ci
on:
  pull_request:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: latest
          cache: pnpm
      - run: corepack enable
      - run: pnpm install
      - run: pnpm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: latest
          cache: pnpm
      - run: corepack enable
      - run: pnpm install
      - run: pnpm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: latest
          cache: pnpm
      - run: corepack enable
      - run: pnpm install
      - run: pnpm run typecheck

  test:
    if: ${{ false }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: latest
          cache: pnpm
      - run: corepack enable
      - run: pnpm install
      - run: pnpm run test
```

Notes:
- Replace pnpm commands with npm/yarn/bun based on detected package manager.
- Enable the `test` job only if tests exist.
- For monorepos, scope commands (e.g., `pnpm -r run build`).

## .github/workflows/semantic-pull-request.yml

```yml
name: semantic-pull-request
on:
  pull_request_target:
    types: [opened, edited, synchronize]
permissions:
  pull-requests: read

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## .github/workflows/label-pr.yml

```yml
name: label-pr
on:
  pull_request_target:
    types: [opened, edited, synchronize]
permissions:
  pull-requests: write

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Label by conventional commit type
        uses: actions/github-script@v7
        with:
          script: |
            const title = context.payload.pull_request.title;
            const match = title.match(/^(\w+)(\(.+\))?:/);
            if (!match) return;
            const type = match[1];
            const map = {
              feat: 'feature',
              fix: 'bug',
              docs: 'docs',
              refactor: 'refactor',
              chore: 'chore',
              test: 'test',
              ci: 'ci',
              build: 'build'
            };
            const label = map[type] || type;
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              labels: [label]
            });
```
