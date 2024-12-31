<script setup lang="ts">
useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

useSeoMeta({
  ogSiteName: 'Hugo Richard',
  ogType: 'article',
  description: 'Some writings about all the things I\'ve learned in my coding journey, and some other things.',
})

useHead({
  title: 'Writing',
  titleTemplate: 'Writing | Hugo Richard',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'charset', content: 'utf-8' },
    { name: 'robots', content: 'index, follow' },
    { name: 'color-scheme', content: 'light dark' }
  ],
})

defineOgImageComponent('WritingPost', {
  title: 'Writing',
  description: 'Some writings about all the things I\'ve learned in my coding journey, and some other things.',
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

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
  <SectionItem class="mb-4 mt-8 flex flex-1 flex-col justify-center gap-8 sm:gap-12" title="Writing" :number="1">
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
  </SectionItem>
</template>
