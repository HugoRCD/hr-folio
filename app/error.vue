<script setup lang="ts">
import type { NuxtError } from '#app'
import { nearest } from '~/utils/nearest'

// A page that isn't there, or an error: the watch has stopped, at the time the error reads (ErrorWatch),
// with the pages it might have been meant for, read on the server so they are there at first paint.
const props = defineProps<{
  error?: NuxtError
}>()

const code = computed(() => {
  const n = Number(props.error?.statusCode)
  return Number.isFinite(n) && n > 0 ? n : 500
})
const is404 = computed(() => code.value === 404)
const route = useRoute()
const path = computed(() => decodeURI(route.path))

useHead({
  title: () => is404.value ? 'Page not found' : 'Something went wrong',
  meta: [{ name: 'robots', content: 'noindex' }],
})

// where else to go: the sheet's own pages
const PLACES = [
  { path: '/', title: 'Home' },
  { path: '/works', title: 'Works' },
  { path: '/writing', title: 'Writing' },
  { path: '/clipboard', title: 'Clipboard' },
]

const requestFetch = useRequestFetch()
const { data: known } = await useAsyncData('error-known-pages', async () => {
  const [writing, clipboard] = await Promise.all([
    requestFetch<Array<{ path: string, title: string }>>('/api/folio/writing').catch(() => []),
    requestFetch<Array<{ path: string, title: string }>>('/api/folio/clipboard').catch(() => []),
  ])
  return [...writing, ...clipboard, ...PLACES].map(p => ({ path: p.path, title: p.title }))
})
const near = computed(() => is404.value ? nearest(path.value, known.value ?? []) : [])
</script>

<template>
  <ErrorWatch :code :path :near :places="PLACES" />
</template>
