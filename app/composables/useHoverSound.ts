// Sound on or off, one value for the whole page (the button and the chime under the page),
// kept in a cookie for the next visit. Off by default.
export function useHoverSound() {
  const cookie = useCookie<boolean>('hr_hover_sound', {
    default: () => false,
    sameSite: 'lax',
    // seconds (1 year)
    maxAge: 60 * 60 * 24 * 365,
  })
  const enabled = useState<boolean>('sound-on', () => Boolean(cookie.value))

  const setEnabled = (value: boolean) => {
    enabled.value = value
    cookie.value = value
  }

  const toggle = () => setEnabled(!enabled.value)

  return {
    enabled,
    setEnabled,
    toggle,
  }
}
