export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const isOwner = session ? await isFolioOwner(event, session.user) : false
  const { used, max } = await peekVisitorChatUsage(event, isOwner, session?.user?.id ?? null)

  return {
    isOwner,
    signedIn: Boolean(session),
    rateLimit: {
      max,
      used,
      remaining: isOwner ? null : Math.max(0, max - used),
    },
  }
})
