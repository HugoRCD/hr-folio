<template>
  <!-- a list of terms and definitions (::sheet-entries), as on the notice -->
  <dl class="entries">
    <slot />
  </dl>
</template>

<style scoped>
.entries {
  display: flex;
  flex-direction: column;
  margin-top: 32px;
}
</style>
