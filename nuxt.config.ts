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

  robots: {
    disallow: ['/notes'],
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

  modules: ['@nuxt/ui', '@nuxtjs/seo', '@nuxt/content', '@nuxt/image', '@nuxt/scripts', '@vueuse/nuxt', 'nuxt-llms', 'motion-v/nuxt', 'vue-sonner/nuxt', 'nuxt-studio'],

  llms: {
    domain: 'https://hrcd.fr',
    title: 'Hugo Richard Portfolio',
    description: 'Software Engineer at Vercel, specializing in Vue.js and Nuxt ecosystem',
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
    notes: ['Hugo Richard is a Software Engineer at Vercel, contributing to the Vercel ecosystem. This portfolio showcases his professional work, technical writings, and projects. For direct inquiries or collaboration opportunities, please reach out through the contact information provided on the website.']
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
        provider: 'local',
        weights: [400, 700],
        styles: ['normal', 'italic'],
        src: [
          {
            weight: 400,
            style: 'normal',
            src: '/fonts/Redaction-Regular.otf'
          },
          {
            weight: 400,
            style: 'italic',
            src: '/fonts/Redaction-Italic.otf'
          },
          {
            weight: 700,
            style: 'normal',
            src: '/fonts/Redaction-Bold.otf'
          }
        ]
      }
    ]
  },
})
