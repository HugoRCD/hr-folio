<script setup lang="ts">
const password = useState('password')
const loading = ref(false)
const isAuthorized = useState('authorized')

const { data: notes, error, execute } = await useAsyncData('notes', () => queryCollection('notes').all(), {
  immediate: false
})

if (!notes.value || !error.value) createError({ statusCode: 404 })

const { data, refresh } = useFetch('/api/verify', {
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
      await execute()
      isAuthorized.value = true
      console.log('notes', notes.value)
      console.log('error', error.value)
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
      <span v-if="!isAuthorized" class="font-newsreader text-lg italic">
        In order to see all my hidden notes, you will need first to enter the password.
      </span>
      <form v-if="!isAuthorized" class="flex gap-4" @submit.prevent="verifyPassword">
        <input v-model="password" type="password" placeholder="Password" class="input">
        <MButton class="flex items-center cursor-pointer justify-center gap-2 bg-accent hover:bg-accent/90 px-2 text-white" type="submit" rounded="none" label="Verify" :loading />
      </form>
      <div v-if="true" class="mt-6 flex flex-col gap-8">
        <NuxtLink
          v-for="(post, index) in notes"
          :key="post.title"
          :to="post.path"
          class="group relative max-w-prose"
          data-animate
          :aria-label="`Read ${post.title}`"
          :style="{ '--stagger': index }"
        >
          <h3 class="text-2xl italic decoration-accent group-hover:underline">
            {{ post.title }}
          </h3>
        </NuxtLink>
      </div>
    </div>
  </SectionItem>
</template>
