<script setup lang="ts">
const links = useSocialLinks()
</script>

<template>
  <section class="relative">
    <SectionMark numeral="I" label="Contact" as="h3" />
    <nav aria-label="Contact and socials" class="flex min-h-10 flex-wrap items-center gap-4 py-2">
      <UTooltip v-for="(link, i) in links" :key="link.id" :text="link.label">
        <NuxtLink
          :to="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
          :aria-label="link.label"
          class="inline-flex text-muted hover:text-highlighted animate-in opacity-0"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <UIcon :name="link.icon" class="size-[18px] shrink-0" />
        </NuxtLink>
      </UTooltip>
    </nav>
  </section>
</template>
