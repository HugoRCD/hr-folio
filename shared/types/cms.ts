export type PageData = {
  title?: string
  description?: string
  date?: string
  image?: string
  tags?: string[]
}

export type WorkData = {
  name: string
  description: string
  category: string
  release?: string
  date: string
  url: string
  github?: string
  screenshotUrl?: string
  screenshotOptions?: { delay: number }
  tags?: string[]
}

export type AboutData = {
  fullName: string
  headline: string
  pronouns?: string
  location?: { city?: string, country?: string, timezone?: string }
  languages?: string[]
  bio: string
  currentRole: { company: string, companyUrl?: string, role: string, since: string, focus?: string }
  pastRoles?: { company: string, companyUrl?: string, role: string, period: string, summary?: string }[]
  expertise?: string[]
  stack?: string[]
  interests?: string[]
  highlights?: { name: string, role?: string, description: string, url?: string, stem?: string }[]
  ecosystemContributions?: string[]
  availability?: string
  funFacts?: string[]
  misconceptions?: { claim: string, correction: string }[]
}
