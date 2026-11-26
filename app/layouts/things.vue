<script setup lang="ts">
import { monogramPath, monogramViewBox } from '~/utils/signature'

useHead({
  htmlAttrs: { class: 'things-studio' },
  meta: [{ name: 'theme-color', content: '#FAF9F7' }],
})
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <SearchCommand />

    <div class="desk relative">
      <div class="paper relative z-[1] min-h-dvh">
        <div class="studio relative z-10 min-h-dvh">
          <header class="studio-head">
            <NuxtLink to="/" aria-label="Hugo Richard, home" class="mark">
              <svg :viewBox="monogramViewBox" class="h-10 w-auto text-[#901112]" aria-hidden="true">
                <path :d="monogramPath" fill="currentColor" />
              </svg>
            </NuxtLink>
            <NuxtLink to="/" class="index">
              &larr; Index
            </NuxtLink>
          </header>

          <main>
            <slot />
          </main>
        </div>
      </div>

      <PagePeel />
    </div>
  </UApp>
</template>

<style scoped>
.studio {
  width: 100%;
  min-height: 100dvh;
}
.studio-head {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 22px 28px 0;
  pointer-events: none;
}
.studio-head :deep(a) {
  pointer-events: auto;
}
.mark {
  display: flex;
  border: 0;
  box-shadow: none;
  color: inherit;
}
.index {
  margin-top: 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
.index:hover {
  color: var(--ui-text-highlighted);
}
</style>
