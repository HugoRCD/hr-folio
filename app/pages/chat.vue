<script setup lang="ts">
import type { EveDynamicToolPart, EveMessagePart } from 'eve/vue'

useHead({ title: 'Chat — Hugo Richard' })

const STORAGE_KEY = 'eve-chat-auth'

const authHeader = ref<string | null>(null)
const authError = ref(false)
const username = ref('hugo')
const password = ref('')

onMounted(() => {
  authHeader.value = sessionStorage.getItem(STORAGE_KEY)
})

function unlock() {
  if (!password.value) return
  authHeader.value = `Basic ${btoa(`${username.value}:${password.value}`)}`
  sessionStorage.setItem(STORAGE_KEY, authHeader.value)
  password.value = ''
  authError.value = false
}

function lock() {
  authHeader.value = null
  sessionStorage.removeItem(STORAGE_KEY)
}

const { data, status, error, send, stop, reset } = useEveAgent({
  headers: () => (authHeader.value ? { authorization: authHeader.value } : {}),
  onError: () => {
    // A wrong or expired shared secret shows up as a transport error — drop
    // it so the form comes back instead of failing silently on every send.
    if (authHeader.value) {
      authError.value = true
      lock()
    }
  },
})

const isBusy = computed(() => status.value === 'submitted' || status.value === 'streaming')

const input = ref('')

async function handleSubmit() {
  const text = input.value.trim()
  if (!text || isBusy.value || !authHeader.value) return
  input.value = ''
  await send({ message: text })
}

function isToolPart(part: EveMessagePart): part is EveDynamicToolPart {
  return part.type === 'dynamic-tool'
}

async function respond(requestId: string, optionId: string) {
  await send({ inputResponses: [{ requestId, optionId }] })
}
</script>

<template>
  <div class="flex min-h-[70vh] flex-col">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-sm font-mono text-highlighted">
        Agent
      </h1>
      <div v-if="authHeader" class="flex items-center gap-3 text-xs font-mono text-muted/40">
        <button type="button" class="transition-colors hover:text-highlighted" @click="reset()">
          reset
        </button>
        <button type="button" class="transition-colors hover:text-highlighted" @click="lock()">
          lock
        </button>
      </div>
    </div>

    <form v-if="!authHeader" class="flex flex-col gap-3" @submit.prevent="unlock">
      <p class="text-sm text-muted/60">
        Personal GitHub agent — enter the shared secret to unlock the chat.
      </p>
      <UInput v-model="password" type="password" placeholder="Secret" autofocus size="sm" />
      <p v-if="authError" class="text-xs text-error">
        Wrong secret, or the agent isn't reachable. Try again.
      </p>
      <UButton type="submit" size="sm" color="neutral" :disabled="!password">
        Unlock
      </UButton>
    </form>

    <template v-else>
      <div class="flex-1 space-y-6 overflow-y-auto">
        <div v-for="message in data.messages" :key="message.id" class="space-y-1">
          <div class="text-[10px] uppercase tracking-wider text-muted/40">
            {{ message.role === 'user' ? 'you' : 'agent' }}
          </div>

          <template v-for="(part, i) in message.parts" :key="i">
            <p v-if="part.type === 'text' && part.text" class="whitespace-pre-wrap text-sm text-highlighted">
              {{ part.text }}
            </p>

            <div
              v-else-if="isToolPart(part)"
              class="rounded-md border border-default/30 bg-elevated/40 px-3 py-2 text-xs font-mono text-muted/60"
            >
              <div class="flex items-center gap-2">
                <span>→</span>
                <span class="text-highlighted/80">{{ part.toolName }}</span>
                <span class="text-muted/40">{{ part.state }}</span>
              </div>

              <div v-if="part.state === 'approval-requested'" class="mt-2 flex items-center gap-2">
                <span class="text-muted/70">
                  {{ part.toolMetadata?.eve?.inputRequest?.prompt ?? 'Approve this action?' }}
                </span>
                <UButton
                  v-for="option in (part.toolMetadata?.eve?.inputRequest?.options ?? [
                    { id: 'approve', label: 'Approve' },
                    { id: 'deny', label: 'Deny' },
                  ])"
                  :key="option.id"
                  size="xs"
                  :color="option.style === 'danger' ? 'error' : 'neutral'"
                  variant="soft"
                  @click="respond(part.toolMetadata!.eve!.inputRequest!.requestId, option.id)"
                >
                  {{ option.label }}
                </UButton>
              </div>

              <p v-else-if="part.state === 'output-denied'" class="mt-1 text-muted/40">
                denied
              </p>
              <p v-else-if="part.state === 'output-error'" class="mt-1 text-error">
                {{ part.errorText }}
              </p>
            </div>
          </template>
        </div>

        <p v-if="!data.messages.length" class="text-sm text-muted/40">
          Say hi.
        </p>
      </div>

      <p v-if="error" class="mt-4 text-xs text-error">
        {{ error.message }}
      </p>

      <form class="mt-6 flex items-end gap-2" @submit.prevent="handleSubmit">
        <UTextarea
          v-model="input"
          class="flex-1"
          size="sm"
          :rows="1"
          :maxrows="6"
          autoresize
          placeholder="Message the agent…"
          :disabled="isBusy"
          @keydown.enter.exact.prevent="handleSubmit"
        />
        <UButton v-if="isBusy" size="sm" color="neutral" variant="soft" @click="stop()">
          Stop
        </UButton>
        <UButton v-else type="submit" size="sm" color="neutral" :disabled="!input.trim()">
          Send
        </UButton>
      </form>
    </template>
  </div>
</template>
