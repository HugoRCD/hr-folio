<template>
  <!-- the sun viewer from the notice, for use in an article (::sun-viewer). It reads the clock, so
       it renders in the browser; its height is held meanwhile so nothing moves. -->
  <div class="viewer">
    <ClientOnly>
      <NoticeSun />
      <template #fallback>
        <div class="space" />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.viewer {
  margin: 0;
}
.viewer :deep(figure) {
  width: auto;
  max-width: none;
  margin-inline: 0;
}
.space {
  height: 299px;
  margin-top: 32px;
}
/* narrower than 406px a line of its readout wraps, and the figure is 16px taller (measured) */
@media (max-width: 405px) {
  .space {
    height: 315px;
  }
}
</style>
