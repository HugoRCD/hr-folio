import { createCMS } from '@comark/cms'
import fs from '@comark/cms/sources/fs'
import json from '@comark/cms/plugins/json'
import highlight from '@comark/nuxt/plugins/highlight'
import toc from '@comark/nuxt/plugins/toc'

export const cms = createCMS({
  source: fs('./content'),
  plugins: [json()],
  comark: {
    plugins: [
      toc(),
      highlight({
        theme: {
          light: 'github-light',
          dark: 'github-dark',
          default: 'github-dark',
        },
      }),
    ],
  },
})
