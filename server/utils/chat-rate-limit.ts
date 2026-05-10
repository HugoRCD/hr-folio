import { createError, getRequestIP, type H3Event } from 'h3'
import { useStorage } from 'nitropack/runtime'

const KEY_PREFIX = 'folio:chat:daily'

function rateStore() {
  return useStorage('cache')
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10)
}

function visitorRateKey(event: H3Event, userId: string | null): string {
  const day = utcDay()
  if (userId) return `${KEY_PREFIX}:${day}:u:${userId}`
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  return `${KEY_PREFIX}:${day}:ip:${ip}`
}

export function maxVisitorChatTurns(event: H3Event): number {
  const raw = useRuntimeConfig(event).folioVisitorChatDailyLimit
  const n = typeof raw === 'string' ? Number(raw) : Number(raw)
  if (!Number.isFinite(n) || n < 1) return 20
  return Math.min(500, Math.floor(n))
}

const TTL_MS = 26 * 60 * 60 * 1000

async function storageGetCount(key: string): Promise<number> {
  return Number((await rateStore().getItem<number>(key)) ?? 0)
}

async function storageIncrCount(key: string): Promise<number> {
  const cur = Number((await rateStore().getItem<number>(key)) ?? 0)
  const next = cur + 1
  await rateStore().setItem(key, next, { ttl: TTL_MS })
  return next
}

export async function peekVisitorChatUsage(
  event: H3Event,
  isOwner: boolean,
  userId: string | null,
): Promise<{ used: number, max: number }> {
  const max = maxVisitorChatTurns(event)
  if (isOwner) return { used: 0, max }
  const key = visitorRateKey(event, userId)
  const used = await storageGetCount(key)
  return { used, max }
}

export async function consumeVisitorChatTurnOrThrow(event: H3Event): Promise<void> {
  const session = await getUserSession(event)
  const isOwner = session ? await isFolioOwner(event, session.user) : false
  if (isOwner) return

  const max = maxVisitorChatTurns(event)
  const key = visitorRateKey(event, session?.user?.id ?? null)
  const usedBefore = await storageGetCount(key)

  if (usedBefore >= max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `Daily site chat limit reached (${max} messages). Try again tomorrow.`,
    })
  }

  const usedAfter = await storageIncrCount(key)
  const remaining = Math.max(0, max - usedAfter)
  setResponseHeader(event, 'x-ratelimit-limit', String(max))
  setResponseHeader(event, 'x-ratelimit-remaining', String(remaining))
}
