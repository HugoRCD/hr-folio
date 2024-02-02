// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      viewport: "width=device-width, initial-scale=1",
      charset: "utf-8",
      meta: [
        {
          name: "author",
          content: "Hugo Richard",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
      ],
    },
  },

  site: {
    url: 'https://hrcd.fr',
    name: 'Hugo Richard',
    description: 'Hugo Richard, french developer and designer based in Nice.',
    defaultLocale: 'en',
    indexable: true,
  },

  routeRules: {
    "/": { isr: true, prerender: true },
  },

  modules: ['blanked', '@nuxt/content', '@nuxthq/studio', "@nuxt/image", "@nuxtjs/seo"],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    }
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
      theme: "github-dark",
    },
    markdown: {
      anchorLinks: false,
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml'],
    },
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/urls'
    ]
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
