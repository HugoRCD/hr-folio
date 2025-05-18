<script lang="ts" setup>
import { useChat } from '@ai-sdk/vue'

const title = 'AI Chat'
const description = 'Get answer to your questions'

const { input, messages, handleSubmit, reload, stop, status, error } = useChat()
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
      :messages
      :status
      :ui="{
        root: 'flex-none [&>article]:last-of-type:min-h-auto',
        indicator: 'h-auto *:size-auto *:bg-transparent'
      }"
    >
      <template #content="{ message }">
        <MDC :value="message.content" :cache-key="message.id" unwrap="p" />
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
