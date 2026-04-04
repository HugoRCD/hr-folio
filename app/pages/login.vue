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

async function loginWithGitHub() {
  await signIn.social({ provider: 'github', callbackURL: safeCallbackPath() })
}

useHead({ title: 'Sign in' })
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 py-24">
    <h1 class="text-2xl/8 font-semibold text-highlighted">
      Sign in
    </h1>
    <p class="text-sm text-muted">
      Sign in with your GitHub account to continue.
    </p>
    <UButton
      icon="i-simple-icons-github"
      size="lg"
      color="neutral"
      variant="subtle"
      @click="loginWithGitHub"
    >
      Continue with GitHub
    </UButton>
  </div>
</template>
