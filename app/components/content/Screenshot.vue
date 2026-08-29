<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
  href?: string
}>()
</script>

<template>
  <figure class="screenshot">
    <div class="screenshot__frame">
      <component
        :is="href ? 'a' : 'div'"
        :href="href"
        :target="href ? '_blank' : undefined"
        :rel="href ? 'noopener' : undefined"
        class="screenshot__media"
      >
        <NuxtImg
          :src="src"
          :alt="alt"
          loading="lazy"
        />
      </component>
    </div>
  </figure>
</template>

<style>
.screenshot {
  --frame-bg: rgb(0 0 0 / 0.04);
  --frame-border: rgb(0 0 0 / 0.08);
  --media-border: rgb(0 0 0 / 0.1);
  width: 100%;
  max-width: 40rem;
  margin: 2.5rem auto;
}

.dark .screenshot {
  --frame-bg: rgb(255 255 255 / 0.06);
  --frame-border: rgb(255 255 255 / 0.08);
  --media-border: rgb(255 255 255 / 0.1);
}

.screenshot__frame {
  padding: 0.25rem;
  border-radius: 0.75rem;
  background: var(--frame-bg);
  box-shadow: inset 0 0 0 1px var(--frame-border);
}

.screenshot__media {
  display: block;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px var(--media-border);
}

.screenshot__media img {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0;
}
</style>
