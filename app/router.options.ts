import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'

// Nuxt's own scrolling, with one change. On the page's first load it scrolled to the top whenever
// the router had not saved a position itself, after the browser had already put the reader back
// where they were: refreshing at the foot of an article sent you to its head. On the first load
// the place a reload comes back to is set before the app starts (modules/keep-place), and left
// alone here; a #hash still wins.
const hashTop = (selector: string) => {
  try {
    const el = document.querySelector(selector)
    if (el) return (Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
  } catch {
    // not a selector: no offset
  }
  return 0
}

export default {
  scrollBehavior(to, from, savedPosition) {
    if (to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')) {
      if (from.hash && !to.hash) return savedPosition ?? { left: 0, top: 0 }
      if (to.hash) return { el: to.hash, top: hashTop(to.hash) }
      return false
    }
    if (from === START_LOCATION) {
      if (to.hash) return { el: to.hash, top: hashTop(to.hash), behavior: 'instant' }
      return savedPosition ?? false
    }
    // another page: once it has loaded, back where it was (history) or at its top
    const nuxtApp = useNuxtApp()
    const router = useRouter()
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        const go = () => requestAnimationFrame(() => {
          if (router.currentRoute.value.fullPath !== to.fullPath) return resolve(false)
          resolve(savedPosition ?? (to.hash ? { el: to.hash, top: hashTop(to.hash) } : { left: 0, top: 0 }))
        })
        const transition = (nuxtApp as unknown as { '~transitionPromise'?: Promise<void> })['~transitionPromise']
        if (transition) transition.then(go)
        else go()
      })
    })
  },
} satisfies RouterConfig
