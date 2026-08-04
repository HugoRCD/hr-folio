import { createCMS } from '@comark/cms'
import fs from '@comark/cms/sources/fs'
import json from '@comark/cms/plugins/json'
import toc from 'comark/plugins/toc'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

/**
 * Single content layer for the whole site, replacing `content.config.ts`.
 *
 * - `pages`   — every Markdown page (home, listings, articles, clipboard notes).
 *               Comark has no equivalent of Nuxt Content's numbered-folder
 *               ordering convention, so `content/1.works`, `content/2.writing`,
 *               and `content/3.clipboard` were renamed to drop the prefixes.
 * - `works`   — project/work JSON records, addressed as `/works/<stem>`.
 * - `about`   — the single authoritative bio JSON record, addressed as `/about`.
 */
export const cms = createCMS({
  sources: {
    pages: fs('./content', {
      // `picomatch` excludes need `**/.*/**` explicitly — `**` alone skips dotfiles.
      exclude: ['works/**', 'about.json', '**/.*/**', '**/.*', '**/node_modules/**'],
    }),
    works: fs('./content/works', {
      prefix: '/works',
      exclude: ['**/.*/**', '**/.*', '**/node_modules/**'],
    }),
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
  plugins: [json()],
})
