<script lang="ts">
import { defu } from 'defu'
import codeIconTheme from '#build/ui/prose/code-icon'
</script>

<script setup lang="ts">
const props = defineProps<{
  icon?: string
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  hideHeader?: boolean
  meta?: string
  class?: string
}>()

const { copy, copied } = useClipboard()
const appConfig = useAppConfig() as Record<string, any>

const icons = computed(() => defu(appConfig.ui?.prose?.codeIcon || {}, codeIconTheme) as Record<string, string>)

const resolvedIcon = computed(() => {
  if (props.icon) return props.icon
  if (!props.filename) return undefined

  const clean = props.filename.replace(/\s*\(.*\)\s*$/, '')
  const ext = clean.includes('.') && clean.split('.').pop()
  const name = clean.split('/').pop()

  return (name && icons.value[name.toLowerCase()])
    ?? (ext && (icons.value[ext] ?? `i-vscode-icons-file-type-${ext}`))
    ?? undefined
})

const COLLAPSE_THRESHOLD = 15
const lines = computed(() => (props.code || '').split('\n').length)
const isLong = computed(() => lines.value > COLLAPSE_THRESHOLD)
const isCollapsed = ref(true)
const showCollapse = computed(() => isLong.value && isCollapsed.value)
</script>

<template>
  <div class="prose-code-block code-block group relative my-6 overflow-hidden rounded-lg">
    <div v-if="filename && !hideHeader" class="code-header flex items-center gap-1.5 px-4 py-2">
      <UIcon v-if="resolvedIcon" :name="resolvedIcon" class="size-3.5 shrink-0 text-muted/50" />
      <span class="font-mono text-xs/5 text-muted">{{ filename }}</span>
    </div>

    <UButton
      :icon="copied ? appConfig.ui.icons.copyCheck : appConfig.ui.icons.copy"
      color="neutral"
      variant="ghost"
      size="xs"
      class="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      :aria-label="copied ? 'Copied' : 'Copy'"
      @click="copy(props.code || '')"
    />

    <div class="relative" :class="showCollapse && 'max-h-[360px] overflow-hidden'">
      <pre
        class="font-mono text-[13px]/6 px-5 py-4 overflow-x-auto focus:outline-none"
        :class="props.class"
        v-bind="$attrs"
      ><slot /></pre>
      <div
        v-if="showCollapse"
        class="code-fade pointer-events-none absolute inset-x-0 bottom-0 h-24"
      />
    </div>

    <button
      v-if="isLong"
      class="code-footer flex w-full items-center justify-center py-2 font-mono text-xs text-muted/50 transition-colors hover:text-highlighted"
      @click="isCollapsed = !isCollapsed"
    >
      {{ isCollapsed ? `Show all ${lines} lines` : 'Collapse' }}
    </button>
  </div>
</template>

<style scoped>
.code-header {
  border-bottom: 1px solid var(--code-border);
}

.code-footer {
  border-top: 1px solid var(--code-border);
}

.code-fade {
  background: linear-gradient(to bottom, transparent, var(--code-bg));
}
</style>
