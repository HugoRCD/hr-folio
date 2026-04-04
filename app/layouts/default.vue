<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
const { agentLabel } = useAgentBrand()
const { user, loggedIn, signOut } = useUserSession()

const sessionTooltipTitle = computed(() => {
  const u = user.value
  if (!u) return ''
  const name = u.name?.trim()
  if (name) return name
  return u.email?.trim() || 'Account'
})

const sessionTooltipSubtitle = computed(() => {
  const u = user.value
  if (!u) return null
  const name = u.name?.trim()
  const email = u.email?.trim()
  if (!email || !name || name === email) return null
  return email
})
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <SearchCommand />
    <div class="fixed right-6 top-6 z-50 flex items-center gap-2">
      <ThemeSelector />
    </div>

    <main class="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-12 sm:py-20">
      <NuxtLink
        v-if="!isHome"
        to="/"
        class="mb-8 flex items-center gap-1 text-sm text-muted/50 transition-colors hover:text-highlighted"
      >
        &larr; Home
      </NuxtLink>

      <div class="flex-1">
        <slot />
      </div>

      <footer class="mt-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted/40">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted/25">
          <NuxtLink
            to="/chat"
            class="inline-flex items-center gap-1 transition-colors hover:text-muted"
          >
            <UIcon name="custom:ai" class="size-3 opacity-90" /> {{ agentLabel }}
          </NuxtLink>
          <span class="text-muted/15" aria-hidden="true">|</span>
          <span>⌘K</span>
          <template v-if="loggedIn">
            <span class="text-muted/15" aria-hidden="true">|</span>
            <UTooltip
              :delay-duration="0"
              :content="{ side: 'top', align: 'center', sideOffset: 8 }"
              :ui="{
                content:
                  'h-auto min-h-0 flex-col items-stretch justify-start gap-1.5 py-2.5 px-3 w-max max-w-[min(18rem,calc(100vw-2rem))] text-left'
              }"
            >
              <span class="inline-flex items-center gap-1">
                <UAvatar
                  :src="user?.image ?? undefined"
                  :alt="user?.name ?? 'Account'"
                  size="3xs"
                  class="opacity-70"
                />
                <UButton
                  icon="custom:logout"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="min-h-0 min-w-0 px-0.5 text-muted/35 hover:text-muted/80"
                  aria-label="Sign out"
                  @click="signOut()"
                />
              </span>
              <template #content>
                <div class="flex min-w-0 flex-col gap-0.5">
                  <span class="text-sm/5 font-medium text-highlighted">
                    {{ sessionTooltipTitle }}
                  </span>
                  <span
                    v-if="sessionTooltipSubtitle"
                    class="wrap-break-word text-xs/4 text-dimmed"
                  >
                    {{ sessionTooltipSubtitle }}
                  </span>
                </div>
              </template>
            </UTooltip>
          </template>
          <template v-else>
            <span class="text-muted/15" aria-hidden="true">|</span>
            <NuxtLink
              to="/login"
              class="transition-colors hover:text-muted"
            >
              Sign in
            </NuxtLink>
          </template>
        </div>
      </footer>
    </main>
  </UApp>
</template>
