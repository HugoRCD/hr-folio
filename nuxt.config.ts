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

  modules: ['blanked', '@nuxt/content'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
  },

  content: {
    highlight: {
      theme: "github-dark",
    },
    markdown: {
      anchorLinks: false,
    },
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true }
})
