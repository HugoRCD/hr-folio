<script setup lang="ts">
const { data } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="italic font-newsreader text-xl">
      Writing
    </h2>
    <div class="flex flex-col gap-2 w-fit">
      <NuxtLink
        v-for="post in data"
        :key="post.title"
        :to="post._path"
        class="link"
      >
        {{ post.title }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
