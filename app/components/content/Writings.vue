<script setup lang="ts">
const email = ref('')

const { status, error: subscribeError, refresh } = useFetch('/api/subscribe', {
  method: 'POST',
  body: { email },
  watch: false,
  immediate: false
})

async function submit() {
  await refresh()
  if (!error.value) {
    email.value = ''
    toast.success('Your message has been sent!')
  } else {
    toast.error('An error occurred while sending your message.')
  }
}

const { data, error } = await useAsyncData('feed', () =>
  queryContent('/writing/').find()
)

if (!data.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div
    class="mt-6 flex flex-col gap-8"
  >
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post._path"
      class="group relative max-w-prose"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      <div class="font-newsreader text-lg italic opacity-[15%]">
        {{ post.date }}
      </div>
      <h3 class="text-3xl font-medium italic decoration-accent group-hover:underline">
        {{ post.title }}
        <span
          class="i-lucide-arrow-up-right text-lg"
        />
      </h3>
      <p
        class="!text-sm"
      >
        {{ post.description }}
      </p>
    </NuxtLink>
    <div
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
