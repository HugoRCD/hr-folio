<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  avatar?: string
}>()
</script>

<template>
  <div
    style="display: flex; flex-direction: column; justify-content: space-between; width: 100%; height: 100%; padding: 80px; background-color: #020202;"
  >
    <div style="display: flex; align-items: center; gap: 16px;">
      <img
        v-if="avatar"
        :src="avatar"
        alt=""
        style="width: 48px; height: 48px; border-radius: 4px;"
      >
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <div style="display: flex; align-items: baseline; gap: 3px;">
          <span style="font-family: 'Redaction'; font-weight: 400; font-size: 26px; color: #fafafa;">
            Hugo Richard
          </span>
          <span style="font-family: 'Redaction'; font-weight: 400; font-size: 34px; color: #2853ff;">
            .
          </span>
        </div>
        <span style="font-family: 'Redaction'; font-weight: 400; font-size: 18px; color: #737373;">
          Software Engineer &amp; Designer at Vercel
        </span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 900px;">
      <span style="font-family: 'Redaction'; font-weight: 400; font-size: 52px; color: #fafafa; line-height: 1.2; letter-spacing: -0.02em;">
        {{ title }}
      </span>
      <span
        v-if="description"
        style="font-family: 'Geist', sans-serif; font-weight: 400; font-size: 24px; color: #737373; line-height: 1.4;"
      >
        {{ description }}
      </span>
    </div>
  </div>
</template>
