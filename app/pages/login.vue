<script setup lang="ts">
definePageMeta({ auth: 'guest' })

const route = useRoute()
const { signIn } = useUserSession()

function safeCallbackPath(): string {
  const raw = route.query.redirect
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (s.startsWith('/') && !s.startsWith('//')) return s
  return '/'
}

onMounted(() => {
  void signIn.social({ provider: 'github', callbackURL: safeCallbackPath() })
})
</script>

<template>
  <div />
</template>
