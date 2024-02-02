<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  mode: {
    type: String as PropType<"home" | "writing">,
    default: "writing",
  },
})

const { data, error } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);

if (!data.value || !error.value) createError({ statusCode: 404 });
props.mode === "home" ? data.value!.slice(0, 3) : data;
</script>

<template>
  <div class="flex w-fit flex-col gap-3">
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
    <NuxtLink
      v-if="mode === 'home'"
      to="/writing"
      class="link mt-2 font-[400]"
      aria-label="See more, go to all articles, writing, etc ..."
    >
      <span class="sr-only">More writing</span>
      See more
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
