<script setup lang="ts">
const links = useSocialLinks()
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="font-serif text-lg italic text-highlighted">
      Contact<span class="text-primary">.</span>
    </h3>
    <nav aria-label="Contact and socials" class="flex flex-wrap items-center gap-3">
      <UTooltip v-for="(link, i) in links" :key="link.id" :text="link.label">
        <NuxtLink
          :to="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
          :aria-label="link.label"
          class="inline-flex text-muted hover:text-highlighted animate-in opacity-0"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <UIcon :name="link.icon" class="size-5 shrink-0 text-xl" />
        </NuxtLink>
      </UTooltip>
    </nav>
  </div>
</template>
