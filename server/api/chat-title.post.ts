import { streamText } from 'ai'
import { createAILogger } from 'evlog/ai'
import { firstNameFromSeoTitle } from '../agents/portfolio-chat'

const MAX_INPUT = 4000

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  log.set({ chat: { handler: 'chat-title' } })
  const ai = createAILogger(log)
  const { folio: { seo: { title: seoTitle } } } = useRuntimeConfig(event)
  const agentBrand = `${firstNameFromSeoTitle(seoTitle)}'s Agent`

  const body = await readBody(event).catch(() => null) as { text?: string } | null
  const raw = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!raw) {
    throw createError({ statusCode: 400, message: 'Missing or empty text.' })
  }
  const text = raw.slice(0, MAX_INPUT)

  const result = streamText({
    model: ai.wrap('openai/gpt-5.4'),
    maxOutputTokens: 48,
    system: `You write ultra-short conversation titles for tabs in "${agentBrand}" (this portfolio’s site-only chat). Use the user’s language.
Rules:
- 3–8 words only, Title Case or natural sentence case matching the user's language (French or English).
- No quotes, no trailing punctuation, no emoji.
- Describe what the user is asking or exploring, not "Chat" or "Conversation".
- Output nothing except those words.`,
    messages: [{ role: 'user', content: text }],
    onError: (error) => {
      log.set({ chat: { streamText: 'chat-title-error' } })
      log.error(error instanceof Error ? error : new Error(String(error)))
    },
  })

  return result.toTextStreamResponse()
})
