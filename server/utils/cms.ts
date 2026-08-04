import { createContent } from 'comark-content'
import fs from 'comark-content/sources/fs'
import json from 'comark-content/plugins/json'
import toc from 'comark/plugins/toc'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

export const cms = createContent({
  basePath: '/api/cms',
  sources: {
    pages: fs('./content', {
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
