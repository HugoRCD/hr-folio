interface FolioConfig {
  profile: {
    email: string
    picture: string
  }
  seo: {
    title: string
    description: string
    url: string
    lang: string
  }
  socials: {
    github: string
    twitter: string
    linkedin: string
    instagram: string
    cosmos: string
    spotify: string
  }
  link: Array<Record<string, string>>
}

export function useFolioConfig() {
  return useAppConfig() as unknown as FolioConfig
}
