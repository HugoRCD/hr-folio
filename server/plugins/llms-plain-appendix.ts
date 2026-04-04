/**
 * llms-full.txt is built from each page’s AST → Markdown, so MDC blocks stay as ::writing-list / ::projects.
 * Append a plain-Markdown rollup (published writing, clipboard, works) so LLMs get concrete lists without resolving components.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate:full', async (event, options, contents) => {
    const domain = String((options as { domain?: string }).domain ?? '').replace(/\/$/, '')
    const abs = (path: string) =>
      path.startsWith('http') ? path : `${domain}${path.startsWith('/') ? path : `/${path}`}`

    const [writingRows, clipboardRows, workRows] = await Promise.all([
      queryCollection(event, 'writing').where('path', 'LIKE', '/writing/%').order('date', 'DESC').all(),
      queryCollection(event, 'clipboard').where('path', 'LIKE', '/clipboard/%').order('date', 'DESC').all(),
      queryCollection(event, 'works').order('date', 'DESC').all(),
    ])

    const writing = writingRows.filter(r => !(r as { draft?: boolean }).draft)
    const clipboard = clipboardRows.filter(r => !(r as { draft?: boolean }).draft)

    const lines = [
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
        const desc = 'description' in w && w.description ? ` — ${w.description}` : ''
        return `- [${w.title}](${abs(w.path)})${desc} (${w.date})`
      }),
      '',
      '## Clipboard',
      '',
      ...clipboard.map((c) => `- [${c.title}](${abs(c.path)}) (${c.date})`),
      '',
      '## Works / projects',
      '',
      ...workRows.map((w) =>
        `- **${w.name}** (${w.category}): ${w.description} — ${w.url}`,
      ),
      '',
    ]

    contents.push(lines.join('\n'))
  })
})
