<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  mode: {
    type: String as PropType<"home" | "writing">,
    default: "writing",
  },
})

const email = ref("");

const { status, error: subscribeError, refresh } = useFetch("/api/subscribe", {
  method: "POST",
  body: { email },
  watch: false,
  immediate: false
})

async function submit() {
  await refresh();
  if (!error.value) {
    email.value = "";
    toast.success("Your message has been sent!");
  } else {
    toast.error("An error occurred while sending your message.");
  }
}

const { data, error } = await useAsyncData("feed", () =>
    queryContent("/writing/").sort({ date: -1 }).find()
);

if (!data.value || !error.value) createError({ statusCode: 404 });
props.mode === "home" ? data.value!.slice(0, 3) : data;
</script>

<template>
  <div
    class="flex flex-col gap-3"
    :class="mode === 'home' ? 'gap-3' : 'gap-4 mt-4'"
  >
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post._path"
      class="link"
      :class="mode === 'writing' ? 'text-xl' : ''"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      {{ post.title }}<span
        v-if="mode === 'writing'"
        class="i-lucide-arrow-up-right"
      />
    </NuxtLink>
    <NuxtLink
      v-if="mode === 'home'"
      to="/writing"
      class="link mt-2 font-newsreader font-medium"
      aria-label="See more, go to all articles, writing, etc ..."
    >
      <span class="sr-only">More writing</span>
      More
    </NuxtLink>
    <div
      v-if="mode === 'writing'"
      class="mt-10 flex flex-col gap-1"
    >
      <p class="mb-1 !text-sm">
        Subscribe to get notified about new articles
      </p>
      <form
        class="flex flex-col gap-4 sm:flex-row"
        @submit.prevent="submit"
        @keydown.enter.prevent="submit"
      >
        <input
          v-model="email"
          type="email"
          placeholder="Email*"
          class="input w-64"
          required
        >
        <button
          type="submit"
          class="w-fit bg-accent px-2 py-1 text-white sm:py-0"
        >
          <span class="flex items-center justify-center gap-2">
            <span>Subscribe</span>
            <i
              v-if="status === 'pending'"
              class="i-lucide-loader size-4 animate-spin text-inverted"
            />
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>
