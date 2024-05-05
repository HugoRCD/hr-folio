import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { notesPassword } = useRuntimeConfig().private
  const { password } = await readBody(event)
  return password.toString() === notesPassword.toString()
    ? { status: 200, body: 'Authorized' }
    : { status: 401, body: 'Unauthorized' }
})
