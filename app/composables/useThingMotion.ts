// Springs that settle, never bounce. Motion is off when the system asks for less of it.
export function useThingMotion() {
  const prefersReducedMotion = usePreferredReducedMotion()
  const reduced = computed(() => prefersReducedMotion.value === 'reduce')
  const spring = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 42, mass: 1 })
  const glide = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 180, damping: 28, mass: 1.1 })
  const arrive = computed(() => reduced.value
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 160, damping: 22, mass: 1.05 })
  return { reduced, spring, glide, arrive }
}
