/** Back home: forget the stored place so the default applies again. */
export default defineEventHandler(async (event) => {
  requireWhereaboutsToken(event)
  await useStorage('whereabouts').removeItem('current')
  useLogger(event).set({ whereabouts: { reset: true } })
  return HOME_WHEREABOUTS
})
