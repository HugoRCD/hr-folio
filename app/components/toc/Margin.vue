<script setup lang="ts">
// Contents, set in the index margin of an article: they stay in view while the text scrolls.
import type { TocLink } from '@nuxt/content'

const { links = [], date, minutes = 0 } = defineProps<{
  links: TocLink[]
  date?: string
  minutes?: number
}>()

const { activeHeadings, updateHeadings } = useScrollspy()
onMounted(() => {
  requestAnimationFrame(() => updateHeadings([...document.querySelectorAll('main h2[id], main h3[id]')]))
})

const flat = computed(() => {
  const out: Array<TocLink & { n: string }> = []
  let n = 0
  const walk = (items: TocLink[]) => items.forEach((l) => {
    out.push({ ...l, n: l.depth === 2 ? String(++n) : '·' })
    if (l.children) walk(l.children)
  })
  walk(links)
  return out
})

const published = computed(() => date
  ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  : '')
</script>

<template>
  <aside class="in-index bottom-0 top-1 hidden lg:block" aria-label="Article details and contents">
    <div class="sticky top-24 flex flex-col gap-8 pr-2">
      <p v-if="published" class="flex flex-col gap-0.5">
        <span class="font-redaction text-[15px] italic leading-5 text-highlighted">{{ published }}</span>
        <span v-if="minutes" class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted/60">{{ minutes }} min read</span>
      </p>
      <nav v-if="flat.length" class="flex flex-col">
        <span class="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50">Contents</span>
        <a
          v-for="link in flat"
          :key="link.id"
          :href="`#${link.id}`"
          class="group flex items-baseline gap-2 py-1 text-[12px] leading-4 transition-colors duration-150"
          :class="[
            activeHeadings.includes(link.id) ? 'text-highlighted' : 'text-muted/70 hover:text-highlighted',
            link.depth === 3 && 'pl-5 text-[11px]',
          ]"
        >
          <span class="w-3 shrink-0 font-mono text-[9px] tabular-nums" :class="activeHeadings.includes(link.id) ? 'text-primary' : 'text-muted/40'">{{ link.n }}</span>
          <span class="line-clamp-2">{{ link.text }}</span>
        </a>
      </nav>
    </div>
  </aside>
</template>
