export default defineAppConfig({
  global: {
    meetingLink: 'https://cal.com/hugorcd/15min',
  },
  profile: {
    email: 'contact@hrcd.fr',
    phone: '(+33) 6 21 56 22 18',
    picture: 'https://avatars.githubusercontent.com/u/71938701?v=4'
  },
  seo: {
    title: 'Hugo Richard',
    description: 'Frontend Architect, Designer & OSS Contributor based in Nice.',
    url: 'https://hrcd.fr',
    lang: 'en'
  },
  socials: {
    github: 'https://git.new/hugorcd',
    twitter: 'https://dub.sh/hrcd-x',
    linkedin: 'https://dub.sh/hrcd-linkedin',
    instagram: 'https://dub.sh/hrcd-insta',
    spotify: 'https://spti.fi/HugoRCD'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
  ui: {
    colors: {
      neutral: 'neutral'
    },
    icons: {
      loading: 'lucide:loader',
    },
    input: {
      base: 'bg-primary rounded-none ring-0 px-2 py-1 focus:outline-none resize-none caret-accent'
    },
    textarea: {
      base: 'bg-primary rounded-none ring-0 px-2 py-1 focus:outline-none resize-none caret-accent'
    }
  },
  uiPro: {
    prose: {
      codeIcon: {
        'shelve.json': 'custom:shelve',
        'docker-compose.yml': 'simple-icons:docker',
        'Dockerfile': 'simple-icons:docker'
      },
      pre: {
        slots: {
          header: 'bg-(--ui-bg-muted)/10',
          base: 'bg-(--ui-bg-muted)/30',
        }
      },
      field: {
        slots: {
          name: 'text-(--ui-text-highlighted)',
        }
      },
      code: {
        variants: {
          color: {
            neutral: 'bg-(--ui-bg-muted)/40 border-(--ui-border)/60',
          }
        },
      },
      codeCollapse: {
        variants: {
          open: {
            false: {
              footer: 'from-(--ui-bg)'
            }
          }
        }
      },
      h1: {
        base: 'text-2xl sm:text-3xl font-serif italic font-[500]'
      },
      hr: {
        base: 'my-2'
      },
      strong: {
        base: 'text-(--ui-text-highlighted) font-[450]'
      },
      icon: {
        base: 'text-(--ui-text-highlighted)'
      },
      p: {
        base: 'text-(--ui-text-muted)'
      },
      li: {
        base: 'text-(--ui-text-muted)'
      },
      a: {
        base: 'italic border-b border-(--color-accent) text-(--ui-text-highlighted) font-medium'
      }
    },
  },
})
