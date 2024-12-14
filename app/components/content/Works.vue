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

const { data: works, error } = await useAsyncData('works', () => queryCollection('works').order('date', 'DESC').all())
if (!works.value || !error.value) createError({ statusCode: 404 })
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
      <h3 class="text-2xl italic decoration-accent group-hover:underline">
        {{ work.name }}<span class="text-accent">.</span>
      </h3>
      <p>
        {{ work.description }}
      </p>
    </NuxtLink>
  </div>
</template>


