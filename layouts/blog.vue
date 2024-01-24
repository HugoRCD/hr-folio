<template>
  <div class="flex flex-col flex-1 justify-center items-center gap-3 p-6 sm:p-12">
    <LetterCard>
      <div class="flex w-full justify-between">
        <NuxtLink
          to="/"
          class="cursor-pointer group"
        >
          <span class="font-newsreader italic hover:text-accent hover:underline">
            go back
          </span>
        </NuxtLink>
        <ThemeSelector />
      </div>
      <NuxtPage class="flex-1 flex flex-col justify-center mt-8" />
      <div class="flex justify-end">
        <Signature class="flex justify-end h-16 sm:h-20 fill-black dark:fill-white" />
      </div>
    </LetterCard>
  </div>
</template>
<script setup lang="ts">
import LetterCard from "~/components/LetterCard.vue";
</script>
