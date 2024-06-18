<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="relative">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    <main class="bg-light dark:bg-dark flex min-h-screen flex-col items-center justify-center p-3 sm:p-12">
      <LayoutLetterCard>
        <LayoutNavbar />
        <slot />
        <CopyLink v-if="route.path.includes('/writing/')" />
        <LayoutFooter />
      </LayoutLetterCard>
      <OssInfo />
    </main>
    <MToasts
      position="top-center"
      close-button
      :toast-options="{
        style: {
          backgroundColor: 'var(--primary-color)'
        }
      }"
    />
  </div>
</template>

<style scoped>

</style>
