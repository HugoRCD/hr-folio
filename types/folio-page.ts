import type { ComarkTree } from 'comark'
import type { TocLink } from 'comark/plugins/toc'

export type FolioPage = {
  path: string
  title?: string
  description?: string
  date?: string
  image?: string
  draft?: boolean
  tags?: string[]
  nodes: ComarkTree['nodes']
  toc?: { links: TocLink[] }
  rawbody?: string
}

export type FolioWork = {
  stem: string
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

export type FolioAbout = {
  fullName: string
  headline: string
  pronouns?: string
  location?: {
    city?: string
    country?: string
    timezone?: string
  }
  languages?: string[]
  bio: string
  currentRole: {
    company: string
    companyUrl?: string
    role: string
    since: string
    focus?: string
  }
  pastRoles?: Array<{
    company: string
    companyUrl?: string
    role: string
    period: string
    summary?: string
  }>
  expertise?: string[]
  stack?: string[]
  interests?: string[]
  highlights?: Array<{
    name: string
    role?: string
    description: string
    url?: string
    stem?: string
  }>
  ecosystemContributions?: string[]
  availability?: string
  funFacts?: string[]
  misconceptions?: Array<{
    claim: string
    correction: string
  }>
}
