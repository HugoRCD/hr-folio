<script setup lang="ts">
const { category } = defineProps<{
  category?: string
}>()

const { data: works, error } = await useAsyncData(`works-${category}`, () => {
  return queryCollection('works')
    .where('category', '=', category)
    .order('date', 'DESC')
    .all()
})

if (!works.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div class="mt-10 grid grid-cols-1 font-normal gap-8 sm:grid-cols-2">
    <NuxtLink
      v-for="(work, index) in works"
      :key="work.name"
      :to="work.link"
      target="_blank"
      class="group relative"
      data-animate
      :aria-label="`Open ${work.name}`"
      :style="{ '--stagger': index }"
    >
      <div class="absolute right-0 top-0 font-newsreader text-5xl italic opacity-15 sm:text-3xl">
        {{ work.release }}
      </div>
      <h3 class="font-newsreader italic text-secondary text-2xl decoration-accent group-hover:underline">
        {{ work.name }}<span class="text-accent">.</span>
      </h3>
      <p class="text-tertiary text-sm font-extralight sm:text-base">
        {{ work.description }}
      </p>
    </NuxtLink>
  </div>
</template>


