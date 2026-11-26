// Springs that settle, never bounce. Motion is off when the system asks for less of it.
export function useThingMotion() {
  const prefersReducedMotion = usePreferredReducedMotion()
  const reduced = computed(() => prefersReducedMotion.value === 'reduce')
  const spring = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 280, damping: 32, mass: 1 })
  const glide = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 220, damping: 34, mass: 1.05 })
  const arrive = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 200, damping: 30, mass: 1 })
  return { reduced, spring, glide, arrive }
}
