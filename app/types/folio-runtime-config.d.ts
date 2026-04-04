declare module 'nuxt/schema' {
  interface RuntimeConfig {
    folio: {
      profile: { email: string, picture: string }
      seo: { title: string, description: string, url: string, lang: string }
      socials: Record<string, string>
    }
  }
}

export {}
