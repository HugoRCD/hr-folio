<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  email: z.string().email('Invalid email'),
  message: z.string().min(2, 'Too short'),
  name: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  message: undefined,
  name: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!event.data.email || !event.data.message) {
    toast.error('Please fill in all required fields.')
    return
  }
  try {
    await $fetch('/api/send', {
      method: 'POST',
      body: {
        email: event.data.email,
        message: event.data.message,
        name: event.data.name
      }
    })
    toast.success('Your message has been sent!')
  } catch (_) {
    toast.error('An error occurred while sending your message.')
  }
}
</script>

<template>
  <UForm
    :schema
    :state
    class="mt-6 flex flex-col gap-4"
    @submit.prevent="onSubmit"
    @keydown.enter.prevent="onSubmit"
  >
    <UFormField name="name">
      <UInput v-model="state.name" placeholder="Name" class="w-full" />
    </UFormField>
    <UFormField name="email">
      <UInput v-model="state.email" type="email" placeholder="Email" class="w-full" />
    </UFormField>
    <UFormField name="message">
      <UTextarea
        v-model="state.message"
        autoresize
        placeholder="Message"
        :rows="4"
        class="w-full"
      />
    </UFormField>
    <UButton
      type="submit"
      label="Send"
      class="text-white"
      loading-auto
      block
    />
  </UForm>
</template>
