export default defineEventHandler((event) => {
  const { folio } = useRuntimeConfig(event)
  const domain = folio.seo.url.replace(/\/$/, '') || 'https://hugorcd.com'

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
    '## Writings',
    '',
    'Technical articles, tutorials, and insights about frontend development, Vue.js, and the Nuxt ecosystem.',
    '',
    '## Clipboard',
    '',
    'Short notes, links, and weekly picks (published only).',
    '',
    '---',
    '',
    'Hugo Richard is a Software Engineer & Designer at Vercel, contributing to the Nuxt ecosystem. This portfolio showcases his professional work, technical writings, and projects.',
    '',
    `Full content: ${domain}/llms-full.txt`,
  ]

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
