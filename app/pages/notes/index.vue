<script setup lang="ts">
const password = useState('password')
const loading = ref(false)
const isAuthorized = useState<boolean>('authorized', () => false)

const { data: notes, error, execute } = await useAsyncData('notes', () =>
  queryCollection('content')
    .where('path', 'LIKE', '%/notes/%')
    .order('date', 'DESC').all(), {
  immediate: isAuthorized.value
})

if (!notes.value || !error.value) createError({ statusCode: 404 })

const { data, refresh } = useFetch('/api/verify', {
  method: 'POST',
  body: { password },
  watch: false,
  immediate: false
})

defineOgImageComponent('WritingPost', {
  title: 'Notes',
  description: 'Some thoughts are meant to be discovered, not shown.',
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

useSeoMeta({
  ogSiteName: 'Hugo Richard',
  ogType: 'article',
  description: 'Some thoughts are meant to be discovered, not shown.',
})

useHead({
  title: 'Notes',
  titleTemplate: 'Notes | Hugo Richard',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'charset', content: 'utf-8' },
    { name: 'robots', content: 'index, follow' },
    { name: 'color-scheme', content: 'light dark' }
  ],
})

async function verifyPassword() {
  loading.value = true
  try {
    await refresh()

    if (data.value?.status === 200) {
      await execute()
      isAuthorized.value = true
      toast.success('Welcome to my hidden notes!')
    } else {
      toast.error('Invalid password')
      password.value = ''
    }
  } catch (error) {
    toast.error('Invalid password')
  }
  loading.value = false
}
</script>

<template>
  <SectionItem class="mb-4 flex flex-1 flex-col justify-center gap-8 sm:gap-12" title="Notes" :number="1">
    <div class="flex flex-col gap-8">
      <span v-if="!isAuthorized" class="font-newsreader text-lg font-light italic">
        You've stumbled upon my private notes section. If you know me, you might figure out the password.
        If not, well... these thoughts are probably not meant for you anyway. But hey, feel free to try.
      </span>
      <form v-if="!isAuthorized" class="flex gap-4" @submit.prevent="verifyPassword">
        <input v-model="password" type="password" placeholder="Password" class="input">
        <MButton class="flex items-center cursor-pointer justify-center gap-2 bg-accent hover:bg-accent/90 px-2 text-white" type="submit" rounded="none" label="Verify" :loading />
      </form>
      <div v-if="isAuthorized" class="mt-6 flex flex-col gap-8">
        <NuxtLink
          v-for="(post, index) in notes"
          :key="post.title"
          :to="`${post.path}`"
          class="group relative max-w-prose"
          data-animate
          :aria-label="`Read ${post.title}`"
          :style="{ '--stagger': index }"
        >
          <div class="font-newsreader text-lg italic opacity-75">
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
      </div>
    </div>
  </SectionItem>
</template>
