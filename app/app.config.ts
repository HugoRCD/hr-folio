export default defineAppConfig({
  profile: {
    email: 'contact@hrcd.fr',
    picture: 'https://avatars.githubusercontent.com/u/71938701?v=4',
  },
  seo: {
    title: 'Hugo Richard',
    description: 'Software Engineer & Designer at Vercel',
    url: 'https://hrcd.fr',
    lang: 'en'
  },
  socials: {
    github: 'https://git.new/hugorcd',
    twitter: 'https://dub.sh/hrcd-x',
    linkedin: 'https://dub.sh/hrcd-linkedin',
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
    prose: {
      codeIcon: {
        'shelve.json': 'custom:shelve',
        'docker-compose.yml': 'simple-icons:docker',
        'Dockerfile': 'simple-icons:docker'
      },
      code: {
        base: 'px-1.5 py-0.5 text-[13px] font-mono font-normal rounded-md inline-block',
        variants: {
          color: {
            neutral: 'code-inline',
          }
        },
      },
      h1: {
        base: 'text-xl font-serif font-medium'
      },
      h2: {
        base: 'text-lg font-serif font-medium'
      },
      h3: {
        base: 'text-base font-serif font-medium'
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
      li: {
        base: 'text-muted'
      },
      a: {
        base: 'border-b border-primary text-highlighted'
      }
    },
  }
})
