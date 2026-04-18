<script setup lang="ts">
import type { CommandPaletteGroup } from '@nuxt/ui'

type PalettePage = 'home' | 'intelligence'

const isOpen = ref(false)
const paletteQuery = ref('')
const page = ref<PalettePage>('home')
const router = useRouter()
const { copy } = useClipboard()
const toast = useToast()
const { isOwner } = useFolioOwner()

const runningWorkflows = ref<Set<string>>(new Set())

const { data: articles } = await useFetch<FolioWritingListItem[]>('/api/folio/writing', {
  key: 'folio-writing-cmd',
  credentials: 'include',
})

const { data: clipboards } = await useFetch<FolioClipboardListItem[]>('/api/folio/clipboard', {
  key: 'folio-clipboard-cmd',
  credentials: 'include',
})

const { data: projects } = await useAsyncData('cmd-works', () =>
  queryCollection('works').order('date', 'DESC').all(),
)

const mcpUrl = 'https://hugorcd.com/mcp'
const skillsCmd = 'npx skills add https://hugorcd.com'

const { agentTitle, agentLabel } = useAgentBrand()

function clampText(s: string, max: number) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}\u2026`
}

/** UCommandPalette passes link props to ULink — external URLs open in a new tab. */
function externalLinkProps(to: string | undefined) {
  if (!to || (!to.startsWith('http://') && !to.startsWith('https://'))) return {}
  return { target: '_blank' as const, rel: 'noopener noreferrer' }
}

const intelligenceSources = [
  { id: 'github', label: 'GitHub', icon: 'i-simple-icons-github', description: 'Commits, PRs, issues, reviews' },
  { id: 'linear', label: 'Linear', icon: 'i-simple-icons-linear', description: 'Issues, cycles, progress' },
  { id: 'typefully', label: 'Typefully', icon: 'i-lucide-calendar-clock', description: 'Drafts, queue, X analytics' },
  { id: 'tweets', label: 'Tweets', icon: 'i-simple-icons-x', description: 'Generate tweet ideas from GitHub, Linear & Typefully' },
] as const

async function triggerWorkflow(sourceId: string) {
  if (runningWorkflows.value.has(sourceId)) return
  runningWorkflows.value.add(sourceId)
  try {
    const result = await $fetch<{ runId: string, source: string, date: string }>(
      `/api/intelligence/${sourceId}`,
      { method: 'POST', credentials: 'include' },
    )
    toast.add({
      title: `${sourceId.charAt(0).toUpperCase() + sourceId.slice(1)} workflow started`,
      description: `Run ${result.runId} for ${result.date}`,
      icon: 'i-lucide-play',
      color: 'success',
    })
  } catch (err: any) {
    toast.add({
      title: 'Workflow failed to start',
      description: err?.data?.message || err?.message || 'Unknown error',
      icon: 'i-lucide-alert-triangle',
      color: 'error',
    })
  } finally {
    runningWorkflows.value.delete(sourceId)
  }
}

const intelligenceGroups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'intelligence-nav',
    label: 'Navigation',
    ignoreFilter: true,
    items: [{ label: 'Back', icon: 'i-lucide-arrow-left', action: 'page-home' },],
  },
  {
    id: 'intelligence-workflows',
    label: 'Workflows',
    items: [
      {
        label: 'Run all workflows',
        icon: 'i-lucide-zap',
        action: 'run-all-workflows',
        description: 'Trigger every intelligence source at once',
      },
      ...intelligenceSources.map(s => ({
        label: s.label,
        icon: s.icon,
        action: `run-workflow-${s.id}`,
        description: s.description,
        suffix: runningWorkflows.value.has(s.id) ? 'Running\u2026' : '',
      })),
    ],
  },
  {
    id: 'intelligence-links',
    label: 'Links',
    items: [
      {
        label: 'Intelligence repo',
        icon: 'i-simple-icons-github',
        to: 'https://github.com/HugoRCD/hr-intelligence',
        description: 'Daily summaries backup on GitHub',
        ...externalLinkProps('https://github.com/HugoRCD/hr-intelligence'),
      },
    ],
  },
])

const homeGroups = computed<CommandPaletteGroup[]>(() => {
  const q = paletteQuery.value.trim()
  const askInChat: CommandPaletteGroup[] = q
    ? [
      {
        id: 'agent-query',
        label: `Ask ${agentLabel.value}`,
        ignoreFilter: true,
        items: [
          {
            label: q.length > 88 ? `${q.slice(0, 87)}\u2026` : q,
            icon: 'custom:ai',
            description: 'Open in chat',
            action: 'open-chat-query',
          },
        ],
      },
    ]
    : []

  const ownerGroups: CommandPaletteGroup[] = isOwner.value
    ? [
      {
        id: 'owner',
        label: 'Owner',
        items: [{ label: 'Intelligence Workflows', icon: 'i-lucide-brain', action: 'page-intelligence', description: 'Launch daily intelligence workflows' },],
      },
    ]
    : []

  return [
    ...askInChat,
    {
      id: 'agent',
      label: agentTitle.value,
      items: [
        {
          label: `Chat with ${agentLabel.value}`,
          icon: 'custom:ai',
          to: '/chat',
          description: 'Grounded in this site\u2019s pages, writing & works only.',
        },
      ],
    },
    ...ownerGroups,
    {
      id: 'pages',
      label: 'Pages',
      items: [
        { label: 'Home', icon: 'i-lucide-home', to: '/' },
        { label: 'Writing', icon: 'i-lucide-pen-line', to: '/writing' },
        { label: 'Works', icon: 'i-lucide-layers', to: '/works' },
      ],
    },
    {
      id: 'writing',
      label: 'Writing',
      items: (articles.value || []).map(a => ({
        label: a.title,
        icon: 'i-lucide-file-text',
        to: a.path,
        suffix: [
          a.draft ? 'Draft' : '',
          new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        ].filter(Boolean).join(' \u00B7 '),
      })),
    },
    {
      id: 'clipboard',
      label: 'Clipboard',
      items: (clipboards.value || []).map(c => ({
        label: c.title,
        icon: 'i-lucide-clipboard-list',
        to: c.path,
        suffix: [
          c.draft ? 'Draft' : '',
          new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        ].filter(Boolean).join(' \u00B7 '),
      })),
    },
    {
      id: 'projects',
      label: 'Projects',
      items: (projects.value || []).map(p => ({
        label: p.name,
        icon: 'i-lucide-arrow-up-right',
        to: p.url,
        ...externalLinkProps(p.url),
        ...(p.description ? { description: clampText(String(p.description), 96) } : {}),
      })),
    },
    {
      id: 'ai',
      label: 'AI & Agents',
      items: [
        { label: 'Add MCP to Cursor', icon: 'i-lucide-terminal', action: 'deeplink-cursor' },
        { label: 'Add MCP to VS Code', icon: 'i-lucide-code', action: 'deeplink-vscode' },
        { label: 'Copy MCP URL', icon: 'i-lucide-link', action: 'copy-mcp-url' },
        { label: 'Copy skills install command', icon: 'i-lucide-sparkles', action: 'copy-skills-cmd', suffix: 'npx skills add' },
      ],
    },
  ]
})

const groups = computed<CommandPaletteGroup[]>(() =>
  page.value === 'intelligence' ? intelligenceGroups.value : homeGroups.value,
)

const placeholder = computed(() =>
  page.value === 'intelligence' ? 'Search workflows\u2026' : 'Search pages, writing, projects\u2026',
)

function onSelect(item: any) {
  if (!item) return

  if (item.action === 'page-home') {
    page.value = 'home'
    paletteQuery.value = ''
    return
  }
  if (item.action === 'page-intelligence') {
    page.value = 'intelligence'
    paletteQuery.value = ''
    return
  }

  if (item.action === 'run-all-workflows') {
    for (const s of intelligenceSources) triggerWorkflow(s.id)
    return
  }
  if (item.action?.startsWith('run-workflow-')) {
    triggerWorkflow(item.action.replace('run-workflow-', ''))
    return
  }

  if (item.action === 'open-chat-query') {
    const q = paletteQuery.value.trim()
    isOpen.value = false
    paletteQuery.value = ''
    if (q) router.push({ path: '/chat', query: { q } })
    return
  }

  isOpen.value = false
  if (item.action === 'deeplink-cursor') {
    window.open(`${mcpUrl}/deeplink?ide=cursor`, '_self')
    return
  }
  if (item.action === 'deeplink-vscode') {
    window.open(`${mcpUrl}/deeplink?ide=vscode`, '_self')
    return
  }
  if (item.action === 'copy-mcp-url') {
    copy(mcpUrl)
    return
  }
  if (item.action === 'copy-skills-cmd') {
    copy(skillsCmd)
    return
  }

  if (!item.to) return
  if (item.to.startsWith('http')) {
    // Items with `target` / `rel` are handled by UCommandPalette’s ULink (avoids double-opening).
    if (!item.target) window.open(item.to, '_blank', 'noopener,noreferrer')
  } else {
    router.push(item.to)
  }
}

defineShortcuts({
  meta_k: () => {
    isOpen.value = !isOpen.value
  },
})

watch(isOpen, (open) => {
  if (!open) {
    paletteQuery.value = ''
    page.value = 'home'
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      overlay: 'backdrop-blur-md bg-black/50 dark:bg-black/70',
      content: 'sm:max-w-lg rounded-xl shadow-2xl ring-1 ring-default/30 border border-default/35',
    }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="paletteQuery"
        :placeholder
        class="max-h-72 min-h-0 sm:max-h-[min(20rem,50vh)]"
        :groups
        size="sm"
        :fuse="{
          resultLimit: 10,
          fuseOptions: { threshold: 0.3, keys: ['label', 'suffix', 'description'] },
        }"
        :ui="{
          root: 'divide-muted/10 **:shadow-none min-h-0 flex-1',
          input: '[&>input]:font-mono [&>input]:text-xs [&>input]:placeholder:text-muted/40',
          label: 'text-[10px] uppercase tracking-wider text-muted/50 font-normal',
          itemLeadingIcon: 'text-muted/40',
          itemLabelBase: 'text-highlighted font-normal',
          itemLabelSuffix: 'text-[10px]/4 text-muted/45 shrink-0',
          itemDescription: 'mt-0.5 line-clamp-2 text-[11px]/4 text-muted/65 font-normal',
          viewport: 'divide-muted/10 max-h-none min-h-0 flex-1 overflow-y-auto',
          group: 'p-1',
        }"
        close
        @update:model-value="onSelect"
        @update:open="isOpen = $event"
      />
    </template>
  </UModal>
</template>
