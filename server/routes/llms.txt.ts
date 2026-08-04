/** Short llms.txt index (https://llmstxt.org): metadata + links only, no bodies. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const { folio } = useRuntimeConfig(event)
  const domain = folio.seo.url.replace(/\/$/, '')
  const abs = (path: string) => (path.startsWith('http') ? path : `${domain}${path}`)

  const [pages, works] = await Promise.all([
    cms.list(['pages']),
    cms.list(['works']),
  ])

  const writing = pages
    .filter(p => p.path.startsWith('/writing/'))
    .sort((a, b) => new Date((b.data as PageData).date!).getTime() - new Date((a.data as PageData).date!).getTime())
  const clipboard = pages
    .filter(p => p.path.startsWith('/clipboard/'))
    .sort((a, b) => new Date((b.data as PageData).date!).getTime() - new Date((a.data as PageData).date!).getTime())

  const lines = [
    `# ${folio.seo.title} Portfolio`,
    '',
    `> ${folio.seo.description}`,
    '',
    'Hugo Richard is a Software Engineer & Designer at Vercel, contributing to the Nuxt ecosystem. This portfolio showcases his professional work, technical writings, and projects.',
    '',
    '## Docs',
    '',
    `- [Home](${abs('/')}): Overview of Hugo Richard's professional profile and featured projects.`,
    `- [About](${abs('/about')}): Authoritative bio, current role, and background.`,
    `- [Works](${abs('/works')}): Projects and contributions.`,
    '',
    '## Writing',
    '',
    ...writing.map((w) => {
      const data = w.data as PageData
      return `- [${data.title}](${abs(w.path)}): ${data.description ?? ''}`
    }),
    '',
    '## Clipboard',
    '',
    ...clipboard.map((c) => {
      const data = c.data as PageData
      return `- [${data.title}](${abs(c.path)})`
    }),
    '',
    '## Works / projects',
    '',
    ...works.map((w) => {
      const data = w.data as WorkData
      return `- **${data.name}** (${data.category}): ${data.description} — ${data.url}`
    }),
    '',
  ]

  return lines.join('\n')
})
