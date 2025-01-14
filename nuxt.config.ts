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

  /*robots: {
    disallow: ['/notes'],
  },*/

  routeRules: {
    '/': { isr: true },
  },

  modules: [
    'mockline',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@vueuse/nuxt',
    '@nuxtjs/seo'
  ],

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  sitemap: {
    enabled: false
  },
  robots: {
    enabled: false
  },
  schemaOrg: {
    enabled: false
  },
  linkChecker: {
    enabled: false
  },

  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['ts', 'js', 'json', 'vue', 'dockerfile', 'docker', 'yaml', 'css']
        }
      },
    },
    studio: {
      enabled: true,
      dev: true
    }
  },

  runtimeConfig: {
    public: {
      meetingLink: '',
    },
    private: {
      resendApiKey: '',
      notesPassword: '',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/works', '/about', '/writing'],
      ignore: ['/notes', '/notes/**'],
    },
  },

  ogImage: {
    zeroRuntime: true
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true },

  compatibilityDate: '2024-08-19',
})
