<template>
  <!-- ::breakout around anything in an article (an image, a video, a block of Markdown) lets it
       leave the measure, as far as the page allows (.breakout, in main.css). A component can take
       the class itself instead: :::print-spread{.breakout} -->
  <div class="breakout">
    <slot />
  </div>
</template>
