<script setup lang="ts">
import type { CommandPaletteGroup } from '@nuxt/ui'

const isOpen = ref(false)
const router = useRouter()
const { copy } = useClipboard()

const { data: articles } = await useAsyncData('cmd-writing', () =>
  queryCollection('writing').order('date', 'DESC').all(),
)

const { data: projects } = await useAsyncData('cmd-works', () =>
  queryCollection('works').order('date', 'DESC').all(),
)

const mcpUrl = 'https://hrcd.fr/mcp'
const skillsCmd = 'npx skills add https://hugorcd.com'

const groups = computed<CommandPaletteGroup[]>(() => [
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
      suffix: new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    })),
  },
  {
    id: 'projects',
    label: 'Projects',
    items: (projects.value || []).map(p => ({
      label: p.name,
      icon: 'i-lucide-arrow-up-right',
      to: p.url,
      suffix: p.description,
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
])

function onSelect(item: any) {
  isOpen.value = false
  if (!item) return

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
  }
  else {
    router.push(item.to)
  }
}

defineShortcuts({
  meta_k: () => {
    isOpen.value = !isOpen.value
  },
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      overlay: 'bg-default/50',
      content: 'sm:max-w-md ring-0 shadow-lg border border-muted/15',
    }"
  >
    <template #content>
      <UCommandPalette
        placeholder="Search..."
        :groups="groups"
        size="sm"
        :fuse="{ resultLimit: 10, fuseOptions: { threshold: 0.3 } }"
        :ui="{
          root: 'divide-muted/10 **:shadow-none',
          input: '[&>input]:font-mono [&>input]:text-xs [&>input]:placeholder:text-muted/40',
          label: 'text-[10px] uppercase tracking-wider text-muted/50 font-normal',
          itemLeadingIcon: 'text-muted/40',
          itemLabelBase: 'text-highlighted font-normal',
          itemLabelSuffix: 'text-muted/40',
          viewport: 'divide-muted/10 max-h-72',
          group: 'p-1',
        }"
        close
        @update:model-value="onSelect"
        @update:open="isOpen = $event"
      />
    </template>
  </UModal>
</template>
