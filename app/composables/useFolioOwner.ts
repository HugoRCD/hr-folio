export function useFolioOwner() {
  const { loggedIn } = useUserSession()

  const { data } = useAsyncData(
    'folio-owner',
    () => $fetch<{ isOwner: boolean }>('/api/folio/access'),
    { server: false },
  )

  watch(loggedIn, () => {
    void refreshNuxtData('folio-owner')
  })

  const isOwner = computed(() => data.value?.isOwner ?? false)

  return { isOwner }
}
