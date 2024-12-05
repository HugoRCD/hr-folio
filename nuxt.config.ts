export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  site: {
    url: 'https://hrcd.fr',
    name: 'Hugo Richard - Developer & Designer',
    description: 'Hugo Richard, french developer and designer based in Nice.',
    defaultLocale: 'en',
    indexable: true,
  },

  robots: {
    disallow: ['/notes'],
  },

  routeRules: {
    '/': { isr: true, prerender: true },
    '/notes/**': { robots: false },
  },

  modules: [
    'mockline',
    '@nuxt/content',
    '@nuxthq/studio',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxt/scripts',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      meetingLink: '',
    },
    private: {
      resendApiKey: '',
      notesPassword: '',
    },
  },

  icon: {
    class: 'fill-current',
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true
    },
    provider: 'iconify'
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'hr-folio-color-mode',
  },

  content: {
    markdown: {
      anchorLinks: false,
    },
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
        light: 'github-light',
      },
      preload: ['diff', 'ts', 'js', 'css', 'bash', 'json'],
    },
    sources: {
      github: {
        prefix: '/notes',
        driver: 'github',
        repo: 'HugoRCD/notes',
        branch: 'main',
        dir: 'src',
        token: process.env.NUXT_PRIVATE_GITHUB_TOKEN,
      },
    }
  },

  nitro: {
    preset: process.env.NITRO_PRESET || 'bun',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/works', '/about', '/writing', '/sitemap.xml'],
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/notes/**'],
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true },

  image: {
    screens: {
      avatar: 80,
      small: 160,
    },
  },

  compatibilityDate: '2024-08-19',
})
