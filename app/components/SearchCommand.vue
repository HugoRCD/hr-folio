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

const socials = useSocialLinks()

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

// The site's index, set like its lists: numbered sections, each row a title, a dotted leader, a date.
const month = (d: string | Date) => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
const all = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'pages',
    label: 'Pages',
    items: [
      { label: 'Home', to: '/' },
      { label: 'Writing', to: '/writing' },
      { label: 'Works', to: '/works' },
    ],
  },
  {
    id: 'writing',
    label: 'Writing',
    items: (articles.value || []).map(a => ({ label: a.title, to: a.path, suffix: month(a.date) })),
  },
  {
    id: 'projects',
    label: 'Projects',
    items: (projects.value || []).map(p => ({
      label: p.name,
      to: p.url,
      ...externalLinkProps(p.url),
      ...(p.description ? { suffix: clampText(String(p.description), 56), class: 'is-project' } : {}),
    })),
  },
  {
    id: 'clipboard',
    label: 'Clipboard',
    items: (clipboards.value || []).map(c => ({ label: c.title, to: c.path, suffix: month(c.date) })),
  },
  {
    id: 'contact',
    label: 'Contact',
    items: socials.value.map(link => ({ label: link.label, to: link.href, ...externalLinkProps(link.href) })),
  },
  {
    id: 'mcp',
    label: 'MCP & Skills',
    items: [
      { label: 'Add MCP to Cursor', action: 'deeplink-cursor' },
      { label: 'Add MCP to VS Code', action: 'deeplink-vscode' },
      { label: 'Copy MCP URL', action: 'copy-mcp-url' },
      { label: 'Copy skills install command', action: 'copy-skills-cmd', suffix: 'npx skills add' },
    ],
  },
])

// Until something is typed, a short list: the pages, the last three articles, the two copy actions.
// Projects, the clipboard and contacts come up as soon as you type.
const SHORT: Record<string, number> = { pages: 4, writing: 3, mcp: 2 }
const groups = computed<CommandPaletteGroup[]>(() => paletteQuery.value.trim()
  ? all.value
  : all.value
    .filter(g => g.id in SHORT)
    .map(g => ({ ...g, items: g.id === 'mcp' ? g.items!.slice(2) : g.items!.slice(0, SHORT[g.id]) })))

const placeholder = 'pages, writing, projects\u2026'

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
  if (item.to.startsWith('mailto:')) return
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
    :transition="false"
    title="Index"
    description="Find a page, an article or a project"
    :ui="{
      overlay: 'index-overlay bg-default/90',
      content: 'top-[14vh] translate-y-0 w-[calc(100vw-3rem)] max-w-[520px] rounded-none shadow-none ring-0 bg-transparent overflow-visible divide-y-0 max-h-none',
    }"
  >
    <template #content>
      <div class="index-sheet">
        <span class="crop tl" aria-hidden="true" /><span class="crop tr" aria-hidden="true" />
        <span class="crop bl" aria-hidden="true" /><span class="crop br" aria-hidden="true" />
        <div class="index-head" aria-hidden="true">
          <span class="title">Index</span>
          <button type="button" class="esc" tabindex="-1" @click="isOpen = false">
            esc
          </button>
        </div>
        <UCommandPalette
          v-model:search-term="paletteQuery"
          :placeholder
          icon=""
          :close="false"
          class="min-h-0"
          :groups
          size="sm"
          :fuse="{
            resultLimit: 12,
            fuseOptions: { threshold: 0.3, ignoreLocation: true, keys: ['label', 'suffix'] },
          }"
          :ui="{
            root: 'divide-y-0 min-h-0 flex-1',
            input: 'index-input',
            content: 'min-h-0 flex-1',
            viewport: 'index-viewport divide-y-0 max-h-none min-h-0 flex-1 overflow-y-auto',
            group: 'p-0',
            label: 'index-label',
            empty: 'index-empty',
            item: 'index-item before:hidden',
            itemWrapper: 'min-w-0',
            itemLabel: 'index-row',
            itemLabelBase: 'index-title',
            itemLabelSuffix: 'index-suffix',
            itemDescription: 'index-description',
            itemTrailing: 'hidden',
          }"
          @update:model-value="onSelect"
        >
          <template #item-leading>
            <span class="tick" aria-hidden="true" />
          </template>
          <template #footer>
            <p class="index-foot">
              <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span>
              <span><kbd>&crarr;</kbd> open</span>
              <span class="ml-auto"><kbd>&#8984;</kbd><kbd>K</kbd></span>
            </p>
          </template>
        </UCommandPalette>
      </div>
    </template>
  </UModal>
</template>

<style>
/* Not scoped: the modal is teleported to the body. A sheet of the same paper over a page put
   almost out of sight: a hairline frame, crop marks off the corners, no shadow, no blur. */
.index-overlay {
  animation: index-fade 0.18s ease;
}
.index-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: min(30rem, 72vh);
  background: var(--ui-bg);
  border: 1px solid color-mix(in oklab, var(--ui-text) 24%, var(--ui-bg));
  animation: index-unroll 0.3s cubic-bezier(0.65, 0, 0.35, 1);
}
.index-sheet .crop {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 0 solid color-mix(in oklab, var(--ui-text) 40%, var(--ui-bg));
  pointer-events: none;
}
.index-sheet .crop.tl { top: -6px; left: -6px; border-top-width: 1px; border-left-width: 1px; }
.index-sheet .crop.tr { top: -6px; right: -6px; border-top-width: 1px; border-right-width: 1px; }
.index-sheet .crop.bl { bottom: -6px; left: -6px; border-bottom-width: 1px; border-left-width: 1px; }
.index-sheet .crop.br { bottom: -6px; right: -6px; border-bottom-width: 1px; border-right-width: 1px; }

/* the title and esc sit on the line you write on, like a field on a form */
.index-head {
  position: absolute;
  z-index: 1;
  top: 0;
  inset-inline: 16px;
  display: flex;
  align-items: center;
  height: 48px;
  pointer-events: none;
}
.index-head .title {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 15px;
  line-height: 20px;
  color: var(--ui-primary);
}
.index-head .esc {
  margin-left: auto;
  pointer-events: auto;
  transition: color 0.2s ease;
}
.index-head .esc:hover {
  color: var(--ui-text-highlighted);
}
.index-head .esc,
.index-foot,
.index-label,
.index-empty {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}

.index-input {
  display: flex;
  border-bottom: 1px solid var(--ui-primary) !important;
}
.index-input > input {
  height: 48px;
  padding: 0 52px 0 68px;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ui-text-highlighted);
  background: transparent;
  box-shadow: none !important;
  outline: none;
}
.index-input > input::placeholder {
  color: var(--ui-text-dimmed);
}

/* sections numbered like the sheet's, a hairline out to the frame */
.index-viewport {
  counter-reset: index;
  padding-bottom: 6px;
}
.index-label {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 8px 16px 0;
  color: var(--ui-text-muted);
}
.index-label::before {
  counter-increment: index;
  content: counter(index, upper-roman);
  min-width: 14px;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 13px;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ui-primary);
}
.index-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: color-mix(in oklab, var(--ui-text) 10%, var(--ui-bg));
}

/* a row as in the lists: tick, title, dotted leader, date. The row in hand gets a band. */
.index-item {
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 4px 16px;
  border-radius: 0;
  cursor: pointer;
}
.index-item[data-highlighted] {
  background: color-mix(in oklab, var(--ui-text) 6%, var(--ui-bg));
}
.index-item .tick {
  flex: none;
  align-self: flex-start;
  width: 14px;
  height: 1px;
  margin-top: 10px;
  background: color-mix(in oklab, var(--ui-text) 22%, var(--ui-bg));
  transform: scaleX(0.57);
  transform-origin: left;
  transition: transform 0.15s ease, background-color 0.15s ease;
}
.index-item[data-highlighted] .tick {
  background: var(--ui-primary);
  transform: none;
}
.index-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
}
.index-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-text-toned);
}
.index-item[data-highlighted] .index-title {
  color: var(--ui-text-highlighted);
}
.index-suffix {
  display: flex;
  flex: 1;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ui-text-dimmed);
}
.is-project .index-suffix {
  justify-content: flex-end;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-sans);
  font-size: 12px;
}
.is-project .index-suffix::before {
  display: none;
}
.index-suffix::before {
  content: '';
  flex: 1;
  min-width: 16px;
  border-bottom: 1px dotted color-mix(in oklab, var(--ui-text) 24%, var(--ui-bg));
}
.index-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 16px;
  color: var(--ui-text-dimmed);
}
.index-item mark {
  background: transparent;
  color: var(--ui-text-highlighted);
  text-decoration: underline;
  text-decoration-color: var(--ui-primary);
  text-underline-offset: 3px;
}
.index-empty {
  padding: 24px 16px;
}
.index-foot {
  display: flex;
  gap: 16px;
  width: 100%;
  padding: 8px 16px;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 10%, var(--ui-bg));
}
.index-foot kbd {
  display: inline-block;
  min-width: 14px;
  margin-right: 2px;
  font-family: inherit;
  text-align: center;
  color: var(--ui-text-muted);
}

@media (pointer: coarse) {
  .index-foot {
    display: none;
  }
}

@keyframes index-fade {
  from { opacity: 0; }
}
@keyframes index-unroll {
  from { clip-path: inset(-12px -12px 100% -12px); }
  to { clip-path: inset(-12px -12px -12px -12px); }
}
@media (prefers-reduced-motion: reduce) {
  .index-overlay,
  .index-sheet {
    animation: none;
  }
}
</style>
