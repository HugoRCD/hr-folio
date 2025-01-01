<script setup lang="ts">
const email = ref('')

const { status, refresh } = useFetch('/api/subscribe', {
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

const { data, error } = await useAsyncData('writings', () => queryCollection('writing').order('date', 'DESC').all())

if (!data.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div class="mt-6 flex font-normal flex-col gap-8">
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post.path"
      class="group relative max-w-prose"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      <div class="font-newsreader text-lg italic opacity-35">
        {{ post.date }}
      </div>
      <h3 class="text-2xl font-newsreader font-medium italic decoration-accent group-hover:underline">
        {{ post.title }}
      </h3>
      <p class="text-sm">
        {{ post.description }}
      </p>
    </NuxtLink>
    <div class="mt-10 flex flex-col gap-1">
      <p class="mb-1 !text-sm">
        Subscribe to get notified about new articles
      </p>
      <form class="flex flex-col gap-4 sm:flex-row" @submit.prevent="submit" @keydown.enter.prevent="submit">
        <input
          v-model="email"
          type="email"
          placeholder="Email*"
          class="input w-64"
          required
        >
        <MButton
          type="submit"
          class="w-fit bg-accent hover:bg-accent/90 px-2 py-1 text-white sm:py-0"
          :loading="status === 'pending'"
          label="Subscribe"
          rounded="none"
        />
      </form>
    </div>
  </div>
</template>
