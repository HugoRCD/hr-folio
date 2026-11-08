<script setup lang="ts">
import { monogramPath, monogramViewBox } from '~/utils/signature'

// The room the error page is set in (<ErrorFrame>): the monogram and the dateline at the top, as on
// every page, and the scene under them. It is in the page's own light, which follows the sun where
// Hugo is: paper by day, dark at night.
</script>

<template>
  <div class="frame">
    <header class="top">
      <NuxtLink to="/" aria-label="Hugo Richard, home" class="home">
        <svg :viewBox="monogramViewBox" class="h-11 w-auto text-[#901112] dark:text-primary" aria-hidden="true">
          <path :d="monogramPath" fill="currentColor" />
        </svg>
      </NuxtLink>
      <!-- held at its height, so nothing moves when it arrives -->
      <div class="flex min-h-[62px] justify-end">
        <Dateline />
      </div>
    </header>

    <main class="stage">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.frame {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100dvh;
  padding: 40px;
  overflow: hidden;
  background-color: var(--ui-bg);
  color: var(--ui-text);
}
.top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.home svg {
  transition: opacity 0.2s ease;
}
.home:hover svg {
  opacity: 0.75;
}
/* the scene sits in the middle of the window: as much room under it as the header takes above */
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 24px 88px;
  min-width: 0;
}
@media (max-width: 639px) {
  .frame {
    padding: 24px;
  }
  .stage {
    padding-block: 32px 64px;
  }
}
</style>
