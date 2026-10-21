<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()

const { profile } = useFolioConfig()
</script>

<template>
  <!-- on a phone the portrait stands above the name, so the name and the lines under it keep the
       page's whole width and its left edge -->
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
    <!-- the name leads, as at the head of a letter; what he does follows it, quieter -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="font-redaction text-[32px] leading-10 text-highlighted lg:text-4xl lg:leading-10">
          {{ title }}
        </h1>
        <!-- the job, from the page (#subtitle): the trade in Redaction italic, the house it is for -->
        <p class="job text-sm/6 text-muted">
          <slot name="subtitle" mdc-unwrap="p">
            {{ subtitle }}
          </slot>
        </p>
      </div>
      <p class="max-w-prose text-pretty text-sm/6 text-muted">
        <slot mdc-unwrap="p" />
      </p>
    </div>
  </section>
</template>

<style scoped>
/* "Designer" set in the serif's italic, as the section numerals are, and in the red: a hand,
   beside the engineer */
.job :deep(em) {
  font-family: var(--font-redaction);
  font-size: 15px;
  font-style: italic;
  color: var(--ui-primary);
}
/* Vercel goes to Vercel, but reads as part of the line, not as a link */
.job :deep(a) {
  font-weight: inherit;
  color: var(--ui-text-highlighted);
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
</style>
