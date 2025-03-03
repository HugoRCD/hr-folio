<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const { meetingLink } = runtimeConfig.public
const { profile } = useAppConfig()
</script>

<template>
  <div class="flex flex-col" data-animate style="--stagger: 1">
    <NuxtImg
      :src="profile.picture"
      alt="Hugo Richard"
      width="80"
      height="80"
      sizes="160"
      class="mb-2 size-20 rounded-full object-cover"
    />
    <h3 class="font-serif text-xl italic">
      <slot name="title" mdc-unwrap="p" />
    </h3>
    <div class="*:mb-3 *:text-(--ui-primary)">
      <slot name="job" mdc-unwrap="p" />
    </div>
    <p class="max-w-[600px] text-pretty text-(--ui-text-muted) text-sm font-extralight sm:text-base">
      <slot mdc-unwrap="p" />
    </p>
    <div class="mt-2 flex gap-8">
      <NuxtLink to="/contact" class="italic font-serif text-lg hover:underline decoration-accent">
        Send me a message
      </NuxtLink>
      <NuxtLink :to="meetingLink" class="italic font-serif text-lg hover:underline decoration-accent cursor-pointer">
        Make a call
      </NuxtLink>
    </div>
  </div>
</template>
