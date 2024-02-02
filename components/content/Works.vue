<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  mode: {
    type: String as PropType<"home" | "works">,
    default: "works",
  },
})

const { data, error } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);

if (!data.value || !error.value) createError({ statusCode: 404 });
props.mode === "home" ? data.value!.slice(0, 3) : data;
</script>

<template>
  <div
    class="flex flex-col gap-2"
    data-animate
    style="--stagger: 2"
  >
    <h2 class="font-newsreader text-xl italic">
      Works
    </h2>
    <div class="flex w-fit flex-col gap-3">
      <NuxtLink
        v-for="(post, index) in data"
        :key="post.title"
        :to="post._path"
        class="link"
        data-animate
        :aria-label="`Open ${post.title}`"
        :style="{ '--stagger': index }"
      >
        {{ post.title }}
      </NuxtLink>
      <NuxtLink
        v-if="mode === 'home'"
        to="/works"
        class="link mt-2 font-[400]"
        aria-label="See more, go to all my works, projects"
      >
        <span class="sr-only">More projects</span>
        See more projects
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
