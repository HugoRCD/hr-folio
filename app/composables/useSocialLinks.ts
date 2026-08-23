export interface SocialLink {
  id: string
  label: string
  href: string
  icon: string
  external: boolean
}

export function useSocialLinks() {
  const { profile, socials } = useFolioConfig()

  return computed<SocialLink[]>(() =>
    [
      { id: 'email', label: 'Email', href: profile.email ? `mailto:${profile.email}` : '', icon: 'i-nucleo-envelope', external: false },
      { id: 'github', label: 'GitHub', href: socials.github, icon: 'i-nucleo-github', external: true },
      { id: 'twitter', label: 'X', href: socials.twitter, icon: 'i-nucleo-x-twitter', external: true },
      { id: 'linkedin', label: 'LinkedIn', href: socials.linkedin, icon: 'i-nucleo-linkedin', external: true },
      { id: 'instagram', label: 'Instagram', href: socials.instagram, icon: 'i-nucleo-instagram', external: true },
      { id: 'cosmos', label: 'Cosmos', href: socials.cosmos, icon: 'i-nucleo-cosmos', external: true },
      { id: 'spotify', label: 'Spotify', href: socials.spotify, icon: 'i-nucleo-spotify', external: true },
    ].filter(link => Boolean(link.href)),
  )
}
