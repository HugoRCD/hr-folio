export default defineAppConfig({
  global: {
    meetingLink: 'https://cal.com/hugorcd/15min',
  },
  profile: {
    email: 'contact@hrcd.fr',
    phone: '(+33) 6 21 56 22 18',
    pictureDark: 'https://avatars.githubusercontent.com/u/71938701?v=4',
    pictureLight: 'https://media.licdn.com/dms/image/v2/D4D03AQG5Hn4JtQG7ng/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1706689509441?e=1750291200&v=beta&t=hJpMXuJ_AXFVrUkNMdYeSR_NGr0J5RiofEDsTRuX_fc'
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
      base: 'bg-primary rounded-none ring-0 px-2 py-1 focus:outline-none resize-none caret-primary'
    },
    textarea: {
      base: 'bg-primary rounded-none ring-0 px-2 py-1 focus:outline-none resize-none caret-primary'
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
          header: 'bg-muted/10',
          base: 'bg-muted/30',
        }
      },
      field: {
        slots: {
          name: 'text-highlighted',
        }
      },
      code: {
        variants: {
          color: {
            neutral: 'bg-muted/40 border-default/60',
          }
        },
      },
      codeCollapse: {
        variants: {
          open: {
            false: {
              footer: 'from-default'
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
        base: 'text-highlighted font-[450]'
      },
      icon: {
        base: 'text-highlighted'
      },
      p: {
        base: 'text-muted'
      },
      li: {
        base: 'text-muted'
      },
      a: {
        base: 'italic border-b border-(--color-primary) text-highlighted font-medium'
      }
    },
  },
})
