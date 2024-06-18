export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        {
          name: 'author',
          content: 'Hugo Richard',
        },
      ],
      script: [
        {
          'src': 'https://analytics.hrcd.fr/js/script.js',
          'defer': true,
          'data-domain': 'hrcd.fr',
        },
      ],
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
    '@mockline/utils',
    '@nuxtjs/plausible',
    '@nuxt/content',
    '@nuxthq/studio',
    '@nuxt/image',
    '@nuxtjs/seo',
  ],

  plausible: {
    apiHost: 'https://analytics.hrcd.fr',
    ignoredHostnames: ['localhost'],
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      meetingLink: process.env.NUXT_PUBLIC_MEETING_LINK,
    },
    private: {
      resendApiKey: process.env.NUXT_PRIVATE_RESEND_API_KEY,
      notesPassword: process.env.NUXT_PRIVATE_NOTES_PASSWORD,
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'hr-folio-color-mode',
  },

  content: {
    documentDriven: true,
    highlight: {
      theme: 'github-dark',
    },
    markdown: {
      anchorLinks: false,
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
})
