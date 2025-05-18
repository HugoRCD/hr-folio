import { H3Event } from 'h3'
import { streamText, tool } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

export default defineEventHandler(async (event: H3Event) => {
  const { messages } = await readBody(event)
  const workersAI = createWorkersAI({ binding: hubAI() })
  const autorag = hubAutoRAG('hrcd')

  return streamText({
    model: workersAI('@cf/meta/llama-3.3-70b-instruct-fp8-fast'),
    messages,
    system: `You are a helpful assistant for Hugo Richard. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."
    Format your markdown response using the following rules:
    - Use the vue lang for code blocks syntax highlighting.
    - Don't use markdown headings.
    `,
    tools: {
      searchContent: tool({
        description: `search the content for information to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question')
        }),
        execute: async ({ question }) => {
          return (await autorag.aiSearch({
            query: question
          })).response
        }
      })
    },
    onError: (error) => {
      console.log('error', error)
    }
  }).toDataStreamResponse()
})
