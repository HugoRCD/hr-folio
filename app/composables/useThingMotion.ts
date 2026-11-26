// Springs that settle, never bounce. Motion is off when the system asks for less of it.
export function useThingMotion() {
  const prefersReducedMotion = usePreferredReducedMotion()
  const reduced = computed(() => prefersReducedMotion.value === 'reduce')
  const spring = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 42, mass: 1 })
  return { reduced, spring }
}
