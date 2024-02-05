<script setup lang="ts">
const email = ref("");
const message = ref("");
const name = ref("");
</script>

<template>
  <form
    class="mt-6 flex flex-col gap-4"
    @submit.prevent="console.log('submit')"
  >
    <input
      v-model="name"
      type="text"
      placeholder="Name"
      class="rounded border border-gray-300 p-2"
    >
    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="rounded border border-gray-300 p-2"
    >
    <textarea
      v-model="message"
      placeholder="Message"
      class="rounded border border-gray-300 p-2"
    />
    <button
      type="submit"
      class="bg-accent p-2 text-white"
    >
      Send
    </button>
  </form>
</template>

<style scoped>

</style>
