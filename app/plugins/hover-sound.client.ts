export default defineNuxtPlugin(() => {
  const { enabled } = useHoverSound()

  const audio = new Audio('/audio/tap.wav')
  audio.preload = 'auto'

  const playTap = () => {
    if (!enabled.value)
      return

    try {
      audio.currentTime = 0
      void audio.play()
    } catch {
      // ignore
    }
  }

  const onPointerOver = (event: PointerEvent) => {
    const target = event.target as (Element | null)
    if (!target)
      return

    const anchor = target.closest('a')
    if (!anchor)
      return

    // Optional escape hatch
    if (anchor.hasAttribute('data-no-sound'))
      return

    // Avoid retrigger when moving within the same anchor
    const related = event.relatedTarget as (Node | null)
    if (related && anchor.contains(related))
      return

    playTap()
  }

  document.addEventListener('pointerover', onPointerOver, { passive: true })

  // Cleanup (mostly for HMR / navigation in dev)
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      document.removeEventListener('pointerover', onPointerOver)
    })
  }
})
