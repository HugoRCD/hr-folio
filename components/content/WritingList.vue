<script setup lang="ts">
const { data } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="font-newsreader text-xl italic">
      Writing
    </h2>
    <div class="flex w-fit flex-col gap-2">
      <NuxtLink
        v-for="(post, index) in data"
        :key="post.title"
        :to="post._path"
        class="link"
        data-animate
        :aria-label="`Read ${post.title}`"
        :style="{ '--stagger': index }"
      >
        {{ post.title }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
