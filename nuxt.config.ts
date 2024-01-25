// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",
      charset: "utf-8",
    },
    pageTransition: {
      name: "fade",
      mode: "out-in",
    },
  },

  routeRules: {
    "/": { isr: true, prerender: true },
  },

  modules: ['blanked', '@nuxt/content', '@nuxthq/studio'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'hr-folio-color-mode',
  },

  content: {
    highlight: {
      theme: "github-dark",
    },
    markdown: {
      anchorLinks: false,
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true }
})
