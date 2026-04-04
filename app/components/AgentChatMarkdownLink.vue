<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  href?: string
}>()

const { seo } = useFolioConfig()

type Resolved
  = | { kind: 'internal', to: RouteLocationRaw }
    | { kind: 'external', href: string }
    | { kind: 'text' }

function siteHosts(): Set<string> {
  const s = new Set<string>(['hugorcd.com', 'www.hugorcd.com'])
  try {
    s.add(new URL(seo.url).hostname)
  } catch {
    // invalid seo.url
  }
  if (import.meta.dev) {
    s.add('localhost')
    s.add('127.0.0.1')
  }
  return s
}

function resolveLink(raw: string | undefined): Resolved {
  const h = raw?.trim() || ''
  if (!h) return { kind: 'text' }
  if (h.startsWith('mailto:') || h.startsWith('tel:')) return { kind: 'external', href: h }
  if (h.startsWith('/') && !h.startsWith('//')) return { kind: 'internal', to: h }

  let url: URL
  try {
    url = new URL(h)
  } catch {
    return { kind: 'external', href: h }
  }

  if (siteHosts().has(url.hostname)) {
    return { kind: 'internal', to: `${url.pathname}${url.search}${url.hash}` }
  }

  return { kind: 'external', href: url.href }
}

const link = computed(() => resolveLink(props.href))

const chipClass =
  'my-0.5 mr-1.5 mb-1 inline-flex max-w-[min(100%,20rem)] items-center gap-1.5 rounded-full border border-default/25 bg-elevated/45 px-2.5 py-1 text-xs/5 text-highlighted transition-[background-color,border-color] hover:bg-elevated/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted/35 dark:border-white/12'
</script>

<template>
  <span v-if="link.kind === 'text'" class="text-muted"><slot /></span>
  <NuxtLink
    v-else-if="link.kind === 'internal'"
    :to="link.to"
    :class="chipClass"
  >
    <span class="min-w-0 truncate"><slot /></span>
  </NuxtLink>
  <a
    v-else
    :href="link.href"
    target="_blank"
    rel="noopener noreferrer"
    :class="chipClass"
  >
    <UIcon name="i-lucide-external-link" class="size-3 shrink-0 opacity-70" aria-hidden="true" />
    <span class="min-w-0 truncate"><slot /></span>
  </a>
</template>
