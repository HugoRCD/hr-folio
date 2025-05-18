<script lang="ts" setup>
import { useChat } from '@ai-sdk/vue'

const title = 'AI Chat'
const description = `
Have questions about me, my projects, or my blog posts? Ask my AI assistant! It has access to all the content on this portfolio.
`
/* 
const status = ref('submitted')

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
]) */

const { input, messages, statuts, handleSubmit, reload, stop, error } = useChat()
</script>

<template>
  <FolioMeta
    :page="{ 
      title,
      description
    }"
  />
  <SectionItem
    :title
    :description
    :number="1"
    size="w-full"
    class="mt-10"
  >
    <UChatMessages
      :class="messages.length > 0 ? 'mt-10' : ''" 
      :messages
      :assistant="{
        ui: { container: 'pb-4 group-last:pb-0' }
      }"
      :user="{
        ui: { container: 'pb-4' }
      }"
      :status
      :ui="{
        root: 'flex-none [&>article]:last-of-type:min-h-auto',
        indicator: 'h-auto *:size-auto *:bg-transparent [&>*:nth-child(1)]:animate-none [&>*:nth-child(2)]:animate-none [&>*:nth-child(3)]:animate-none',
      }"
    >
      <template #content="{ message }">
        <MDCCached
          v-if="message.toolInvocations?.[0]?.state === 'result'"
          :value="message.toolInvocations?.[0]?.result"
          :cache-key="message.id"
          unwrap="p"
          :parser-options="{ highlight: false }"
        />
        <MDCCached
          v-else-if="message.content.length > 0"
          :value="message.content"
          :cache-key="message.id"
          unwrap="p"
          :parser-options="{ highlight: false }"
        />
        <TextBloom v-else label="Thinking..." />
      </template>
      <template #indicator>
        <TextBloom label="Thinking..." />
      </template>
    </UChatMessages>

    <UChatPrompt
      v-model="input"
      :error
      :class="messages.length === 0 ? 'mt-10' : ''" 
      @submit="handleSubmit"
    >
      <UChatPromptSubmit
        :status
        @stop="stop"
        @reload="reload"
      />
    </UChatPrompt>
  </SectionItem>
</template>
