<script setup lang="ts">
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
</style>
