export default defineNuxtConfig({
  site: {
    defaultLocale: 'en',
    indexable: true,
  },

  $development: {
    site: {
      url: 'http://localhost:3000',
    }
  },

  $production: {
    site: {
      url: 'https://hrcd.fr',
    }
  },

  compatibilityDate: '2025-12-13',

  routeRules: {
    '/': { isr: true },
  },

  studio: {
    route: '/admin',
    repository: {
      provider: 'github',
      owner: 'HugoRCD',
      repo: 'hr-folio',
    }
  },

  modules: ['@nuxt/fonts', '@nuxt/ui', '@nuxtjs/seo', '@nuxt/content', '@nuxt/image', '@nuxt/scripts', '@vueuse/nuxt', 'nuxt-llms', 'nuxt-studio', '@nuxt/hints', '@vercel/analytics', '@vercel/speed-insights'],

  llms: {
    domain: 'https://hrcd.fr',
    title: 'Hugo Richard Portfolio',
    description: 'Software Engineer & Designer at Vercel, specializing in Vue.js and Nuxt ecosystem',
    full: {
      title: 'Hugo Richard Portfolio - Complete Content',
      description: 'Comprehensive documentation of Hugo Richard\'s professional experience, projects, skills, and writings as a Software Engineer at Vercel.',
    },
    sections: [
      {
        title: 'Home',
        description: 'Overview of Hugo Richard\'s professional profile and featured projects.',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: '=', value: '/' }]
      },
      {
        title: 'Writings',
        description: 'Technical articles, tutorials, and insights about frontend development, Vue.js, and the Nuxt ecosystem.',
        contentCollection: 'writing',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/writing%' }]
      },
    ],
    notes: ['Hugo Richard is a Software Engineer & Designer at Vercel, contributing to the Nuxt ecosystem. This portfolio showcases his professional work, technical writings, and projects.']
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
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
  },

  runtimeConfig: {
    private: {
      resendApiKey: '',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/sitemap.xml',
      ],
    },
  },

  ogImage: {
    zeroRuntime: true,
  },

  css: ['~/assets/style/main.css'],

  devtools: { enabled: true },

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

  fonts: {
    families: [
      {
        name: 'Redaction',
        src: '/fonts/Redaction-Regular.ttf',
        weights: [400],
        global: true,
      },
    ]
  },
})
