import { Writing } from './.nuxt/components.d'

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
    '@vueuse/nuxt',
    'nuxt-llms'
  ],

  llms: {
    domain: 'https://hrcd.fr',
    title: 'Hugo Richard Portfolio',
    description: 'Fronted Engineer at Nuxtlabs',
    full: {
      title: 'Hugo Richard Portfolio Full Content',
      description: 'Complete Content of Hugo Richard Portfolio',
    },
    sections: [
      {
        title: 'About',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/about%' }]
      },
      {
        title: 'Works',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/works%' }]
      },
      {
        title: 'Writings',
        contentCollection: 'writing',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/writing%' }]
      },
      {
        title: 'Home',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/index%' }]
      },
    ],
  },

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
