<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()

const { profile } = useFolioConfig()
</script>

<template>
  <section class="relative flex items-start gap-4 lg:block">
    <!-- the portrait is plate 1, hung in the index margin against the gutter -->
    <figure v-if="profile?.picture" class="in-index top-1 flex shrink-0 flex-col items-end gap-2">
      <NuxtImg
        :src="profile.picture"
        alt="Hugo Richard"
        data-construct="figure"
        width="112"
        height="112"
        class="size-14 rounded-[2px] object-cover lg:size-28"
      />
      <figcaption class="hidden font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50 lg:block">
        Pl. 1
      </figcaption>
    </figure>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-0.5">
        <h1 class="font-redaction text-lg">
          {{ title }}
        </h1>
        <h2 class="font-serif text-xl font-medium text-primary">
          {{ subtitle }}
        </h2>
      </div>
      <p class="max-w-prose text-pretty text-sm/6 text-muted">
        <slot mdc-unwrap="p" />
      </p>
    </div>
  </section>
</template>
