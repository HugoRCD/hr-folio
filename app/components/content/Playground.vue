<script setup lang="ts">

const { data: posts, error } = await useAsyncData('playground', () => queryCollection('playground').order('date', 'DESC').all())
if (!posts.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div class="flex font-normal flex-col gap-8">
    <List v-if="posts" :posts />
  </div>
</template>
