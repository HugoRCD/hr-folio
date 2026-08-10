import { renderMarkdown } from 'comark/render'

/**
 * Full llms-full.txt: plain metadata index (works, clipboard) plus the full
 * rendered Markdown body of every writing post. Component syntax (`::hero`,
 * `::writing-list`…) is preserved as-is when re-serialized — it isn't expanded.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const { folio } = useRuntimeConfig(event)
  const domain = folio.seo.url.replace(/\/$/, '')
  const abs = (path: string) => (path.startsWith('http') ? path : `${domain}${path}`)

  const [pages, works] = await Promise.all([
    content.list(['pages']),
    content.list(['works']),
  ])

  const writing = pages
    .filter(p => p.path.startsWith('/writing/'))
    .sort((a, b) => byDateDesc(a.data, b.data))
  const clipboard = pages
    .filter(p => p.path.startsWith('/clipboard/'))
    .sort((a, b) => byDateDesc(a.data, b.data))

  const writingBodies = await Promise.all(writing.map(async (item) => {
    const full = await content.get(item.path)
    const { data } = item
    if (!full) return ''
    const markdown = await renderMarkdown({ frontmatter: full.data, meta: full.meta, nodes: full.nodes })
    return [`## ${data.title}`, '', `Source: ${abs(item.path)}`, '', markdown].join('\n')
  }))

  const lines = [
    `# ${folio.seo.title} Portfolio — Full Content`,
    '',
    `> ${folio.seo.description}`,
    '',
    'Hugo Richard is a Software Engineer & Designer at Vercel, contributing to the Nuxt ecosystem. This portfolio showcases his professional work, technical writings, and projects.',
    '',
    '---',
    '',
    '# Writing',
    '',
    ...writingBodies,
    '',
    '---',
    '',
    '# Clipboard',
    '',
    ...clipboard.map((c) => {
      const { data } = c
      return `- [${data.title}](${abs(c.path)})`
    }),
    '',
    '---',
    '',
    '# Works / projects',
    '',
    ...works.map((w) => {
      const { data } = w
      return `- **${data.name}** (${data.category}): ${data.description} — ${data.url}`
    }),
    '',
  ]

  return lines.join('\n')
})
