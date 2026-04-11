import { buildEmailHtml } from '../utils/email-template'

const RESEND_API = 'https://api.resend.com/emails'
const OWNER_EMAIL = 'contact@hrcd.fr'
const FROM_EMAIL = 'HR Folio <noreply@hrcd.fr>'

export interface EmailParams {
  to?: string
  subject: string
  heading: string
  body: string
  cta?: { label: string, url: string }
}

export async function emailWorkflow(params: EmailParams) {
  'use workflow'

  await sendEmail(params)
}

async function sendEmail(params: EmailParams) {
  'use step'

  const key = process.env.NUXT_PRIVATE_RESEND_API_KEY
  if (!key) {
    console.warn('[email] NUXT_PRIVATE_RESEND_API_KEY not set, skipping')
    return
  }

  const html = buildEmailHtml({
    preview: params.subject,
    heading: params.heading,
    body: params.body,
    cta: params.cta,
  })

  const response = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to || OWNER_EMAIL,
      subject: params.subject,
      html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error (${response.status}): ${error}`)
  }
}
