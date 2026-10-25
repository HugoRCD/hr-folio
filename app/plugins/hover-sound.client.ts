// The sound button pushes the chime's slide under the page (see useRepeater). Turned on, it strikes
// its two notes, the same every time, then again on each quarter hour while the page is open and in
// view, like a clock in the room; and every link taps softly as the pointer comes onto it. Off by
// default; turned off, it stops mid-strike.
const QUARTER = 15 * 60 * 1000

export default defineNuxtPlugin(() => {
  const { enabled } = useHoverSound()
  const repeater = useRepeater()
  let next: ReturnType<typeof setTimeout> | undefined

  function quarters() {
    clearTimeout(next)
    if (!enabled.value) return
    // to the next quarter on the clock: :00, :15, :30, :45
    next = setTimeout(() => {
      if (enabled.value && !document.hidden) repeater.chime(false, true)
      quarters()
    }, QUARTER - (Date.now() % QUARTER) + 50)
  }

  // sync: the chime starts inside the click itself, which is what lets the browser play it
  watch(enabled, (on, was) => {
    if (on && was === false) repeater.chime()
    else if (!on) repeater.stop()
    quarters()
  }, { flush: 'sync' })

  // the tap on a link, once as the pointer comes onto it, not again while it moves inside it
  const tap = new Audio('/audio/tap.wav')
  tap.preload = 'auto'
  const onPointerOver = (event: PointerEvent) => {
    if (!enabled.value) return
    const anchor = (event.target as Element | null)?.closest('a')
    if (!anchor || anchor.hasAttribute('data-no-sound')) return
    const from = event.relatedTarget as Node | null
    if (from && anchor.contains(from)) return
    tap.currentTime = 0
    tap.play().catch(() => {})
  }
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  if (import.meta.hot) import.meta.hot.dispose(() => document.removeEventListener('pointerover', onPointerOver))

  // left on from a last visit: the browser stays silent until the first click or key press here
  if (enabled.value) {
    quarters()
    const start = () => enabled.value && repeater.unlock()
    window.addEventListener('pointerdown', start, { once: true, capture: true })
    window.addEventListener('keydown', start, { once: true, capture: true })
  }
})
