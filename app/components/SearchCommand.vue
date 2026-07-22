<script setup lang="ts">
import type { CommandPaletteGroup } from '@nuxt/ui'

const isOpen = ref(false)
const paletteQuery = ref('')
const router = useRouter()
const { copy } = useClipboard()

const { data: articles } = await useFetch<FolioWritingListItem[]>('/api/folio/writing', {
  key: 'folio-writing-cmd',
})

const { data: clipboards } = await useFetch<FolioClipboardListItem[]>('/api/folio/clipboard', {
  key: 'folio-clipboard-cmd',
})

const { data: projects } = await useAsyncData('cmd-works', () =>
  queryCollection('works').order('date', 'DESC').all(),
)

const mcpUrl = 'https://hugorcd.com/mcp'
const skillsCmd = 'npx skills add https://hugorcd.com'

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

const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'pages',
    label: 'Pages',
    items: [
      { label: 'Home', icon: 'i-lucide-home', to: '/' },
      { label: 'Writing', icon: 'i-lucide-pen-line', to: '/writing' },
      { label: 'Works', icon: 'i-lucide-layers', to: '/works' },
      { label: 'Chat', icon: 'i-lucide-bot', to: '/chat' },
    ],
  },
  {
    id: 'writing',
    label: 'Writing',
    items: (articles.value || []).map(a => ({
      label: a.title,
      icon: 'i-lucide-file-text',
      to: a.path,
      suffix: new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    })),
  },
  {
    id: 'clipboard',
    label: 'Clipboard',
    items: (clipboards.value || []).map(c => ({
      label: c.title,
      icon: 'i-lucide-clipboard-list',
      to: c.path,
      suffix: new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
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
    id: 'mcp',
    label: 'MCP & Skills',
    items: [
      { label: 'Add MCP to Cursor', icon: 'i-lucide-terminal', action: 'deeplink-cursor' },
      { label: 'Add MCP to VS Code', icon: 'i-lucide-code', action: 'deeplink-vscode' },
      { label: 'Copy MCP URL', icon: 'i-lucide-link', action: 'copy-mcp-url' },
      { label: 'Copy skills install command', icon: 'i-lucide-sparkles', action: 'copy-skills-cmd', suffix: 'npx skills add' },
    ],
  },
])

const placeholder = 'Search pages, writing, projects\u2026'

function onSelect(item: any) {
  if (!item) return

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
