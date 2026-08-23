<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()

const { profile } = useFolioConfig()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <NuxtImg
        v-if="profile?.picture"
        :src="profile.picture"
        alt="Hugo Richard"
        width="56"
        height="56"
        class="size-14 shrink-0 rounded-sm object-cover"
      />
      <div class="flex flex-col gap-0.5">
        <h1 class="font-redaction text-lg">
          {{ title }}
        </h1>
        <h2 class="font-serif text-xl font-medium text-primary">
          {{ subtitle }}
        </h2>
      </div>
    </div>
    <p class="max-w-prose text-pretty text-sm/6 text-muted">
      <slot mdc-unwrap="p" />
    </p>
  </div>
</template>
