<script setup lang="ts">
const { profile, socials } = useFolioConfig()

const links = computed(() => [
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'GitHub', href: socials.github },
  { label: 'Twitter', href: socials.twitter },
  { label: 'LinkedIn', href: socials.linkedin },
  { label: 'Instagram', href: socials.instagram },
  { label: 'Cosmos', href: socials.cosmos },
  { label: 'Spotify', href: socials.spotify },
])
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
    <template v-for="(link, i) in links" :key="link.label">
      <NuxtLink
        :to="link.href"
        :target="link.href.startsWith('mailto') ? undefined : '_blank'"
        class="text-muted transition-colors hover:text-highlighted animate-in opacity-0"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        {{ link.label }}
      </NuxtLink>
      <span v-if="i < links.length - 1" class="text-muted/30">·</span>
    </template>
  </div>
</template>
