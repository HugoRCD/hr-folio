export function useHoverSound() {
  const enabled = useCookie<boolean>('hr_hover_sound', {
    default: () => false,
    sameSite: 'lax',
    // seconds (1 year)
    maxAge: 60 * 60 * 24 * 365,
  })

  const setEnabled = (value: boolean) => {
    enabled.value = value
  }

  const toggle = () => {
    enabled.value = !enabled.value
  }

  return {
    enabled,
    setEnabled,
    toggle,
  }
}
