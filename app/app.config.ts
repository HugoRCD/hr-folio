export default defineAppConfig({
  description: 'Hugo Richard, french developer and designer based in Nice.',
  email: 'contact@hrcd.fr',
  phone: '(+33) 6 21 56 22 18',
  socials: [
    { name: 'github', link: 'https://github.com/HugoRCD' },
    { name: 'twitter', link: 'https://twitter.com/HugoRCD__' },
    { name: 'linkedin', link: 'https://www.linkedin.com/in/hugo-richard-0801' },
    { name: 'instagram', link: 'https://www.instagram.com/hugo.rcd_' },
    { name: 'spotify', link: 'https://open.spotify.com/user/yuvl0zpp3bpx4hne1ag7huten?si=df7ee2777c0c4fc4' }
  ],
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
