<script setup lang="ts">
const colorMode = useColorMode()
const { enabled: soundEnabled, toggle: toggleSound } = useHoverSound()

const nextTheme = computed(() => (colorMode.value === 'dark' ? 'light' : 'dark'))
const soundLabel = computed(() => (soundEnabled.value ? 'Disable sound' : 'Enable sound'))

const themeButton = useTemplateRef('themeButton')

const switchTheme = () => {
  colorMode.preference = nextTheme.value
}

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

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ],
      },
      {
        duration: 600,
        easing: 'cubic-bezier(.76,.32,.29,.99)',
        pseudoElement: '::view-transition-new(root)',
      }
    )
  })
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="size-3 flex items-center justify-center">
      <UTooltip text="Switch theme">
        <UButton
          ref="themeButton"
          class="bg-inverted size-3 rounded-full"
          size="xs"
          variant="link"
          :aria-label="`Switch to ${nextTheme} mode`"
          @click="triggerTransition"
        />
      </UTooltip>
    </div>

    <UTooltip :text="soundLabel">
      <UButton
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
