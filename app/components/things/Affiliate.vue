<template>
  <p class="affiliate">
    Some links are affiliate links.
  </p>
</template>

<style scoped>
.affiliate {
  position: fixed;
  left: 20px;
  bottom: 18px;
  z-index: 45;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.04em;
  color: #111111;
  opacity: 0.35;
  transition: opacity 0.25s ease;
  pointer-events: auto;
}
.affiliate:hover {
  opacity: 0.75;
}

@media (max-width: 899px) {
  .affiliate {
    left: 18px;
    bottom: 58px;
  }
}
</style>
