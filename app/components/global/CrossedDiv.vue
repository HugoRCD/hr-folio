<script setup lang="ts">
const { as = 'div' } = defineProps<{
  as?: string
}>()
</script>

<template>
  <component :is="as" class="relative -mb-px -ml-px border border-default">
    <span class="cross absolute -bottom-px -left-px size-px" />
    <span class="cross absolute -bottom-px -right-px size-px" />
    <span class="cross absolute -left-px -top-px size-px" />
    <span class="cross absolute -right-px -top-px size-px" />
    <div class="relative z-10 flex h-full flex-col justify-center">
      <slot />
    </div>
  </component>
</template>

<style scoped>
@reference "../../assets/style/main.css";

.cross {
  @apply before:absolute after:absolute;
  @apply before:top-[-4px] before:bg-inverted before:content-[''] before:w-[1px] before:h-[9px];
  @apply after:left-[-4px] after:bg-inverted after:content-[''] after:w-[9px] after:h-[1px];
}
</style>
