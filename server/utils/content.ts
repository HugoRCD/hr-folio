import { comarkContent } from 'comark-content'
import fs from 'comark-content/sources/fs'
import sqlite from 'comark-content/database/sqlite-node'
import json from 'comark-content/plugins/json'
import sqlQuery from 'comark-content/plugins/sql-query'
import sqliteFullTextSearch from 'comark-content/plugins/sqlite-full-text-search'
import toc from 'comark/plugins/toc'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

// In-memory (`sqlite()` defaults to `:memory:`) — content is bundled per deploy and
// never mutates at runtime, so each warm Fluid Compute instance can cheaply rebuild
// its indexes lazily on first use. No disk/persistence needed. Shared by both plugins
// below: `sqlQuery` for structured lookups over flat JSON sources (e.g. `works`), and
// `sqliteFullTextSearch` for ranked full-text search over markdown bodies (`pages`).
const database = sqlite()

export const content = comarkContent({
  sources: {
    pages: fs('./content/pages'),
    works: fs('./content/works', { prefix: '/works' }),
    about: fs('./content/about.json'),
  },
  markdown: {
    plugins: [
      toc({ depth: 2 }),
      highlight({
        themes: { light: githubLight, dark: githubDark },
      }),
    ],
  },
  plugins: [json(), sqlQuery({ database }), sqliteFullTextSearch({ database })],
})
