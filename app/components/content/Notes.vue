<script setup lang="ts">
const password = ref('')
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
  body: {
    password
  },
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
  <div class="flex flex-col gap-8">
    <span v-if="!isAuthorized" class="font-newsreader text-lg font-light italic">
      You've stumbled upon my private notes section. If you know me, you might figure out the password.
      If not, well... these thoughts are probably not meant for you anyway. But hey, feel free to try.
    </span>
    <form v-if="!isAuthorized" class="flex gap-4" @submit.prevent="verifyPassword">
      <input v-model="password" type="password" placeholder="Password" class="input">
      <MButton class="flex items-center cursor-pointer justify-center gap-2 bg-accent hover:bg-accent/90 px-2 text-white" type="submit" rounded="none" label="Verify" :loading />
    </form>
    <List v-if="isAuthorized && notes" :data="notes" />
  </div>
</template>
