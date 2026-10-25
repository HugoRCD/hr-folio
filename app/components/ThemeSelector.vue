<script setup lang="ts">
const colorMode = useColorMode()
const { enabled: soundEnabled, toggle: toggleSound } = useHoverSound()

// The page follows the sun. The dot sets the other mode by hand; pressed again, it gives the page
// back to the sun. While the sun is in charge the dot wears a hairline ring.
const manual = useState<boolean>('daylight-manual', () => false)
const nextTheme = computed(() => (colorMode.value === 'dark' ? 'light' : 'dark'))
const themeLabel = computed(() => (manual.value ? 'Follow the sun' : `Switch to ${nextTheme.value}`))
const soundLabel = computed(() => (soundEnabled.value ? 'Disable sound' : 'Enable sound'))

const themeButton = useTemplateRef('themeButton')

// the lever under the dot sets the light by hand; it is thrown out of sight, for whoever lifts the
// corner to look
const switchTheme = () => useNuxtApp().$daylight.byHand(manual.value ? null : nextTheme.value)

const triggerTransition = (event?: MouseEvent) => {
  if (!document.startViewTransition) {
    switchTheme()
    return
  }

  let x: number, y: number

  if (event) {
    x = event.clientX
    y = event.clientY
  } else {
    const el = themeButton.value?.$el as HTMLElement | undefined
    if (el) {
      const rect = el.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    } else {
      switchTheme()
      return
    }
  }

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {
    switchTheme()
  })

  // asked for less motion, the new page fades in over the old one instead of opening from the dot
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  transition.ready.then(() => {
    document.documentElement.animate(
      reduced
        ? { opacity: [0, 1] }
        : { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      {
        duration: reduced ? 200 : 600,
        easing: reduced ? 'ease' : 'cubic-bezier(.76,.32,.29,.99)',
        pseudoElement: '::view-transition-new(root)',
      }
    )
  }).catch(() => {})
}
</script>

<template>
  <div class="flex items-center gap-3.5">
    <div class="size-3 flex items-center justify-center" data-mech="by-hand">
      <UTooltip :text="themeLabel">
        <UButton
          ref="themeButton"
          class="bg-inverted size-3 rounded-full transition-shadow duration-500"
          :class="manual ? '' : 'ring-1 ring-offset-2 ring-offset-(--ui-bg) ring-(--ui-text-muted)/60'"
          size="xs"
          variant="link"
          :aria-label="manual ? 'Follow the sun' : `Switch to ${nextTheme} mode`"
          @click="triggerTransition"
        />
      </UTooltip>
    </div>

    <UTooltip :text="soundLabel">
      <UButton
        data-mech="sound"
        class="rounded-full"
        size="xs"
        color="neutral"
        variant="ghost"
        :icon="soundEnabled ? 'i-lucide-volume-2' : 'i-lucide-volume-x'"
        :aria-label="soundLabel"
        @click="toggleSound"
      />
    </UTooltip>
  </div>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  z-index: 9999;
}
::view-transition-old(root) {
  z-index: 1;
}
</style>
