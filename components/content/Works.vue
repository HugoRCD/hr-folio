<script setup lang="ts">
type Work = {
  name: string;
  logo: string;
  image: string;
  description: string;
  link: string | 'Soon';
  tags: string[];
  release: string;
};

const { data: works } = await useAsyncData('works', () =>
  queryContent('works')
    .where({ _type: 'json' })
    .sort({ date: -1 })
    .find()
)
</script>

<template>
  <div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
    <NuxtLink
      v-for="(work, index) in works"
      :key="work.name"
      :to="work.link"
      class="group relative"
      data-animate
      :aria-label="`Open ${work.name}`"
      :style="{ '--stagger': index }"
    >
      <div class="absolute right-0 top-0 font-newsreader text-5xl italic opacity-[9%] sm:text-3xl">
        {{ work.release }}
      </div>
      <h3 class="text-3xl font-medium italic decoration-accent group-hover:underline">
        {{ work.name }}<span class="text-accent">.</span>
      </h3>
      <p>
        {{ work.description }}
      </p>
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
