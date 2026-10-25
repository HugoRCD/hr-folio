import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError } from 'evlog'

const digest = (s: string) => createHash('sha256').update(s).digest()

export function requireWhereaboutsToken(event: H3Event) {
  const expected = useRuntimeConfig(event).whereaboutsToken
  if (!expected) {
    throw createError({
      status: 503,
      message: 'Whereabouts updates are not configured',
      why: 'NUXT_WHEREABOUTS_TOKEN is not set on this deployment',
      fix: 'Set NUXT_WHEREABOUTS_TOKEN, then send it as a Bearer token',
    })
  }
  const given = getRequestHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!timingSafeEqual(digest(given), digest(expected))) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
      why: 'The Bearer token does not match',
      fix: 'Send Authorization: Bearer <NUXT_WHEREABOUTS_TOKEN>',
    })
  }
}
