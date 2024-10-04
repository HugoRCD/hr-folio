<script setup lang="ts">
useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})
</script>

<template>
  <Html lang="en">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Html>
</template>
