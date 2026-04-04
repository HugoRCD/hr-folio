/**
 * Brand strings for the portfolio agent (tab titles, palette, footer).
 * First name is taken from `seo.title` in app config (e.g. "Hugo Richard" → Hugo).
 */
export function useAgentBrand() {
  const { seo } = useFolioConfig()

  const firstName = computed(() => {
    const full = String(seo.title ?? '').trim()
    return full.split(/\s+/)[0] || 'Hugo'
  })

  /** Segment for `<title>` / OG, e.g. "Hugo's Agent" */
  const agentTitle = computed(() => `${firstName.value}'s Agent`)

  /** In-sentence / UI label, e.g. "Hugo's agent" */
  const agentLabel = computed(() => `${firstName.value}'s agent`)

  return { firstName, agentTitle, agentLabel }
}
