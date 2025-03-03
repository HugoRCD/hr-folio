export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  experimental: {
    viewTransition: true,
  },

  site: {
    url: 'https://hrcd.fr',
    defaultLocale: 'en',
    indexable: true,
  },

  robots: {
    disallow: ['/notes'],
  },

  routeRules: {
    '/': { isr: true },
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@vueuse/nuxt'
  ],

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  sitemap: {
    exclude: ['/notes'],
  },

  content: {
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
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true,
    },
  },

  runtimeConfig: {
    private: {
      resendApiKey: '',
      notesPassword: '',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml', '/works', '/about', '/writing'],
      ignore: ['/notes', '/notes/**'],
    },
  },

  ogImage: {
    zeroRuntime: true
  },

  imports: {
    presets: [
      {
        from: 'vue-sonner',
        imports: ['toast'],
      },
    ],
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true },

  compatibilityDate: '2024-08-19',

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
})
