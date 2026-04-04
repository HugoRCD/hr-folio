<script setup lang="ts">
import type { ToolUIPart, DynamicToolUIPart } from 'ai'
import { DefaultChatTransport, getToolName, isReasoningUIPart, isTextUIPart, isToolUIPart } from 'ai'
import { Chat } from '@ai-sdk/vue'
import { isPartStreaming, isToolStreaming } from '@nuxt/ui/utils/ai'
import AgentChatMarkdownLink from '~/components/AgentChatMarkdownLink.vue'

const input = ref('')
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { profile, seo } = useFolioConfig()
const { messages } = useAgentChat()

const sessionTitle = ref('')
const titleStreaming = ref(false)
let titleAbort: AbortController | null = null

/** Composer sits outside the message scroll region; no extra bottom spacer needed on the last bubble. */
const PROMPT_SPACING_OFFSET = 0

const emptyState = computed(() => {
  const hour = new Date().getHours()
  let timeHint = 'Good evening'
  if (hour < 12) timeHint = 'Good morning'
  else if (hour < 18) timeHint = 'Good afternoon'

  return {
    title: 'What do you want to explore?',
    sub: `${timeHint} — glad you’re here. Choose a starter below or ask in your own words.`,
  }
})

const marqueeRow1: { label: string, prompt: string }[] = [
  { label: 'What have you shipped lately?', prompt: 'Summarize Hugo’s recent projects and where to read more.' },
  { label: 'Latest writing', prompt: 'What are the newest posts? Titles, topics, and paths.' },
  { label: 'How to reach you', prompt: 'What’s the best way to contact Hugo according to the site?' },
  { label: 'Nuxt & open source', prompt: 'What does Hugo work on in the Vue / Nuxt ecosystem? Cite the site.' },
]

const marqueeRow2: { label: string, prompt: string }[] = [
  { label: 'What’s on the home page?', prompt: 'Summarize the front page and what it highlights.' },
  { label: 'Clipboard notes', prompt: 'What’s in the clipboard section lately?' },
  { label: 'Featured works', prompt: 'List standout projects from the works collection with short blurbs.' },
  { label: 'Skills & stack', prompt: 'What tools and topics show up across the site content?' },
]

let _skipSync = false

const chat = new Chat({
  messages: messages.value,
  transport: new DefaultChatTransport({
    api: '/api/chat',
  }),
  onError: (error) => {
    let { message } = error
    if (typeof message === 'string' && message[0] === '{') {
      try {
        message = JSON.parse(message).message || message
      } catch { /* malformed JSON */ }
    }
    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0,
    })
  },
  onFinish: () => {
    _skipSync = true
    messages.value = chat.messages
    nextTick(() => {
      _skipSync = false
    })
  },
})

const canClear = computed(() => messages.value.length > 0)

async function streamSessionTitle(userText: string) {
  titleAbort?.abort()
  titleAbort = new AbortController()
  sessionTitle.value = ''
  titleStreaming.value = true
  try {
    const res = await fetch('/api/chat-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText }),
      signal: titleAbort.signal,
    })
    if (!res.ok || !res.body) {
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      sessionTitle.value = buffer
    }
    sessionTitle.value = buffer
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\s+/g, ' ')
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return
  } finally {
    titleStreaming.value = false
    titleAbort = null
  }
}

function onSubmit() {
  if (!input.value.trim()) return
  const text = input.value.trim()
  const isFirstTurn = chat.messages.length === 0
  chat.sendMessage({ text })
  input.value = ''
  if (isFirstTurn) {
    void streamSessionTitle(text)
  }
}

function consumeChatQueryFromRoute() {
  if (route.path !== '/chat') return
  const raw = route.query.q
  const text = typeof raw === 'string'
    ? raw.trim()
    : Array.isArray(raw)
      ? String(raw[0] ?? '').trim()
      : ''
  if (!text) return

  const nextQuery = { ...route.query }
  delete nextQuery.q
  router.replace({ path: route.path, query: nextQuery })

  input.value = text
  nextTick(() => {
    onSubmit()
  })
}

watch(() => route.query.q, () => {
  consumeChatQueryFromRoute()
}, { immediate: true })

watch(messages, (newMessages) => {
  if (_skipSync) return
  chat.messages = newMessages
  if (chat.lastMessage?.role === 'user') {
    chat.regenerate()
  }
})

type ToolPart = ToolUIPart | DynamicToolUIPart
type ToolState = ToolPart['state']

function getToolMessage(state: ToolState, toolName: string, toolInput: Record<string, string | undefined>) {
  const done = state === 'output-available'
  const searchVerb = done ? 'Searched' : 'Searching'
  const readVerb = done ? 'Loaded' : 'Loading'

  return {
    'assistant-context': `${done ? 'Loaded' : 'Loading'} context`,
    'content-list': `${searchVerb} site index`,
    'content-get': `${readVerb} ${toolInput.kind === 'work' ? `work “${toolInput.stem || ''}”` : `page ${toolInput.path || ''}`}`,
  }[toolName] || `${done ? 'Ran' : 'Running'} ${toolName}`
}

function getToolText(part: ToolPart) {
  const raw = part.input
  let inputObj: Record<string, string | undefined> = {}
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    inputObj = Object.fromEntries(
      Object.entries(raw as Record<string, unknown>).map(([k, v]) => [
        k,
        v === null || v === undefined ? undefined : String(v),
      ]),
    )
  }
  return getToolMessage(part.state, getToolName(part), inputObj)
}

function getToolIcon(part: ToolPart): string {
  const toolName = getToolName(part)
  const iconMap: Record<string, string> = {
    'assistant-context': 'i-lucide-book-marked',
    'content-list': 'i-lucide-list-tree',
    'content-get': 'i-lucide-file-text',
  }
  return iconMap[toolName] || 'i-lucide-wrench'
}

function askQuestion(prompt: string) {
  input.value = prompt
  onSubmit()
}

function clearMessages() {
  titleAbort?.abort()
  titleAbort = null
  titleStreaming.value = false
  sessionTitle.value = ''
  if (chat.status === 'streaming') {
    chat.stop()
  }
  messages.value = []
  chat.messages = []
}

const chatTheme = {
  prose: {
    p: { base: 'my-2 text-sm/6' },
    li: { base: 'my-0.5 text-sm/6' },
    ul: { base: 'my-2' },
    ol: { base: 'my-2' },
    h1: { base: 'text-base my-2 font-medium' },
    h2: { base: 'text-sm my-2 font-medium' },
    h3: { base: 'text-sm my-1.5 font-medium' },
    code: { base: 'text-xs' },
    pre: { root: 'my-2', base: 'text-xs/5' },
    table: { root: 'my-2' },
    hr: { base: 'my-4' },
  },
}

const mdcChatComponents = { a: AgentChatMarkdownLink }

/** DashboardPanel defaults use min-h-svh + shrink-0; override so only the message list scrolls. */
const dashboardPanelUi = {
  root: 'relative flex h-full min-h-0! min-w-0 flex-1 shrink! flex-col overflow-hidden border-0 bg-default shadow-none ring-0',
  body: 'flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0 sm:p-0',
}

const promptUi = {
  root: 'flex w-full min-w-0 flex-row flex-wrap items-end gap-2 border-0 bg-transparent p-0 shadow-none ring-0',
  body:
    'min-h-0 min-w-[10rem] flex-1 [&_textarea]:min-h-11 [&_textarea]:max-h-36 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:border-0 [&_textarea]:bg-transparent [&_textarea]:px-0 [&_textarea]:py-0.5 [&_textarea]:text-sm/6 [&_textarea]:text-highlighted [&_textarea]:placeholder:text-zinc-500 dark:[&_textarea]:placeholder:text-zinc-400 [&_textarea]:focus-visible:outline-none [&_textarea]:focus-visible:ring-0 [&_textarea]:focus-visible:shadow-none',
  footer: 'shrink-0 flex flex-row items-center gap-1.5 border-0 pt-0',
}

const suggestionPillClass =
  'shrink-0 cursor-pointer rounded-full border border-muted/18 bg-muted/5 px-3.5 py-2 text-sm/6 text-muted transition-[color,background-color,border-color,box-shadow] hover:border-muted/28 hover:bg-muted/10 hover:text-highlighted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-muted/35'
</script>

<template>
  <div class="agent-chat flex h-dvh max-h-dvh min-h-0 flex-col overflow-x-hidden overflow-y-hidden bg-default supports-[height:100dvh]:h-dvh">
    <UDashboardPanel
      id="folio-agent-chat"
      class="h-full min-h-0 min-w-0 flex-1"
      :ui="dashboardPanelUi"
    >
      <template #header>
        <header
          class="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-default px-4 py-2.5 sm:px-6"
        >
          <div class="flex min-w-0 justify-start">
            <UButton
              to="/"
              color="neutral"
              variant="ghost"
              size="sm"
              leading
              leading-icon="i-lucide-arrow-left"
              label="Back to portfolio"
              class="-ml-1.5 text-muted hover:text-highlighted"
              :ui="{ leadingIcon: 'opacity-65' }"
            />
          </div>

          <div
            class="pointer-events-none min-w-0 max-w-[min(72vw,18rem)] text-center sm:max-w-xs md:max-w-md"
            aria-live="polite"
          >
            <p
              v-if="sessionTitle || titleStreaming"
              class="truncate font-serif text-sm/6 font-medium tracking-tight text-highlighted"
            >
              {{ sessionTitle }}<span
                v-if="titleStreaming"
                class="ml-px inline-block h-[0.9em] w-px translate-y-px animate-pulse bg-current align-middle opacity-70"
                aria-hidden="true"
              />
            </p>
          </div>

          <div class="flex min-w-0 shrink-0 items-center justify-end gap-1">
            <UTooltip v-if="canClear" text="New conversation">
              <UButton
                icon="custom:msg-plus"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="Clear conversation"
                @click="clearMessages"
              />
            </UTooltip>
            <ThemeSelector />
          </div>
        </header>
      </template>

      <template #body>
        <div class="flex min-h-0 min-w-0 flex-1 flex-col">
          <UContainer
            class="flex max-w-3xl min-h-0 flex-1 flex-col gap-4 sm:gap-6 lg:max-w-4xl"
          >
            <UTheme :ui="chatTheme" class="flex min-h-0 min-w-0 flex-1 flex-col gap-4 sm:gap-6">
              <div
                v-if="!chat.messages.length"
                class="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto px-0 py-6 sm:py-8"
              >
                <div class="flex w-full max-w-lg flex-col items-center gap-10 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <div class="relative">
                      <img
                        :src="profile.picture"
                        :alt="seo.title"
                        width="72"
                        height="72"
                        class="size-16 rounded-full bg-muted object-cover ring-2 ring-default shadow-sm sm:size-18"
                        decoding="async"
                      >
                      <span
                        class="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full bg-elevated text-highlighted ring-2 ring-default"
                        aria-hidden="true"
                      >
                        <UIcon name="custom:ai" class="size-3.5 opacity-95" />
                      </span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <h1 class="font-serif text-2xl text-highlighted sm:text-[1.65rem]">
                        {{ emptyState.title }}
                      </h1>
                      <p class="mx-auto max-w-xs text-sm/6 text-muted/90">
                        {{ emptyState.sub }}
                      </p>
                    </div>
                  </div>

                  <div class="flex w-full max-w-3xl flex-col gap-3">
                    <p class="text-[11px] text-muted/85">
                      Suggestions
                    </p>
                    <UMarquee
                      :pause-on-hover="true"
                      :overlay="true"
                      :repeat="3"
                      class="w-full [--duration:48s] [--gap:0.5rem] sm:[--gap:0.625rem]"
                    >
                      <button
                        v-for="q in marqueeRow1"
                        :key="`r1-${q.label}`"
                        type="button"
                        :class="suggestionPillClass"
                        @click="askQuestion(q.prompt)"
                      >
                        {{ q.label }}
                      </button>
                    </UMarquee>
                    <UMarquee
                      :pause-on-hover="true"
                      :overlay="true"
                      reverse
                      :repeat="3"
                      class="w-full [--duration:56s] [--gap:0.5rem] sm:[--gap:0.625rem]"
                    >
                      <button
                        v-for="q in marqueeRow2"
                        :key="`r2-${q.label}`"
                        type="button"
                        :class="suggestionPillClass"
                        @click="askQuestion(q.prompt)"
                      >
                        {{ q.label }}
                      </button>
                    </UMarquee>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              >
                <UChatMessages
                  should-auto-scroll
                  class="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-0 pt-6 sm:pt-8"
                  :spacing-offset="PROMPT_SPACING_OFFSET"
                  :messages="chat.messages"
                  :status="chat.status"
                  :user="{
                    ui: {
                      container: 'max-w-[min(90%,36rem)] gap-2 pb-3 sm:gap-2.5 sm:pb-4',
                      content: '!min-h-0 rounded-lg !px-2.5 !py-1.5',
                    },
                  }"
                  :assistant="{
                    avatar: { src: profile.picture, alt: seo.title },
                    ui: {
                      container: 'max-w-[min(90%,36rem)] gap-2 pb-3 sm:gap-2.5 sm:pb-4',
                      content: '!space-y-2',
                    },
                  }"
                >
                  <template #indicator>
                    <UChatTool text="Thinking…" streaming />
                  </template>

                  <template #content="{ message }">
                    <template v-for="(part, index) in message.parts" :key="`${message.id}-${part.type}-${index}`">
                      <UChatReasoning
                        v-if="isReasoningUIPart(part)"
                        :text="part.text"
                        :streaming="isPartStreaming(part)"
                      >
                        <MDCCached
                          :value="part.text"
                          :cache-key="`reasoning-${message.id}-${index}`"
                          :parser-options="{ highlight: false }"
                          :components="mdcChatComponents"
                          class="*:first:mt-0 *:last:mb-0"
                        />
                      </UChatReasoning>

                      <template v-else-if="isTextUIPart(part) && part.text.length > 0">
                        <MDCCached
                          v-if="message.role === 'assistant'"
                          :value="part.text"
                          :cache-key="`${message.id}-${index}`"
                          :parser-options="{ highlight: false }"
                          :components="mdcChatComponents"
                          class="*:first:mt-0 *:last:mb-0"
                        />
                        <p v-else-if="message.role === 'user'" class="whitespace-pre-wrap text-sm/6">
                          {{ part.text }}
                        </p>
                      </template>

                      <UChatTool
                        v-else-if="isToolUIPart(part)"
                        :text="getToolText(part)"
                        :icon="getToolIcon(part)"
                        :streaming="isToolStreaming(part)"
                      />
                    </template>
                  </template>
                </UChatMessages>
              </div>

              <UChatPrompt
                v-model="input"
                :error="chat.error"
                placeholder="Ask anything…"
                variant="naked"
                :rows="1"
                :maxrows="6"
                autofocus
                class="z-10 shrink-0 rounded-t-xl! rounded-b-none! border border-zinc-200/90 bg-zinc-50 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-white/12 dark:bg-zinc-900 [view-transition-name:folio-chat-prompt]"
                :ui="{ ...promptUi, root: `${promptUi.root} px-3 py-1.5` }"
                @submit="onSubmit"
              >
                <template #footer>
                  <UChatPromptSubmit
                    size="sm"
                    square
                    color="neutral"
                    variant="soft"
                    class="rounded-md text-highlighted shadow-none"
                    :status="chat.status"
                    :disabled="!input.trim()"
                    @stop="chat.stop()"
                    @reload="chat.regenerate()"
                  />
                </template>
              </UChatPrompt>
            </UTheme>
          </UContainer>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>
