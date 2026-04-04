import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import type { AuthUser } from '#nuxt-better-auth'

/** Default GitHub login for this repo (Nuxt Studio owner). Override with NUXT_FOLIO_OWNER_GITHUB_LOGIN for forks. */
const DEFAULT_OWNER_GITHUB_LOGIN = 'HugoRCD'

function normalizeGithubLogin(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

function expectedOwnerLogin(event: H3Event): string {
  const raw = useRuntimeConfig(event).folioOwnerGithubLogin
  const fromConfig = typeof raw === 'string' && raw.trim() ? raw.trim() : DEFAULT_OWNER_GITHUB_LOGIN
  return normalizeGithubLogin(fromConfig)
}

function githubUsernameFromUser(user: AuthUser): string | null {
  const raw = user.githubUsername
  return typeof raw === 'string' && raw.length ? raw : null
}

async function fetchGitHubLogin(accessToken: string): Promise<string | null> {
  if (!accessToken || accessToken.length < 10) return null

  try {
    const data = await $fetch<unknown>('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!data || typeof data !== 'object' || Array.isArray(data)) return null
    const { login } = data as { login?: unknown }
    if (typeof login !== 'string' || !login.length) return null

    return login
  } catch {
    return null
  }
}

export async function isFolioOwner(event: H3Event, user: AuthUser): Promise<boolean> {
  const expected = expectedOwnerLogin(event)

  const storedLogin = githubUsernameFromUser(user)
  if (storedLogin) return normalizeGithubLogin(storedLogin) === expected

  const rows = await db
    .select({ accessToken: schema.account.accessToken })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, user.id),
        eq(schema.account.providerId, 'github'),
      ),
    )
    .limit(1)

  const token = rows[0]?.accessToken
  if (!token) return false

  const login = await fetchGitHubLogin(token)
  if (!login) return false

  return normalizeGithubLogin(login) === expected
}

export async function requireFolioOwnerSession(event: H3Event) {
  await requireUserSession(event, {
    rule: ({ user }) => isFolioOwner(event, user),
  })
}
