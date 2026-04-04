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
const { user, signOut, loggedIn } = useUserSession()

const { data: folioAccess, refresh: refreshFolioAccess } = await useAsyncData(
  'folio-chat-access',
  () => $fetch<{
    isOwner: boolean
    signedIn: boolean
    rateLimit: { max: number, used: number, remaining: number | null }
  }>('/api/folio/access'),
)

watch(loggedIn, () => {
  void refreshFolioAccess()
})

const isOwner = computed(() => folioAccess.value?.isOwner ?? false)
const rateRemaining = computed(() => folioAccess.value?.rateLimit.remaining)
const rateMax = computed(() => folioAccess.value?.rateLimit.max ?? 20)

const sessionTooltipTitle = computed(() => {
  const u = user.value
  if (!u) return ''
  const name = u.name?.trim()
  if (name) return name
  return u.email?.trim() || 'Account'
})

const sessionTooltipSubtitle = computed(() => {
  const u = user.value
  if (!u) return null
  const name = u.name?.trim()
  const email = u.email?.trim()
  if (!email || !name || name === email) return null
  return email
})

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
  sendAutomaticallyWhen: ({ messages: msgs }) => {
    const last = msgs.at(-1)
    if (!last || last.role !== 'assistant') return false
    return last.parts.some(p => isToolUIPart(p) && p.state === 'approval-responded')
      && !last.parts.some(p => isToolUIPart(p) && p.state === 'approval-requested')
  },
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
    void refreshFolioAccess()
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

  const mcpLabel: Record<string, string> = {
    'assistant-context': `${done ? 'Loaded' : 'Loading'} context`,
    'content-list': `${searchVerb} site index`,
    'content-get': `${readVerb} ${toolInput.kind === 'work' ? `work “${toolInput.stem || ''}”` : `page ${toolInput.path || ''}`}`,
  }
  if (mcpLabel[toolName]) return mcpLabel[toolName]

  const ghMeta = GITHUB_TOOL_META[toolName]
  if (ghMeta) {
    if (state === 'approval-requested' || state === 'approval-responded')
      return `Approve: ${ghMeta.labelActive.toLowerCase()}`
    return done ? ghMeta.label : ghMeta.labelActive
  }

  return `${done ? 'Ran' : 'Running'} ${toolName}`
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
  const mcpIcons: Record<string, string> = {
    'assistant-context': 'i-lucide-book-marked',
    'content-list': 'i-lucide-list-tree',
    'content-get': 'i-lucide-file-text',
  }
  if (mcpIcons[toolName]) return mcpIcons[toolName]

  const ghMeta = GITHUB_TOOL_META[toolName]
  if (ghMeta) return ghMeta.icon

  return 'i-lucide-wrench'
}

function isApprovalRequested(part: ToolPart): boolean {
  return part.state === 'approval-requested' && !!('approval' in part && part.approval)
}

function isApprovalResponded(part: ToolPart): boolean {
  return part.state === 'approval-responded' && !!('approval' in part && part.approval)
}

function respondToApproval(part: ToolPart, approved: boolean) {
  if (!('approval' in part) || !part.approval || !('id' in part.approval)) return
  chat.addToolApprovalResponse({ id: part.approval.id as string, approved })
}

function getApprovalTitle(part: ToolPart) {
  const name = getToolName(part)
  return GITHUB_TOOL_META[name]?.labelActive ?? `Run ${name}`
}

function githubRepoLineFromInput(input: unknown): string | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const { owner, repo } = input as Record<string, unknown>
  if (typeof owner === 'string' && typeof repo === 'string' && owner && repo) return `${owner}/${repo}`
  return null
}

const TOOL_INPUT_KEY_LABELS: Record<string, string> = {
  owner: 'Owner',
  repo: 'Repository',
  title: 'Title',
  body: 'Body',
  path: 'Path',
  branch: 'Branch',
  head: 'Head',
  base: 'Base',
  state: 'State',
  message: 'Message',
  content: 'Content',
  labels: 'Labels',
  assignees: 'Assignees',
  issue_number: 'Issue',
  pull_number: 'Pull request',
  query: 'Query',
}

function formatToolInputLabel(key: string) {
  if (TOOL_INPUT_KEY_LABELS[key]) return TOOL_INPUT_KEY_LABELS[key]
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, c => c.toUpperCase())
}

function formatToolInputValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function toolInputRows(part: ToolPart): { key: string, value: string }[] {
  const raw = part.input
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
  return Object.entries(raw as Record<string, unknown>)
    .filter(([, v]) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === ''))
    .map(([k, v]) => ({
      key: formatToolInputLabel(k),
      value: formatToolInputValue(v),
    }))
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

          <div class="flex min-w-0 shrink-0 items-center justify-end gap-4 sm:gap-5">
            <UPopover
              v-if="!isOwner && rateRemaining != null"
              :content="{ align: 'end', side: 'bottom', sideOffset: 6 }"
            >
              <UButton
                icon="i-lucide-circle-help"
                color="neutral"
                variant="ghost"
                size="xs"
                square
                class="text-muted/30 hover:text-muted/55"
                aria-label="Usage limits"
              />
              <template #content>
                <div class="w-[min(18rem,calc(100vw-2rem))] p-3 text-xs/5 text-muted">
                  <p class="font-medium text-highlighted">
                    Daily limit
                  </p>
                  <p class="mt-1.5">
                    {{ rateRemaining }} / {{ rateMax }} messages left today (UTC). Resets at midnight UTC.
                  </p>
                  <p class="mt-2 text-dimmed">
                    Without an account, usage is counted per IP. Signing in ties the quota to your account.
                  </p>
                </div>
              </template>
            </UPopover>

            <template v-if="loggedIn">
              <UTooltip
                :delay-duration="0"
                :content="{ side: 'top', align: 'center', sideOffset: 8 }"
                :ui="{
                  content:
                    'h-auto min-h-0 flex-col items-stretch justify-start gap-1.5 py-2.5 px-3 w-max max-w-[min(18rem,calc(100vw-2rem))] text-left'
                }"
              >
                <span class="inline-flex items-center gap-1.5">
                  <UAvatar
                    :src="user?.image ?? undefined"
                    :alt="user?.name ?? 'Account'"
                    size="3xs"
                    class="opacity-70"
                  />
                  <UButton
                    icon="custom:logout"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    class="min-h-0 min-w-0 px-0.5 text-muted/35 hover:text-muted/80"
                    aria-label="Sign out"
                    @click="signOut()"
                  />
                </span>
                <template #content>
                  <div class="flex min-w-0 flex-col gap-0.5">
                    <span class="text-sm/5 font-medium text-highlighted">
                      {{ sessionTooltipTitle }}
                    </span>
                    <span
                      v-if="sessionTooltipSubtitle"
                      class="wrap-break-word text-xs/4 text-dimmed"
                    >
                      {{ sessionTooltipSubtitle }}
                    </span>
                  </div>
                </template>
              </UTooltip>
            </template>
            <NuxtLink
              v-else
              to="/login?redirect=/chat"
              class="font-mono text-[10px] text-muted/30 transition-colors hover:text-muted/60"
            >
              Sign in
            </NuxtLink>

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

                      <template v-else-if="isToolUIPart(part)">
                        <div
                          v-if="isApprovalRequested(part)"
                          class="flex flex-col gap-3 rounded-lg border border-default ring-1 ring-default/40 bg-elevated/45 p-4"
                        >
                          <div class="flex gap-3">
                            <div
                              class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/25 ring-1 ring-default/30"
                            >
                              <UIcon
                                :name="getToolIcon(part)"
                                class="size-4 text-muted"
                              />
                            </div>
                            <div class="flex min-w-0 flex-1 flex-col gap-3">
                              <div>
                                <p class="text-sm/5 font-medium text-highlighted">
                                  {{ getApprovalTitle(part) }}
                                </p>
                                <p
                                  v-if="githubRepoLineFromInput(part.input)"
                                  class="mt-0.5 font-mono text-xs/4 text-muted"
                                >
                                  {{ githubRepoLineFromInput(part.input) }}
                                </p>
                                <p class="mt-1.5 text-xs/4 text-dimmed">
                                  Review the payload below. Nothing is sent to GitHub until you approve.
                                </p>
                              </div>

                              <div
                                v-if="toolInputRows(part).length"
                                class="flex flex-col gap-2 border-t border-default/70 pt-3"
                              >
                                <div
                                  v-for="(row, rowIdx) in toolInputRows(part)"
                                  :key="`${row.key}-${rowIdx}`"
                                  class="grid gap-1 sm:grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] sm:gap-x-4"
                                >
                                  <div class="font-mono text-[10px]/4 uppercase tracking-wide text-muted">
                                    {{ row.key }}
                                  </div>
                                  <div
                                    class="max-h-40 min-w-0 wrap-break-word whitespace-pre-wrap font-mono text-xs/5 text-highlighted overflow-y-auto"
                                  >
                                    {{ row.value }}
                                  </div>
                                </div>
                              </div>
                              <p
                                v-else
                                class="border-t border-default/70 pt-3 text-xs/4 text-dimmed italic"
                              >
                                No parameters were included on this tool call.
                              </p>

                              <div class="flex flex-wrap items-center gap-2 border-t border-default/70 pt-3">
                                <UButton
                                  size="sm"
                                  color="neutral"
                                  variant="solid"
                                  icon="i-lucide-check"
                                  label="Approve"
                                  @click="respondToApproval(part, true)"
                                />
                                <UButton
                                  size="sm"
                                  color="neutral"
                                  variant="outline"
                                  icon="i-lucide-x"
                                  label="Deny"
                                  @click="respondToApproval(part, false)"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <UChatTool
                          v-else-if="isApprovalResponded(part)"
                          :text="`${getToolText(part)} — ${'approval' in part && part.approval && 'approved' in part.approval && part.approval.approved ? 'Approved' : 'Denied'}`"
                          :icon="'approval' in part && part.approval && 'approved' in part.approval && part.approval.approved ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
                          :streaming="false"
                        />
                        <UChatTool
                          v-else
                          :text="getToolText(part)"
                          :icon="getToolIcon(part)"
                          :streaming="isToolStreaming(part)"
                        />
                      </template>
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
