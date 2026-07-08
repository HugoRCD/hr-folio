import { renderMarkdown } from 'comark/render'

const LLMS_DOMAIN = 'https://hugorcd.com'

function abs(path: string, domain = LLMS_DOMAIN) {
  const base = domain.replace(/\/$/, '')
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`
}

async function pageMarkdown(path: string) {
  const page = await getPageByPath(path)
  if (!page) return ''
  if (page.rawbody) return page.rawbody
  return renderMarkdown({ nodes: page.nodes, frontmatter: {}, meta: {} })
}

async function buildPlainIndex(domain: string) {
  const [writing, clipboard, works] = await Promise.all([
    listWriting(false),
    listClipboard(false),
    listWorks(),
  ])

  return [
    '',
    '---',
    '',
    '# Plain site index (for LLMs)',
    '',
    'Sections above may still contain MDC shortcuts (`::writing-list`, `::projects`, `:contact-links`). The lists below duplicate **published** URLs and metadata in plain Markdown.',
    '',
    '## Writing',
    '',
    ...writing.map((w) => {
      const desc = w.description ? ` — ${w.description}` : ''
      return `- [${w.title}](${abs(w.path, domain)})${desc} (${w.date})`
    }),
    '',
    '## Clipboard',
    '',
    ...clipboard.map((c) => `- [${c.title}](${abs(c.path, domain)}) (${c.date})`),
    '',
    '## Works / projects',
    '',
    ...works.map((w) =>
      `- **${w.name}** (${w.category}): ${w.description} — ${w.url}`,
    ),
    '',
  ].join('\n')
}

export default defineEventHandler(async (event) => {
  const { folio } = useRuntimeConfig(event)
  const domain = folio.seo.url.replace(/\/$/, '') || LLMS_DOMAIN

  const lines = [
    `# ${folio.seo.title}`,
    '',
    `> ${folio.seo.description}`,
    '',
    `Site: ${domain}`,
    '',
    '## Home',
    '',
    'Overview of Hugo Richard\'s professional profile and featured projects.',
    '',
    await pageMarkdown('/'),
    '',
    '## Writings',
    '',
    'Technical articles, tutorials, and insights about frontend development, Vue.js, and the Nuxt ecosystem.',
    '',
  ]

  const writings = await listWriting(false)
  for (const w of writings) {
    lines.push(`### ${w.title}`, '', await pageMarkdown(w.path), '')
  }

  lines.push(
    '## Clipboard',
    '',
    'Short notes, links, and weekly picks (published only).',
    '',
  )

  const clipboards = await listClipboard(false)
  for (const c of clipboards) {
    lines.push(`### ${c.title}`, '', await pageMarkdown(c.path), '')
  }

  lines.push(
    '',
    '---',
    '',
    'Hugo Richard is a Software Engineer & Designer at Vercel, contributing to the Nuxt ecosystem. This portfolio showcases his professional work, technical writings, and projects.',
    await buildPlainIndex(domain),
  )

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
