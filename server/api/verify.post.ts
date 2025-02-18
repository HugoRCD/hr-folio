import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { notesPassword } = useRuntimeConfig().private
  const { password } = await readBody(event)
  console.log(password, notesPassword)
  if (password.toString() === notesPassword.toString()) {
    return { status: 200 }
  }
  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
