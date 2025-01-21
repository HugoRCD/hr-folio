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
    'mockline',
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
          langs: ['ts', 'js', 'json', 'vue', 'dockerfile', 'docker', 'yaml', 'css']
        }
      },
    },
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true,
    },
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
      routes: ['/', 'sitemap', '/works', '/about', '/writing'],
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
