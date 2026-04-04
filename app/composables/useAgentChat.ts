import type { UIMessage } from 'ai'

const MESSAGES_KEY = 'folio-agent-chat-messages'

export function useAgentChat() {
  const messages = useState<UIMessage[]>(MESSAGES_KEY, () => [])

  return {
    messages,
  }
}
