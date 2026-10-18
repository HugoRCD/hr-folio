<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()

const { profile } = useFolioConfig()
</script>

<template>
  <!-- on a phone the portrait stands above the name, so the name, the title and the line under
       them keep the page's whole width and its left edge -->
  <section class="relative flex flex-col items-start gap-4 sm:flex-row lg:block">
    <!-- the portrait is plate 1, hung in the index margin against the gutter -->
    <figure v-if="profile?.picture" class="in-index top-1 flex shrink-0 flex-col items-end gap-2">
      <NuxtImg
        :src="profile.picture"
        alt="Hugo Richard"
        data-construct="figure"
        width="112"
        height="112"
        class="size-16 rounded-[2px] object-cover sm:size-14 lg:size-28"
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
        <!-- two lines on a phone in Redaction, one in the font shown before it arrives: held at two,
             so nothing below moves when it does -->
        <h2 class="min-h-14 text-balance font-serif text-xl font-medium text-primary sm:min-h-0">
          {{ subtitle }}
        </h2>
      </div>
      <p class="max-w-prose text-pretty text-sm/6 text-muted">
        <slot mdc-unwrap="p" />
      </p>
    </div>
  </section>
</template>
