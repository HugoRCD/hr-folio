<template>
  <!-- the red viewer from the notice, for use in an article (::red-viewer) -->
  <div class="viewer">
    <NoticeRed />
  </div>
</template>

<style scoped>
/* kept to the measure, as on the notice: an article widens its figures, not this one */
.viewer {
  margin: 0;
}
.viewer :deep(figure) {
  width: auto;
  max-width: none;
  margin-inline: 0;
}
</style>
