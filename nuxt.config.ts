export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  experimental: {
    viewTransition: true,
  },

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
    'nuxt-llms',
    'motion-v/nuxt'
  ],

  llms: {
    domain: 'https://hrcd.fr',
    title: 'Hugo Richard Portfolio',
    description: 'Frontend Engineer at Nuxtlabs, specializing in Vue.js and Nuxt ecosystem',
    full: {
      title: 'Hugo Richard Portfolio - Complete Content',
      description: 'Comprehensive documentation of Hugo Richard\'s professional experience, projects, skills, and writings as a Frontend Engineer at Nuxtlabs.',
    },
    sections: [
      {
        title: 'Home',
        description: 'Overview of Hugo Richard\'s professional profile and featured projects.',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: '=', value: '/' }]
      },
      {
        title: 'About',
        description: 'Detailed information about Hugo Richard\'s professional background, skills, and experience.',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/about%' }]
      },
      {
        title: 'Writings',
        description: 'Technical articles, tutorials, and insights about frontend development, Vue.js, and the Nuxt ecosystem.',
        contentCollection: 'writing',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/writing%' }]
      },
      {
        title: 'Works',
        description: 'Showcase of notable projects and contributions to the web development community.',
        contentCollection: 'content',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/works%' }]
      }
    ],
    notes: ['Hugo Richard is a Frontend Engineer at Nuxtlabs, contributing to the Nuxt.js ecosystem. This portfolio showcases his professional work, technical writings, and projects. For direct inquiries or collaboration opportunities, please reach out through the contact information provided on the website.']
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
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
      api: 'https://api.nuxt.studio'
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
      routes: [
        '/',
        '/sitemap.xml',
        '/works',
        '/about',
        '/about/timeline',
        '/writing',
        '/canvas/works'
      ],
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
