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
// an address with a broken escape (/%E0%A4%A) can't be decoded: it is shown as it was typed
const path = computed(() => {
  try {
    return decodeURI(route.path)
  } catch {
    return route.path
  }
})

useHead({
  title: () => is404.value ? 'Page not found' : 'Something went wrong',
  meta: [{ name: 'robots', content: 'noindex' }],
})

// where else to go: the sheet's own pages
const PLACES = [
  { path: '/', title: 'Home' },
  { path: '/works', title: 'Works' },
  { path: '/writing', title: 'Writing' },
]

// Only a missing page needs the articles, to find the one it was probably meant to be; and the page
// doesn't wait long for them.
const requestFetch = useRequestFetch()
const { data: known } = await useAsyncData('error-known-pages', async () => {
  if (!is404.value) return []
  const writing = await requestFetch<Array<{ path: string, title: string }>>('/api/folio/writing', { timeout: 1500 }).catch(() => [])
  return [...writing, ...PLACES].map(p => ({ path: p.path, title: p.title }))
}, { watch: [is404] })
const near = computed(() => is404.value ? nearest(path.value, known.value ?? []) : [])
</script>

<template>
  <ErrorWatch :code :path :near :places="PLACES" />
</template>
