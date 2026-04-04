import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { createAgentUIStreamResponse, type ToolSet } from 'ai'
import { experimental_createMCPClient } from '@ai-sdk/mcp'
import { createAILogger } from 'evlog/ai'
import {
  createPortfolioChatAgent,
  mergePortfolioChatTools,
  resolvePortfolioChatContext,
} from '../agents/portfolio-chat'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  log.set({ chat: { handler: 'post' } })
  const ai = createAILogger(log, { toolInputs: { maxLength: 4000 } })

  const { messages } = await readBody(event)

  if (!messages || !Array.isArray(messages)) {
    throw createError({ statusCode: 400, message: 'Invalid or missing messages array.' })
  }

  let httpClient: Awaited<ReturnType<typeof experimental_createMCPClient>> | undefined
  let mcpTools: ToolSet

  try {
    const mcpUrl = new URL('/mcp', getRequestURL(event).origin)
    const httpTransport = new StreamableHTTPClientTransport(mcpUrl)
    httpClient = await experimental_createMCPClient({
      transport: httpTransport,
    })
    mcpTools = (await httpClient.tools()) as ToolSet
  } catch (error) {
    log.set({ chat: { mcp: 'client_init_failed' } })
    log.error(error instanceof Error ? error : new Error(String(error)))
    throw createError({
      statusCode: 503,
      message: 'Portfolio content tools are temporarily unavailable. Please try again later.',
    })
  }

  await consumeVisitorChatTurnOrThrow(event)

  const ctx = await resolvePortfolioChatContext(event)
  const tools = mergePortfolioChatTools(mcpTools, ctx)
  const { folio: { seo: { title: seoTitle } } } = useRuntimeConfig(event)
  const agent = createPortfolioChatAgent(ai.wrap('google/gemini-3-flash'), tools, seoTitle, ctx)

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    onFinish: () => {
      event.waitUntil(httpClient?.close())
    },
    onError: (error) => {
      log.set({ chat: { streamText: 'error' } })
      log.error(error instanceof Error ? error : new Error(String(error)))
      event.waitUntil(httpClient?.close())
      return 'Something went wrong.'
    },
  })
})
