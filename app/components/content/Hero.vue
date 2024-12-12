<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const { meetingLink } = runtimeConfig.public

const openModal = ref(false)
</script>

<template>
  <div
    class="flex flex-col"
    data-animate
    style="--stagger: 1"
  >
    <NuxtImg
      src="/hugo.webp"
      alt="Hugo Richard"
      width="80"
      height="80"
      sizes="160"
      class="mb-2 size-20 rounded-full object-cover"
      @click="openModal = true"
    />
    <h3>
      Hugo Richard
    </h3>
    <h1 class="font-newsreader text-2xl font-medium italic text-accent sm:text-3xl">
      Frontend Architect and Designer
    </h1>
    <p class="max-w-[600px] text-pretty">
      <slot mdc-unwrap="p" />
    </p>
    <div class="mt-2 flex gap-8">
      <NuxtLink
        to="contact"
        class="flex cursor-pointer items-center font-newsreader text-lg italic hover:text-accent hover:underline"
      >
        Send me a message<span class="i-lucide-arrow-up-right mb-1" />
      </NuxtLink>
      <NuxtLink
        :to="meetingLink"
        class="flex cursor-pointer items-center font-newsreader text-lg italic hover:text-accent hover:underline"
      >
        Make a call<span class="i-lucide-arrow-up-right mb-1" />
      </NuxtLink>
    </div>
  </div>
</template>
