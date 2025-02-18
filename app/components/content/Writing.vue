<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  email: z.string().email('Invalid email'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    /*await $fetch('/api/subscribe', {
      method: 'POST',
      body: {
        email: event.data.email
      }
    })*/
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Your message has been sent!')
  } catch (_) {
    toast.error('An error occurred while sending your message.')
  }
}

const { data: posts, error } = await useAsyncData('writings', () => queryCollection('writing').order('date', 'DESC').all())

if (!posts.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div class="flex font-normal flex-col gap-8">
    <List v-if="posts" :posts />
    <div class="mt-10 flex flex-col gap-1">
      <UForm :state :schema class="flex flex-col gap-4 sm:flex-row" @submit.prevent="onSubmit" @keydown.enter.prevent="onSubmit">
        <UFormField
          name="email"
          required
          description="Subscribe to get notified about new articles"
        >
          <UInput
            v-model="state.email"
            type="email"
            variant="none"
            placeholder="Email*"
            class="input w-64"
          />
          <UButton
            type="submit"
            class="ml-4 rounded-none text-white"
            loading-auto
            label="Subscribe"
          />
        </UFormField>
      </UForm>
    </div>
  </div>
</template>
