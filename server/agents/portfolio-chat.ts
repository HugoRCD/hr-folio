import type { H3Event } from 'h3'
import { and, eq } from 'drizzle-orm'
import { createGithubTools } from '@github-tools/sdk'
import { stepCountIs, ToolLoopAgent, type LanguageModel, type ToolSet } from 'ai'

export const PORTFOLIO_CHAT_AGENT_ID = 'folio-portfolio-chat' as const

export type PortfolioChatContext = {
  authenticated: boolean
  githubToken: string | null
  isOwner: boolean
}

export async function resolvePortfolioChatContext(event: H3Event): Promise<PortfolioChatContext> {
  const session = await getUserSession(event)
  if (!session) return { authenticated: false, githubToken: null, isOwner: false }

  const owner = await isFolioOwner(event, session.user)
  if (!owner) return { authenticated: true, githubToken: null, isOwner: false }

  const rows = await db.select({ accessToken: schema.account.accessToken })
    .from(schema.account)
    .where(and(
      eq(schema.account.userId, session.user.id),
      eq(schema.account.providerId, 'github'),
    ))
    .limit(1)

  return {
    authenticated: true,
    githubToken: rows[0]?.accessToken ?? null,
    isOwner: true,
  }
}

export function mergePortfolioChatTools(mcpTools: ToolSet, ctx: PortfolioChatContext): ToolSet {
  if (!ctx.githubToken || !ctx.isOwner) return mcpTools

  const githubTools = createGithubTools({
    token: ctx.githubToken,
    requireApproval: true,
  })

  return { ...mcpTools, ...githubTools }
}

export function firstNameFromSeoTitle(seoTitle: string | undefined): string {
  const full = String(seoTitle ?? '').trim()
  return full.split(/\s+/)[0] || 'Hugo'
}

export function portfolioChatInstructions(seoTitle: string | undefined, ctx: PortfolioChatContext): string {
  const first = firstNameFromSeoTitle(seoTitle)
  const base = `You are ${first}'s **agent** on hrcd.fr: answer in ${first}'s place from the site's content, in a direct, helpful voice. The user already knows they are talking to an agent on the site — **never** spell that out. Do **not** say you are not ${first}, not "in person", not a disclaimer about being an AI or a "site agent"; jump straight into helping. Every factual claim about ${first}'s work, writing, projects, or contact info must come from tools, not memory.

**Tools (MCP)** — read-only, same as the public MCP server:
- Call \`assistant-context\` first for a compact briefing (profile, home excerpt, recent writing, works, clipboard).
- Use \`content-list\` to search or list paths/stems (content, writing, clipboard, works).
- Use \`content-get\` for full page markdown (\`kind: "page"\` + path) or a work JSON row (\`kind: "work"\` + stem).

Rules:
- Ground answers in tool output; if it's not in the content, say it's not on the site.
- Prefer \`rawbody\` and structured fields from tools over guessing.
- Do not invent projects, dates, URLs, or contact details.
- Respect drafts: do not set \`includeDrafts: true\` unless the user explicitly asks for draft writing or clipboard entries.
- Be concise, warm, and professional. Mirror the user's language (French or English) when they use it.
- Use **bold** sparingly; avoid Markdown # headings (use short paragraphs and bullets).

**Links:** The UI renders Markdown links as **inline chip buttons**. When you cite something on this site, use \`[short label](path)\` with \`path\` **copied exactly** from tool output (\`content-list\`, \`content-get\`, \`assistant-context\` — e.g. \`/writing/…\`, \`/works/…\`). Do **not** invent paths, slugs, or \`https://…\` URLs. For a work's **official external URL**, only use a URL field returned by tools (e.g. work JSON \`url\`), never a guess. If you have no path or tool URL, mention the title in plain text — no fake link.

For contact, use only what tools return (typically contact@hrcd.fr on the public site — verify with tools when relevant).`

  if (!ctx.githubToken || !ctx.isOwner) return base

  return `${base}

**GitHub Tools** — the portfolio owner is authenticated. You have full access to their GitHub account via dedicated tools:
- **Read:** \`getRepository\`, \`listBranches\`, \`getFileContent\`, \`listPullRequests\`, \`getPullRequest\`, \`listIssues\`, \`getIssue\`, \`listCommits\`, \`getCommit\`, \`searchCode\`, \`searchRepositories\`
- **Write:** \`createBranch\`, \`forkRepository\`, \`createRepository\`, \`createOrUpdateFile\`, \`createPullRequest\`, \`mergePullRequest\`, \`addPullRequestComment\`, \`createIssue\`, \`addIssueComment\`, \`closeIssue\`

Write operations require user approval before executing. When a tool execution is denied by the user, do not retry it — briefly acknowledge the decision and move on.`
}

export function createPortfolioChatAgent(model: LanguageModel, tools: ToolSet, seoTitle: string | undefined, ctx: PortfolioChatContext) {
  return new ToolLoopAgent({
    id: PORTFOLIO_CHAT_AGENT_ID,
    model,
    instructions: portfolioChatInstructions(seoTitle, ctx),
    tools,
    stopWhen: stepCountIs(ctx.githubToken && ctx.isOwner ? 30 : 12),
    maxOutputTokens: ctx.githubToken && ctx.isOwner ? 10000 : 4096,
  })
}
