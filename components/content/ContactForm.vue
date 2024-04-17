<script setup lang="ts">
const email = ref('')
const message = ref('')
const name = ref('')

const { status, error, refresh } = useFetch('/api/send', {
  method: 'POST',
  body: { email, message, name },
  watch: false,
  immediate: false
})

async function submit() {
  if (!email.value || !message.value) {
    toast.error('Please fill in all required fields.')
    return
  }
  await refresh()
  if (!error.value) {
    email.value = ''
    message.value = ''
    name.value = ''
    toast.success('Your message has been sent!')
  } else {
    toast.error('An error occurred while sending your message.')
  }
}

onMounted(() => {
  document.querySelectorAll('[data-autoresize]').forEach((element: HTMLTextAreaElement) => {
    element.style.boxSizing = 'border-box'
    const offset = element.offsetHeight - element.clientHeight
    element.addEventListener('input', (event) => {
      if (!event.target) return
      event.target.style.height = 'auto'
      event.target.style.height = event.target.scrollHeight + offset + 'px'
    })
    element.removeAttribute('data-autoresize')
  })
})
</script>

<template>
  <form
    class="mt-6 flex flex-col gap-4"
    @submit.prevent="submit"
    @keydown.enter.prevent="submit"
  >
    <input
      v-model="name"
      type="text"
      placeholder="Name"
      class="input"
    >
    <input
      v-model="email"
      type="email"
      placeholder="Email*"
      class="input"
      required
    >
    <textarea
      v-model="message"
      data-autoresize
      rows="4"
      placeholder="Message*"
      class="input"
      required
    />
    <button
      type="submit"
      class="bg-accent p-2 text-white"
    >
      <span class="flex items-center justify-center gap-2">
        Send
        <i
          v-if="status === 'pending'"
          class="i-lucide-loader size-4 animate-spin text-inverted"
        />
      </span>
    </button>
  </form>
</template>

<style scoped>

</style>
