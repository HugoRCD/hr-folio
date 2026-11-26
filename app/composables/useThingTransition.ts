export function useThingTransition() {
  const { reduced } = useThingMotion()

  async function withTransition(update: () => void | Promise<void>) {
    if (!import.meta.client) {
      await update()
      return
    }
    const supported = typeof document.startViewTransition === 'function'
    if (!supported || reduced.value) {
      await update()
      await nextTick()
      return
    }
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

  return { withTransition }
}
