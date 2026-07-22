import { connectGithubTools } from '@github-tools/sdk/connect/eve'

/**
 * Personal GitHub agent, scoped through a Vercel Connect GitHub connector
 * (no long-lived PAT). Create the connector in the Vercel dashboard and set
 * `EVE_GITHUB_CONNECTOR` to its slug (defaults to `github/personal`).
 *
 * Starting preset is `maintainer` (broadest single-user preset — repo,
 * branch, PR, issue, gist, and workflow tools). Write tools require human
 * approval by default (see agent/channels/eve.ts + the chat UI's approval
 * prompts). Narrow to a smaller preset (e.g. `code-review`, `issue-triage`)
 * or combine presets as capabilities get extended later.
 */
export default connectGithubTools(process.env.EVE_GITHUB_CONNECTOR ?? 'github/personal', {
  preset: 'maintainer',
})
