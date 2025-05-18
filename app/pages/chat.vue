<script lang="ts" setup>
import { useChat } from '@ai-sdk/vue'

const { input, handleSubmit, reload, stop, status, error } = useChat()

const messages = ref([
  {
    id: '6045235a-a435-46b8-989d-2df38ca2eb47',
    role: 'user',
    content: 'Hello, how are you?'
  },
  {
    id: '7a92b3c1-d5f8-4e76-b8a9-3c1e5fb2e0d8',
    role: 'assistant',
    content: 'I am doing well, thank you for asking! How can I assist you today?'
  },
  {
    id: '9c84d6a7-8b23-4f12-a1d5-e7f3b9c05e2a',
    role: 'user',
    content: 'What is the current weather in Tokyo?'
  },
])
</script>

<template>
  <SectionItem title="AI Chat" :number="1" size="w-full" class="mt-10">
    <UChatMessages :messages :status>
      <template #content="{ message }">
        <MDC :value="message.content" :cache-key="message.id" unwrap="p" />
      </template>
    </UChatMessages>

    <UChatPrompt v-model="input" :error @submit="handleSubmit">
      <UChatPromptSubmit :status @stop="stop" @reload="reload" />
    </UChatPrompt>
  </SectionItem>
</template>
