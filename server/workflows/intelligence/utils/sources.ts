import type { MCPConfig } from './mcp.ts'

type IntelligenceSourceDef = {
  label: string
  /** Static MCP URL, or fallback when `urlEnv` is unset */
  url: string
  /** When set, `process.env[urlEnv]` overrides `url` (required in production for this source). */
  urlEnv?: string
  tokenEnv: string
  template: string
}

export const INTELLIGENCE_SOURCES = {
  github: {
    label: 'GitHub',
    url: 'https://api.githubcopilot.com/mcp/',
    tokenEnv: 'GITHUB_TOKEN',
    template: `---
title: GitHub Daily Summary
date: {{date}}
---

## Commits

List of commits pushed today across all repositories, grouped by repo. Include commit message, author, and SHA.

## Pull Requests

### Opened
PRs opened today with title, repo, and description summary.

### Merged
PRs merged today with title, repo, and who merged them.

### Reviewed
PRs reviewed today with title, repo, and review outcome (approved, changes requested).

## Issues

### Created
Issues created today with title, repo, and labels.

### Closed
Issues closed today with title, repo, and resolution.

## Notable Activity

Any other noteworthy activity: releases, discussions, stars, or forks.`,
  },
  linear: {
    label: 'Linear',
    url: 'https://mcp.linear.app/mcp',
    tokenEnv: 'LINEAR_API_KEY',
    template: `---
title: Linear Daily Summary
date: {{date}}
---

## Completed Today

Issues completed today with title, project, and priority.

## In Progress

Issues currently in progress with title, project, priority, and assignee.

## Upcoming (due this week)

Issues due this week that haven't been started yet, with title, project, and due date.

## Cycle Progress

Current cycle status: name, progress percentage, start/end dates, and how many issues remain.

## Comments & Updates

Notable comments or status updates made today on any issues.`,
  },
  typefully: {
    label: 'Typefully',
    url: 'https://mcp.typefully.com/mcp',
    urlEnv: 'TYPEFULLY_MCP_URL',
    tokenEnv: 'TYPEFULLY_API_KEY',
    template: `---
title: Typefully Daily Summary
date: {{date}}
---

## Social sets

Only the personal account (Hugo / @hugorcd); omit team org accounts (Nuxt, etc.).

## Drafts & scheduled

Drafts and scheduled posts (titles, status, tags, scheduled times). Paginate as needed.

## Queue & publishing

Queue slots for the day when applicable (\`typefully_get_queue\`; range limits apply).

## Published X (day)

Posts with metrics for platform \`x\` for this calendar day (\`typefully_list_social_set_analytics_posts\`): impressions, engagement, notable posts; replies excluded unless relevant.

## Themes & takeaways

Recurring topics, tone, and what performed best vs weakest.

## Ideas for next posts

~10 short hooks or angles aligned with past themes or filling obvious gaps.`,
  },
} as const satisfies Record<string, IntelligenceSourceDef>

export type IntelligenceSourceId = keyof typeof INTELLIGENCE_SOURCES

export function getMCPConfig(source: IntelligenceSourceId): MCPConfig {
  const s = INTELLIGENCE_SOURCES[source]
  const token = process.env[s.tokenEnv]
  const url =
    'urlEnv' in s && s.urlEnv ? (process.env[s.urlEnv] ?? s.url) : s.url
  return {
    url,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }
}
