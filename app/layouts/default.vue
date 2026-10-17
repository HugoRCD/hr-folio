<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
const isArticle = computed(() => route.path.startsWith('/writing/'))
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <SearchCommand />

    <!-- the desk: the paper lies on it, and its corner can be lifted to see the drawing underneath -->
    <div class="desk relative">
      <div class="paper relative z-[1] min-h-dvh bg-default">
        <Construction />

        <div class="sheet relative z-10 flex min-h-dvh flex-col py-10 sm:py-14">
          <Letterhead />

          <main class="measure flex-1">
            <slot />
          </main>

          <!-- the close of the letter -->
          <section v-if="isHome || isArticle" class="measure mt-20 lg:mt-24" aria-label="Signature">
            <SignOff />
          </section>

          <!-- the colophon: how it is set, and the few controls the sheet has -->
          <footer class="measure mt-16 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.04em] text-muted/45">
            <span>&copy; {{ new Date().getFullYear() }}</span>
            <span class="hidden text-muted/30 lg:inline">⌘K</span>
            <div class="in-note flex items-center justify-end gap-4 lg:top-1/2 lg:-translate-y-1/2">
              <DetailControl />
              <ThemeSelector />
            </div>
          </footer>
        </div>
      </div>

      <!-- after the paper in the document, so the page's own queries always find the page first;
           below it in the stacking -->
      <PagePeel />
    </div>
  </UApp>
</template>
