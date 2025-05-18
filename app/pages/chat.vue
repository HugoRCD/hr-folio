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
        <MDCCached
          v-if="message.toolInvocations?.[0]?.state === 'result'"
          :value="message.toolInvocations?.[0]?.result"
          :cache-key="message.id"
          unwrap="p"
          :components
          :parser-options="{ highlight: false }"
        />
        <MDCCached
          v-else-if="message.content.length > 0"
          :value="message.content"
          :cache-key="message.id"
          unwrap="p"
          :components
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
