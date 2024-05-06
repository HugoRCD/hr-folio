<script setup lang="ts">
const { path } = useRoute()
const password = useState('password')
const loading = ref(false)
const isAuthorized = useState('authorized')

const { data: notes, error } = await useAsyncData(path, () =>
  queryContent(path).find()
)

if (!notes.value || !error.value) createError({ statusCode: 404 })

const { data, refresh, status } = useFetch('/api/verify', {
  method: 'POST',
  body: { password },
  watch: false,
  immediate: false
})

async function verifyPassword() {
  loading.value = true
  try {
    await refresh()
    if (data.value?.status === 200) {
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
  <div
    class="mt-6 flex flex-col gap-8"
  >
    <span v-if="!isAuthorized" class="font-newsreader text-lg italic opacity-40">
      In order to see all my hidden notes, you will need first to enter the password.
    </span>
    <form v-if="!isAuthorized" class="flex gap-4" @submit.prevent="verifyPassword">
      <input v-model="password" type="password" placeholder="Password" class="resize-none border-b-2 border-main bg-primary px-2 py-1 caret-accent focus:outline-none">
      <button class="flex items-center justify-center gap-2 bg-accent px-2 text-white" type="submit">
        <span v-if="status === 'pending'" class="i-lucide-loader size-4 animate-spin" />
        Verify
      </button>
    </form>
    <div v-if="isAuthorized" class="mt-6 flex flex-col gap-8">
      <NuxtLink
        v-for="(post, index) in notes"
        :key="post.title"
        :to="post._path"
        class="group relative max-w-prose"
        data-animate
        :aria-label="`Read ${post.title}`"
        :style="{ '--stagger': index }"
      >
        <h3 class="text-3xl font-medium italic decoration-accent group-hover:underline">
          {{ post.title }}
        </h3>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
