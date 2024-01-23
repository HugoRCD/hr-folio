// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['blanked', '@nuxt/content'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
  },

  css: ['~/main.css'],

  devtools: { enabled: true }
})
