import { H3Event } from 'h3'
import { sendContactEmail } from '~/server/service/resendService'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  await sendContactEmail(body)
  return {
    statusCode: 200,
    statusMessage: 'OK',
  }
})
