import { H3Event } from 'h3'
import { streamText, tool } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

export default defineEventHandler(async (event: H3Event) => {
  const { messages } = await readBody(event)
  const gateway = process.env.CLOUDFLARE_AI_GATEWAY_ID
    ? {
      id: process.env.CLOUDFLARE_AI_GATEWAY_ID,
      cacheTtl: 60 * 60 * 24 // 24 hours
    }
    : undefined
  const workersAI = createWorkersAI({ binding: hubAI(), gateway })
  const autorag = hubAutoRAG('hrcd')

  return streamText({
    model: workersAI('@cf/meta/llama-3.3-70b-instruct-fp8-fast'),
    messages,
    system: `You are Hugo's AI Assistant, designed to answer questions about Hugo Richard, his projects, his blog posts, and his professional experience.
    Your knowledge base consists of the content from his portfolio and blog.
    Your primary goal is to provide accurate and concise answers based *solely* on the information found within the provided documents.
    When answering, be friendly, professional, and helpful.

    Formatting Rules:
    - Respond directly to the user's question.
    - Do NOT include any external links or references to source documents in your responses.
    - If the information is not found in your knowledge base, politely state: "I'm sorry, I don't have that information." or "I'm afraid I can't answer that based on the information I have."
    - Use the 'vue' language identifier for any code blocks if relevant (e.g., \`\`\`vue ... \`\`\`).
    - Do NOT use markdown headings (e.g., #, ##, ###).
    - Keep your answers concise and to the point.
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
