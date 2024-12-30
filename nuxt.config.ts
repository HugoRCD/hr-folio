export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  /*site: {
    url: 'https://hrcd.fr',
    name: 'Hugo Richard - Developer & Designer',
    description: 'Hugo Richard, french developer and designer based in Nice.',
    defaultLocale: 'en',
    indexable: true,
  },*/

  /*robots: {
    disallow: ['/notes'],
  },*/

  routeRules: {
    '/': { isr: true, prerender: true },
  },

  modules: [
    'mockline',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@vueuse/nuxt',
  ],

  content: {
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
    },
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true },

  compatibilityDate: '2024-08-19',
})
