<script setup lang="ts">
const { profile, global } = useAppConfig()
</script>

<template>
  <div class="flex flex-col" data-animate style="--stagger: 1">
    <div class="flex items-center gap-2 mb-2">
      <NuxtImg
        :src="profile.picture"
        alt="Hugo Richard"
        width="80"
        height="80"
        sizes="160"
        format="webp"
        class="mb-2 size-18 rounded-full object-cover"
      />
      <div class="flex flex-col">
        <h3 class="font-serif text-xl italic">
          <slot name="title" mdc-unwrap="p" />
        </h3>
        <div class="*:mb-0 *:text-(--ui-primary)">
          <slot name="job" mdc-unwrap="p" />
        </div>
      </div>
    </div>
    <p class="max-w-[600px] text-pretty text-(--ui-text-muted) text-sm font-extralight sm:text-base">
      <slot mdc-unwrap="p" />
    </p>
    <div class="mt-2 flex gap-8">
      <NuxtLink to="/contact" class="italic font-serif text-lg hover:underline decoration-accent">
        Send me a message
      </NuxtLink>
      <NuxtLink :to="global.meetingLink" class="italic font-serif text-lg hover:underline decoration-accent cursor-pointer">
        Make a call
      </NuxtLink>
    </div>
  </div>
</template>
