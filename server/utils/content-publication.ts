import type { H3Event } from 'h3'

export function isDraftDoc(doc: { draft?: boolean } | null | undefined): boolean {
  return Boolean(doc && doc.draft)
}

export async function assertPublishedOrOwner(event: H3Event, doc: { draft?: boolean }) {
  if (!isDraftDoc(doc)) return
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
  const owner = await isFolioOwner(event, session.user)
  if (!owner) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }
}
