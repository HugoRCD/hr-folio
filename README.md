![Portfolio Social Preview](./public/images/banner.jpg)

# hugorcd.com

Minimal, content-driven portfolio built with [Nuxt](https://nuxt.com), [Nuxt UI](https://ui.nuxt.com), and [Nuxt Content](https://content.nuxt.com).

[![Website](https://img.shields.io/badge/hugorcd.com-000?style=flat-square&logo=vercel&logoColor=white)](https://hugorcd.com)
[![License](https://img.shields.io/github/license/HugoRCD/hr-folio?style=flat-square&color=blue)](./LICENSE)
[![Install in Cursor](https://hugorcd.com/mcp/badge.svg)](https://hugorcd.com/mcp/deeplink)
[![Install in VS Code](https://hugorcd.com/mcp/badge.svg?ide=vscode)](https://hugorcd.com/mcp/deeplink?ide=vscode)

## Stack

- **[Nuxt 4](https://nuxt.com)** — framework
- **[Nuxt UI](https://ui.nuxt.com)** — components & theming
- **[Nuxt Content](https://content.nuxt.com)** — markdown & JSON collections
- **[Nuxt SEO](https://nuxtseo.com)** — meta, OG images, sitemap, robots
- **[MCP Toolkit](https://mcp-toolkit.nuxt.dev)** — AI-accessible content via Model Context Protocol
- **[Vercel](https://vercel.com)** — hosting, analytics, speed insights

## Content

All content lives in `content/` as markdown or JSON:

```
content/
├── index.md              # Home page (hero, experience, projects, writing)
├── writing.md            # Writing listing page
├── works.md              # Works listing page
├── clipboard.md          # Clipboard listing page
├── 1.works/*.json        # Project data
├── 2.writing/*.md        # Blog posts
└── 3.clipboard/*.md      # Weekly clipboard posts
```

### Adding content

**New article** — create a `.md` file in `content/2.writing/`:

```yaml
---
title: My Article
description: A short description.
date: 2026-04-04
tags: [nuxt, vue]
---
```

**New project** — create a `.json` file in `content/1.works/`:

```json
{
  "name": "Project Name",
  "description": "Short description.",
  "url": "https://example.com",
  "category": "author",
  "date": "2026-01-01",
  "tags": ["nuxt", "open-source"]
}
```

**New clipboard post** — create a `.md` file in `content/3.clipboard/`:

```yaml
---
title: "Clipboard #2"
date: 2026-04-14
---
```

Rich components available in clipboard posts: `::spotify-embed`, `::video-embed`, `::link-card`, `::quote`.

## MCP Server

The portfolio exposes a read-only MCP server at [`/mcp`](https://hugorcd.com/mcp) with tools to query content programmatically.

```bash
npx add-mcp https://hugorcd.com/mcp
```

## Agent Skills

Reusable skills for AI coding agents, discoverable via `/.well-known/skills/`. Install with the [skills CLI](https://github.com/vercel-labs/skill):

```bash
npx skills add https://hugorcd.com
```

## Development

```bash
pnpm install
pnpm dev
```

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/contributions.md" -->

## Contributing
To start contributing, you can follow these steps:

1. First raise an issue to discuss the changes you would like to make.
2. Fork the repository.
3. Create a branch using conventional commits and the issue number as the branch name. For example, `feat/123` or `fix/456`.
4. Make changes following the local development steps.
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
6. If your changes affect the code, run tests using `pnpm run test`.
7. Create a pull request following the [Pull Request Template](https://github.com/HugoRCD/markdown/blob/main/src/pull_request_template.md).
   - To be merged, the pull request must pass the tests/workflow and have at least one approval.
   - If your changes affect the documentation, make sure to update it.
   - If your changes affect the code, make sure to update the tests.
8. Wait for the maintainers to review your pull request.
9. Once approved, the pull request will be merged in the next release !

<!-- /automd -->

<!-- automd:fetch url="gh:hugorcd/markdown/main/src/sponsors.md" -->

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/HugoRCD">
    <img src='https://cdn.jsdelivr.net/gh/hugorcd/static/sponsors.svg' alt="HugoRCD sponsors" />
  </a>
</p>

<!-- /automd -->

<!-- automd:contributors license=Apache author=HugoRCD github="hugorcd/hr-folio" -->

Published under the [APACHE](https://github.com/hugorcd/hr-folio/blob/main/LICENSE) license.
Made by [@HugoRCD](https://github.com/HugoRCD) and [community](https://github.com/hugorcd/hr-folio/graphs/contributors) 💛
<br><br>
<a href="https://github.com/hugorcd/hr-folio/graphs/contributors">
<img src="https://contrib.rocks/image?repo=hugorcd/hr-folio" />
</a>

<!-- /automd -->
