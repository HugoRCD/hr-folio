const VT_MAX = 16
const HERO = 'thing-hero'

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isCoarseViewport() {
  return window.matchMedia('(max-width: 767px)').matches
    || window.matchMedia('(hover: none)').matches
}

function canTransition() {
  return typeof document.startViewTransition === 'function' && !reducedMotion()
}

function visibleMedia() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-thing-media]')]
  const hits: HTMLElement[] = []
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.bottom <= 0 || r.top >= window.innerHeight || r.width <= 0 || r.height <= 0) continue
    hits.push(el)
    if (hits.length >= VT_MAX) break
  }
  return hits
}

function paintVisible() {
  const painted: HTMLElement[] = []
  for (const el of visibleMedia()) {
    const slug = el.closest<HTMLElement>('[data-thing]')?.dataset.thing
    if (!slug) continue
    el.style.viewTransitionName = `thing-${slug}`
    painted.push(el)
  }
  return painted
}

function clearPainted(els: Array<HTMLElement | null | undefined>) {
  for (const el of els) {
    if (el) el.style.viewTransitionName = ''
  }
}

function mediaFor(slug: string) {
  return document.querySelector<HTMLElement>(`[data-thing="${slug}"] [data-thing-media]`)
}

export function useThingTransition() {
  async function run(update: () => void | Promise<void>) {
    await update()
    await nextTick()
  }

  async function startRoot(update: () => void | Promise<void>) {
    const transition = document.startViewTransition(async () => {
      await update()
      await nextTick()
    })
    try {
      await transition.finished
    } catch {
      // aborted or skipped
    }
  }

  async function withNamedGrid(update: () => void | Promise<void>) {
    const oldEls = paintVisible()
    const newEls: HTMLElement[] = []
    const transition = document.startViewTransition(async () => {
      await update()
      await nextTick()
      newEls.push(...paintVisible())
    })
    try {
      await transition.finished
    } catch {
      // aborted or skipped
    } finally {
      clearPainted([...oldEls, ...newEls])
    }
  }

  async function withFilterTransition(update: () => void | Promise<void>) {
    if (!import.meta.client || !canTransition() || isCoarseViewport()) {
      await run(update)
      return
    }
    await withNamedGrid(update)
  }

  async function withViewSwitch(update: () => void | Promise<void>) {
    if (!import.meta.client || !canTransition()) {
      await run(update)
      return
    }
    if (isCoarseViewport()) {
      await startRoot(update)
      return
    }
    await withNamedGrid(update)
  }

  async function withHeroTransition(slug: string, update: () => void | Promise<void>) {
    if (!import.meta.client || !canTransition()) {
      await run(update)
      return
    }
    const opening = !document.querySelector('[data-thing-hero]')
    const painted: HTMLElement[] = []
    if (opening) {
      const media = mediaFor(slug)
      if (media) {
        media.style.viewTransitionName = HERO
        painted.push(media)
      }
    } else {
      const hero = document.querySelector<HTMLElement>('[data-thing-hero]')
      if (hero) {
        hero.style.viewTransitionName = HERO
        painted.push(hero)
      }
    }
    const transition = document.startViewTransition(async () => {
      await update()
      await nextTick()
      if (opening) {
        clearPainted(painted)
        const hero = document.querySelector<HTMLElement>('[data-thing-hero]')
        if (hero) {
          hero.style.viewTransitionName = HERO
          painted.push(hero)
        }
      } else {
        const media = mediaFor(slug)
        if (media) {
          media.style.viewTransitionName = HERO
          painted.push(media)
        }
      }
    })
    try {
      await transition.finished
    } catch {
      // aborted or skipped
    } finally {
      clearPainted(painted)
    }
  }

  return { withFilterTransition, withViewSwitch, withHeroTransition }
}
