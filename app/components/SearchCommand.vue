<script setup lang="ts">
import type { CommandPaletteGroup } from '@nuxt/ui'
import type { FolioClipboardListItem, FolioWritingListItem } from '~/types/folio-lists'

const isOpen = ref(false)
const paletteQuery = ref('')
const router = useRouter()
const { copy } = useClipboard()

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

const mcpUrl = 'https://hrcd.fr/mcp'
const skillsCmd = 'npx skills add https://hugorcd.com'

const { agentTitle, agentLabel } = useAgentBrand()

function clampText(s: string, max: number) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

const groups = computed<CommandPaletteGroup[]>(() => {
  const q = paletteQuery.value.trim()
  const askInChat: CommandPaletteGroup[] = q
    ? [
      {
        id: 'agent-query',
        label: `Ask ${agentLabel.value}`,
        ignoreFilter: true,
        items: [
          {
            label: q.length > 88 ? `${q.slice(0, 87)}…` : q,
            icon: 'custom:ai',
            description: 'Open in chat',
            action: 'open-chat-query',
          }
        ],
      }
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
          description: 'Grounded in this site’s pages, writing & works only.',
        },
      ],
    },
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
        ].filter(Boolean).join(' · '),
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
        ].filter(Boolean).join(' · '),
      })),
    },
    {
      id: 'projects',
      label: 'Projects',
      items: (projects.value || []).map(p => ({
        label: p.name,
        icon: 'i-lucide-arrow-up-right',
        to: p.url,
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

function onSelect(item: any) {
  if (!item) return

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
    window.open(item.to, '_blank')
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
  if (!open) paletteQuery.value = ''
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
        placeholder="Search pages, writing, projects…"
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
