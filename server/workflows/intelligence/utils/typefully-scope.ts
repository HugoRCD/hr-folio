/**
 * Restrict Typefully MCP extraction to the portfolio owner’s personal account,
 * not team/org social sets (e.g. Nuxt) returned by the API.
 */
export function getTypefullySocialScopeBlock(): string {
  const id = process.env.TYPEFULLY_SOCIAL_SET_ID?.trim()
  if (id && /^\d+$/.test(id)) {
    return [
      'Social set scope (strict):',
      `Use ONLY social_set_id ${id} for typefully_list_drafts, typefully_get_queue, typefully_list_social_set_analytics_posts, and typefully_get_social_set_details.`,
      'Do not fetch, list, or mention any other social set.',
    ].join('\n')
  }

  const handle = process.env.TYPEFULLY_SOCIAL_HANDLE?.trim() || '@hugorcd'

  return [
    'Social set scope (personal portfolio only):',
    `After typefully_list_social_sets, resolve the single social set for the personal X account ${handle} (Hugo’s personal account — not team or org accounts).`,
    'Use only that social_set_id for all subsequent tool calls (drafts, queue, analytics, details).',
    'Ignore and omit data from other social sets (e.g. @nuxt_js, @nuxtlabs, @nuxt_hub, @nuxtstudio, or any team/shared accounts the API may return).',
    'Do not merge or summarize team accounts in this report.',
  ].join('\n')
}
