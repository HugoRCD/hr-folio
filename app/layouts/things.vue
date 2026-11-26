<script setup lang="ts">
import { monogramPath, monogramViewBox } from '~/utils/signature'

const STORY = '/writing/how-i-redrew-my-portfolio'

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
        <div class="studio relative z-10 flex min-h-dvh flex-col py-10 sm:py-14">
          <header class="studio-head">
            <NuxtLink to="/" aria-label="Hugo Richard, home" class="mark">
              <svg :viewBox="monogramViewBox" class="h-11 w-auto text-[#901112]" aria-hidden="true">
                <path :d="monogramPath" fill="currentColor" />
              </svg>
            </NuxtLink>
            <NuxtLink to="/" class="index">
              &larr; Index
            </NuxtLink>
          </header>

          <main class="flex-1">
            <slot />
          </main>

          <footer class="studio-foot mt-16 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.04em] text-muted/45">
            <span class="flex items-center gap-2">
              &copy; {{ new Date().getFullYear() }}
              <span aria-hidden="true">&middot;</span>
              <NuxtLink :to="STORY" class="transition-colors hover:text-highlighted">
                How this site was drawn
              </NuxtLink>
            </span>
          </footer>
        </div>
      </div>

      <PagePeel />
    </div>
  </UApp>
</template>

<style scoped>
.studio {
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: 24px;
}
@media (min-width: 768px) {
  .studio {
    padding-inline: 40px;
  }
}

.studio-head {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 36px;
}
.mark {
  display: flex;
  border: 0;
  box-shadow: none;
  color: inherit;
}
.index {
  margin-top: 14px;
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
