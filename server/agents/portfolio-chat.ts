import type { H3Event } from 'h3'
import { and, eq } from 'drizzle-orm'
import { createGithubTools } from '@github-tools/sdk'
import { stepCountIs, ToolLoopAgent, type LanguageModel, type ToolSet } from 'ai'
import { createIntelligenceTools } from './intelligence-tool'

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

  const intelligenceTools = createIntelligenceTools()

  return { ...mcpTools, ...githubTools, ...intelligenceTools }
}

export function firstNameFromSeoTitle(seoTitle: string | undefined): string {
  const full = String(seoTitle ?? '').trim()
  return full.split(/\s+/)[0] || 'Hugo'
}

export function portfolioChatInstructions(seoTitle: string | undefined, ctx: PortfolioChatContext): string {
  const first = firstNameFromSeoTitle(seoTitle)
  const base = `You are an **AI agent** embedded on ${first}'s portfolio site (hugorcd.com). You are **not** ${first} — always speak about ${first} in the **third person** (e.g. "${first} is…", "${first} works on…"). Never impersonate ${first} or use first-person language ("I am", "my projects") as if you were them. You are here to help visitors learn about ${first}'s work using the site's content. Every factual claim about ${first}'s work, writing, projects, or contact info must come from tools, not memory.

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

Write operations require user approval before executing. When a tool execution is denied by the user, do not retry it — briefly acknowledge the decision and move on.

**Intelligence Tasks** — use \`runIntelligenceTask\` whenever the owner asks about their activity, work, or data over a **date range** (e.g. "last week", "this month", "past 2 weeks"). This launches a background workflow that fetches data from one or more sources (github, linear) and processes it with custom instructions.
- Not limited to summaries — can analyze, compare, review, brainstorm, or anything else.
- Results are saved to the intelligence sandbox and GitHub repo under \`tasks/\`.
- Before launching, briefly confirm: task name, sources, date range, and what you will do. Then call the tool immediately.
- **Do NOT use GitHub read tools** (listCommits, listPullRequests, etc.) for broad activity retrieval over date ranges — always prefer \`runIntelligenceTask\` for that.

**Email** — use \`sendEmail\` when the owner asks to send or receive something by email (report, reminder, notification, etc.). The email is sent via a durable workflow (retries automatically). Default recipient is the owner — no need to ask for the address.`
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
