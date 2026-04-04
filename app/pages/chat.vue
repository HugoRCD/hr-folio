<script setup lang="ts">
definePageMeta({
  layout: 'chat',
})

const { seo } = useFolioConfig()
const { agentTitle, firstName } = useAgentBrand()

const siteOrigin = computed(() => new URL(seo.url).origin)

const description = computed(
  () =>
    `${agentTitle.value} — ask ${firstName.value} about projects, writing, and work. Replies use only published content on this site (no open-web guessing).`,
)

useHead({
  title: () => agentTitle.value,
  meta: [
    {
      name: 'description',
      content: () => description.value,
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: () => `${siteOrigin.value}/chat`,
    },
  ],
})

useSeoMeta({
  ogTitle: () => agentTitle.value,
  ogDescription: () => description.value,
  ogType: 'website',
  ogUrl: () => `${siteOrigin.value}/chat`,
  ...(seo.lang === 'en' ? { ogLocale: 'en_US' as const } : {}),
  twitterCard: 'summary',
  twitterTitle: () => agentTitle.value,
  twitterDescription: () => description.value,
})
</script>

<template>
  <AgentChatPanel />
</template>
