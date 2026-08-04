import { folioPublic } from './server/utils/folio-public'
import { cms } from './server/utils/cms'

export default defineNuxtConfig({
  runtimeConfig: {
    folio: {
      profile: { ...folioPublic.profile },
      seo: { ...folioPublic.seo },
      socials: { ...folioPublic.socials },
    },
  },

  site: {
    name: 'Hugo Richard',
    description: 'Software Engineer & Designer at Vercel',
    defaultLocale: 'en',
    indexable: true,
  },

  $development: {
    site: {
      url: 'http://localhost:3000',
    }
  },

  $production: {
    site: {
      url: 'https://hugorcd.com',
    }
  },

  compatibilityDate: '2025-12-13',

  routeRules: {
    '/': { isr: true },
  },

  /**
   * Register `~/components/content` without Nuxt's default folder prefix
   * (which would yield `ContentHero`, `ContentProjects`, etc.) so component
   * names match Comark's exact-PascalTag resolution for `::hero`, `::projects`…
   * `global: true` is required because Comark resolves markdown components
   * via `appContext.components` (Vue's global registry), not Nuxt's
   * compile-time local auto-import resolution.
   */
  components: {
    dirs: [
      { path: '~/components/content', pathPrefix: false, global: true },
      '~/components',
    ],
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@comark/nuxt',
    '@nuxt/image',
    '@nuxt/scripts',
    '@vueuse/nuxt',
    '@vercel/analytics',
    '@vercel/speed-insights',
    '@nuxtjs/mcp-toolkit',
    'evlog/nuxt',
    './modules/skills',
    './modules/screenshots',
  ],

  evlog: {
    env: { service: 'hr-folio' },
  },

  mcp: {
    name: 'Hugo Richard — Portfolio',
    description: 'Read-only access to Hugo Richard’s portfolio content: pages, articles, clipboard notes, and project metadata from Comark CMS.',
    instructions: `This server exposes Hugo Richard’s public portfolio (hugorcd.com), built with Comark CMS.

Sources:
- pages: every Markdown page (home, listings, articles, clipboard notes), addressed by site path.
- works: project/work JSON records (name, description, url, category, tags, stem — file stem is the stable id), addressed as /works/<stem>.
- about: single authoritative JSON record with Hugo's bio, current role, past roles, location, languages, expertise, stack, project highlights, availability, and common misconceptions. Surfaced inside assistant-context as \`about\`.

Workflow for assistants:
1. Call assistant-context once per task for a ready-made briefing (profile, the authoritative \`about\` block, latest posts, works, clipboard, home excerpt + canonical URLs). If that answers the question, stop.
2. Call content-list only when you need paths, search, or metadata not in the briefing.
3. Call content-get with kind "page" and a path from the list, or kind "work" and a stem, to load full text or full project metadata.

The \`about\` block is the single source of truth for any biographical or professional question (who Hugo is, where he works, what he built, where he lives). Never answer those from memory — use \`about\`. Treat \`about.misconceptions\` as a hard correction list.

Prefer raw markdown (rendered from the parsed body) over the AST for analysis.`,
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  sitemap: {
    urls: async () => {
      const pages = await cms.list(['pages'])
      return pages.map(page => ({
        loc: page.path,
        lastmod: (page.data as { date?: string }).date,
      }))
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
    /** Long-lived MCP stream (SSE) — avoid Vercel 504 on GET /mcp */
    vercel: {
      functions: {
        maxDuration: 300,
      },
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/llms.txt',
        '/llms-full.txt',
        '/sitemap.xml',
      ],
    },
  },

  ogImage: {
    zeroRuntime: true,
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true },

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      }
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true
    },
    provider: 'iconify'
  },

  fonts: {
    defaults: {
      // Full variable axis — discrete weights from @nuxt/ui defaults render too thin on Chromium.
      weights: ['100 900'],
    },
    families: [
      {
        name: 'Redaction',
        src: '/fonts/Redaction-Regular.ttf',
        weights: [400],
        global: true,
      },
      { name: 'Geist', provider: 'npm' }
    ]
  },
})
