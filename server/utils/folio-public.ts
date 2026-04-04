/**
 * Public site identity for the folio. Used in `app.config` (client app config) and as the default
 * for Nitro `runtimeConfig.folio` (server / MCP — do not use `useAppConfig()` there).
 *
 * Kept under `server/utils/` (not `shared/`) so Nitro production builds bundle it correctly.
 */
export const folioPublic = {
  profile: {
    email: 'contact@hrcd.fr',
    picture: 'https://avatars.githubusercontent.com/u/71938701?v=4',
  },
  seo: {
    title: 'Hugo Richard',
    description: 'Software Engineer & Designer at Vercel',
    url: 'https://hugorcd.com',
    lang: 'en',
  },
  socials: {
    github: 'https://git.new/hugorcd',
    twitter: 'https://dub.sh/hrcd-x',
    linkedin: 'https://dub.sh/hrcd-linkedin',
    instagram: 'https://dub.sh/hrcd-insta',
    cosmos: 'https://www.cosmos.so/hugorcd',
    spotify: 'https://spti.fi/HugoRCD',
  },
} as const
