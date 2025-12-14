<script setup lang="ts">
defineProps<{
    title: string
    job: string
  }>()
const { profile, global } = useAppConfig()
</script>

<template>
  <div class="flex flex-col" style="--stagger: 1">
    <div class="flex items-center gap-3 mb-2">
      <ProseImg
        v-if="profile?.pictureDark"
        :src="profile.pictureDark"
        alt="Hugo Richard"
        width="80"
        height="80"
        sizes="160"
        format="webp"
        class="size-12 object-cover"
      />
      <div class="flex flex-col">
        <h3 class="font-redaction text-lg">
          {{ title }}
        </h3>
        <h1 class="font-serif text-primary text-xl font-medium">
          {{ job }}
        </h1>
      </div>
    </div>
    <p class="max-w-[600px] text-pretty text-muted text-sm font-extralight sm:text-base">
      <slot mdc-unwrap="p" />
    </p>
  </div>
</template>
