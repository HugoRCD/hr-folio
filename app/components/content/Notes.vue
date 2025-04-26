<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  password: z.string().min(2, 'Too short')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  password: undefined
})

const isAuthorized = useState<boolean>('authorized', () => false)

const { data: notes, error, execute } = await useAsyncData('notes', () =>
  queryCollection('content')
    .where('path', 'LIKE', '%/notes/%')
    .order('date', 'DESC').all(), {
  immediate: isAuthorized.value
})
if (!notes.value || !error.value) createError({ statusCode: 404 })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/verify', {
      method: 'POST',
      body: {
        password: event.data.password
      },
    })
    await execute()

    isAuthorized.value = true
    toast.success('Welcome to my hidden notes!')
  } catch (error) {
    toast.error('Invalid password')
  }
  state.password = undefined
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <span v-if="!isAuthorized" class="font-serif text-lg font-light italic text-muted">
      You've stumbled upon my private notes section. If you know me, you might figure out the password.
      If not, well... these thoughts are probably not meant for you anyway. But hey, feel free to try.
    </span>
    <UForm v-if="!isAuthorized" :schema :state class="flex items-start gap-4" @submit.prevent="onSubmit">
      <UFormField name="password">
        <UInput v-model="state.password" autocomplete="false" type="password" placeholder="Password" />
      </UFormField>
      <UButton class="rounded-none text-white" type="submit" label="Verify" loading-auto />
    </UForm>
    <List v-if="isAuthorized && notes" :posts="notes" />
  </div>
</template>
