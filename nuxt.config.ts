import { folioPublic } from './server/utils/folio-public'

export default defineNuxtConfig({
  runtimeConfig: {
    /** GitHub login allowed for chat / owner APIs. Default HugoRCD; set NUXT_FOLIO_OWNER_GITHUB_LOGIN for forks. */
    folioOwnerGithubLogin: '',
    /** Max assistant turns per visitor per UTC day for POST /api/chat (owners unlimited). NUXT_FOLIO_VISITOR_CHAT_DAILY_LIMIT */
    folioVisitorChatDailyLimit: 20,
    folio: {
      profile: { ...folioPublic.profile },
      seo: { ...folioPublic.seo },
      socials: { ...folioPublic.socials },
    },
    github: {
      clientId: '',
      clientSecret: '',
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

  studio: {
    route: '/admin',
    repository: {
      provider: 'github',
      owner: 'HugoRCD',
      repo: 'hr-folio',
    }
  },

  modules: [
    '@nuxthub/core',
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@vueuse/nuxt',
    'nuxt-llms',
    'nuxt-studio',
    '@nuxt/hints',
    '@vercel/analytics',
    '@vercel/speed-insights',
    '@nuxtjs/mcp-toolkit',
    '@onmax/nuxt-better-auth',
    'evlog/nuxt',
    'workflow/nuxt',
    './modules/skills',
    './modules/screenshots',
  ],

  hub: {
    db: 'postgresql',
    kv: true,
  },

  auth: {
    hubSecondaryStorage: true,
    redirects: {
      login: '/login',
      guest: '/',
    },
  },

  evlog: {
    env: { service: 'hr-folio' },
  },

  mcp: {
    name: 'Hugo Richard — Portfolio',
    description: 'Read-only access to Hugo Richard’s portfolio content: pages, articles, clipboard notes, and project metadata from Nuxt Content.',
    instructions: `This server exposes Hugo Richard’s public portfolio (hugorcd.com), built with Nuxt Content.

Collections:
- content: main site pages (Markdown/MDC).
- writing: blog posts (title, description, date, tags, draft, body as raw markdown in rawbody).
- clipboard: short dated notes.
- works: project/work JSON (name, description, url, category, tags, stem — file stem is the stable id).

Workflow for assistants:
1. Call assistant-context once per task for a ready-made briefing (profile including email and socials, latest posts, works, clipboard, home excerpt + canonical URLs). If that answers the question, stop.
2. Call content-list only when you need paths, search, or metadata not in the briefing.
3. Call content-get with kind "page" and a path from the list, or kind "work" and a stem, to load full text or full project metadata.

Respect draft writing and clipboard entries only when includeDrafts is true on content-list. Prefer raw markdown (rawbody) over rendered AST for analysis.`,
  },

  llms: {
    domain: 'https://hugorcd.com',
    title: 'Hugo Richard Portfolio',
    description: 'Software Engineer & Designer at Vercel, specializing in Vue.js and Nuxt ecosystem',
    full: {
      title: 'Hugo Richard Portfolio - Complete Content',
      description: 'Comprehensive documentation of Hugo Richard\'s professional experience, projects, skills, and writings as a Software Engineer at Vercel.',
    },
    sections: [
      {
        title: 'Home',
        description: 'Overview of Hugo Richard\'s professional profile and featured projects.',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: '=', value: '/' }]
      },
      {
        title: 'Writings',
        description: 'Technical articles, tutorials, and insights about frontend development, Vue.js, and the Nuxt ecosystem.',
        contentCollection: 'writing',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/writing%' },
          { field: 'draft', operator: '=', value: false as unknown as string },
        ],
      },
      {
        title: 'Clipboard',
        description: 'Short notes, links, and weekly picks (published only).',
        contentCollection: 'clipboard',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/clipboard%' },
          { field: 'draft', operator: '=', value: false as unknown as string },
        ],
      },
    ],
    notes: ['Hugo Richard is a Software Engineer & Designer at Vercel, contributing to the Nuxt ecosystem. This portfolio showcases his professional work, technical writings, and projects.']
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  content: {
    database: {
      type: 'sqlite',
      filename: '/tmp/contents.sqlite',
    },
    build: {
      markdown: {
        highlight: {
          langs: ['ts', 'js', 'json', 'vue', 'dockerfile', 'docker', 'yaml', 'css'],
          theme: {
            light: 'github-light',
            dark: 'github-dark',
            default: 'github-dark'
          }
        }
      },
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
    /** Long-lived MCP stream (SSE) + chat tool loops — avoid Vercel 504 on GET /mcp */
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
    families: [
      {
        name: 'Redaction',
        src: '/fonts/Redaction-Regular.ttf',
        weights: [400],
        global: true,
      },
    ]
  },
})
