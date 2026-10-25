<script setup lang="ts">
import fontPreloads from '#build/font-preloads.mjs'

const { seo, profile, socials, link } = useFolioConfig()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'charset', content: 'utf-8' },
    { name: 'robots', content: 'index, follow' },
    { name: 'color-scheme', content: 'light dark' },
  ],
  link: [...link, ...fontPreloads],
})

useSchemaOrg([
  definePerson({
    name: seo?.title,
    url: seo?.url,
    image: profile?.picture,
    jobTitle: seo?.description,
    worksFor: { '@type': 'Organization', name: 'Vercel', url: 'https://vercel.com' },
    sameAs: [
      socials?.github,
      socials?.twitter,
      socials?.linkedin,
      socials?.instagram,
      socials?.cosmos,
      socials?.spotify,
    ].filter(Boolean),
  }),
])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
