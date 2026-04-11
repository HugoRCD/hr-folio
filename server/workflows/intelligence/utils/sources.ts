import type { MCPConfig } from './mcp'

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
} as const

export type IntelligenceSourceId = keyof typeof INTELLIGENCE_SOURCES

export function getMCPConfig(source: IntelligenceSourceId): MCPConfig {
  const s = INTELLIGENCE_SOURCES[source]
  const token = process.env[s.tokenEnv]
  return {
    url: s.url,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }
}
