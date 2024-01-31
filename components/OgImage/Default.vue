<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'title',
})
</script>

<template>
  <div class="flex size-full items-start justify-start border-[12px] border-solid border-blue-500 bg-gray-50">
    <div class="flex h-full items-start justify-start">
      <div class="flex size-full flex-col justify-between">
        <h1 class="p-20 text-left text-[80px] font-black">
          {{ title }}
        </h1>
        <p class="mb-0 px-20 pb-10 text-2xl font-bold">
          mycoolsite.com
        </p>
      </div>
    </div>
  </div>
</template>
