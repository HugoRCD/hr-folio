export default defineAppConfig({
  profile: {
    name: 'Hugo Richard',
    job: 'Frontend Architect and Designer',
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
  mockline: {
    darkCode: false,
    components: {
      proseH1: 'text-2xl sm:text-3xl text-font-primary font-newsreader italic font-[600]',
      proseH2: 'text-xl sm:text-2xl text-font-primary font-[550]',
      proseH3: 'text-lg sm:text-xl text-font-primary font-[500]',
      proseH4: 'text-base sm:text-lg text-font-primary font-[400]',
      proseP: 'text-secondary/70',
      proseLi: 'text-secondary/70',
    }
  }
})
