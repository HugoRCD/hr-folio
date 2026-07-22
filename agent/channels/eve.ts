import { eveChannel } from 'eve/channels/eve'
import { httpBasic, localDev, vercelOidc, type AuthFn } from 'eve/channels/auth'

/**
 * Route auth for the portfolio chat (and any other HTTP caller). eve fails
 * closed by default: `vercelOidc()` covers Vercel-to-Vercel/CLI callers and
 * `localDev()` covers `npm run dev` / `eve dev` on localhost — neither admits
 * a browser visitor in production.
 *
 * `EVE_CHAT_PASSWORD` gates the portfolio's `/chat` page behind a shared
 * secret only Hugo knows, kept simple on purpose. Until it's set, the chat
 * page stays closed in production (safe default) and still works locally.
 */
const chatBasicAuth: AuthFn<Request> | null = process.env.EVE_CHAT_PASSWORD
  ? httpBasic({
    username: process.env.EVE_CHAT_USERNAME ?? 'hugo',
    password: process.env.EVE_CHAT_PASSWORD,
  })
  : null

export default eveChannel({
  auth: [vercelOidc(), localDev(), ...(chatBasicAuth ? [chatBasicAuth] : [])],
})
