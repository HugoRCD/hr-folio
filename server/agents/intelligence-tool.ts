import { tool } from 'ai'
import { z } from 'zod'
import { start } from 'workflow/api'
import { taskWorkflow } from '../workflows/intelligence/sources/task'
import { emailWorkflow } from '../workflows/intelligence/sources/email'

export function createIntelligenceTools() {
  return {
    runIntelligenceTask: tool({
      description: 'Launch a background intelligence task. Fetches data from one or more sources and processes it according to custom instructions. Can summarize, analyze, compare, brainstorm, or any other processing.',
      inputSchema: z.object({
        name: z.string().describe('Short descriptive name for the task (used as filename)'),
        sources: z.array(z.enum(['github', 'linear'])).describe('Sources to fetch data from'),
        dateRange: z.string().describe('Date range in natural language (e.g. "last 2 weeks", "March 2026")'),
        instructions: z.string().describe('What to do with the data'),
      }),
      execute: async ({ name, sources, dateRange, instructions }) => {
        const taskId = `task-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
        const run = await start(taskWorkflow, [{ taskId, name, sources, dateRange, instructions }])
        return `Task "${name}" launched (${sources.join(', ')}). Run ID: ${run.runId}. Results will appear in the intelligence repo under tasks/${taskId}/`
      },
    }),

    sendEmail: tool({
      description: 'Send a styled email. Defaults to the portfolio owner if no recipient is specified. The email is automatically wrapped in a branded dark template (logo, Geist font, dark background). Just provide the structured content.',
      inputSchema: z.object({
        subject: z.string().describe('Email subject line'),
        heading: z.string().describe('Main heading displayed in the email'),
        body: z.string().describe('Email body content as HTML paragraphs. Use <span style="color:#ffffff;"> to highlight key words. Wrap paragraphs in <p style="margin:0 0 12px 0;">'),
        to: z.string().optional().describe('Recipient email address. Omit to send to the portfolio owner.'),
        ctaLabel: z.string().optional().describe('Optional call-to-action button label'),
        ctaUrl: z.string().optional().describe('Optional call-to-action button URL'),
      }),
      execute: async ({ subject, heading, body, to, ctaLabel, ctaUrl }) => {
        const cta = ctaLabel && ctaUrl ? { label: ctaLabel, url: ctaUrl } : undefined
        const run = await start(emailWorkflow, [{ subject, heading, body, cta, ...(to && { to }) }])
        return `Email queued to ${to || 'owner'} — subject: "${subject}", run ID: ${run.runId}`
      },
    }),
  }
}
