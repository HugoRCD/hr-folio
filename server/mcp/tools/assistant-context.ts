import { z } from 'zod'

export default defineMcpTool({
  name: 'assistant-context',
  title: 'Assistant context pack',
  description:
    'Returns a structured briefing for assistants: public profile (from site config), links, and the latest writing, works, and clipboard items with site URLs. Use first to ground answers about Hugo Richard before deeper content-list / content-get calls.',
  group: 'content',
  annotations: { readOnlyHint: true, openWorldHint: false },
  inputSchema: {
    writingLimit: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .describe('How many recent published writing posts to include.'),
    worksLimit: z
      .number()
      .min(1)
      .max(30)
      .default(8)
      .describe('How many recent works (projects) to include, by date.'),
    clipboardLimit: z
      .number()
      .min(0)
      .max(10)
      .default(3)
      .describe('How many recent clipboard notes to include (0 to skip).'),
  },
  inputExamples: [{ writingLimit: 5, worksLimit: 8, clipboardLimit: 3 }],
  cache: '5m',
  handler: async ({ writingLimit, worksLimit, clipboardLimit }) => {
    const event = useEvent()
    const { folio } = useRuntimeConfig(event)
    const siteUrl = folio.seo.url.replace(/\/$/, '')

    const [writings, works, clipboards, home] = await Promise.all([
      queryCollection(event, 'writing')
        .order('date', 'DESC')
        .limit(writingLimit + 8)
        .all()
        .then(rows => rows
          .filter(p => !(p as { draft?: boolean }).draft)
          .slice(0, writingLimit)),
      queryCollection(event, 'works')
        .order('date', 'DESC')
        .limit(worksLimit)
        .all(),
      clipboardLimit > 0
        ? queryCollection(event, 'clipboard')
          .order('date', 'DESC')
          .limit(clipboardLimit + 8)
          .all()
          .then(rows => rows
            .filter(c => !(c as { draft?: boolean }).draft)
            .slice(0, clipboardLimit))
        : Promise.resolve([]),
      queryCollection(event, 'content').path('/').first(),
    ])

    const absolute = (path: string) =>
      path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`

    return {
      generatedFor: 'MCP clients — ground conversations about Hugo Richard and hugorcd.com',
      profile: {
        name: folio.seo.title,
        tagline: folio.seo.description,
        siteUrl,
        lang: folio.seo.lang,
        email: folio.profile.email,
        picture: folio.profile.picture,
        socials: folio.socials,
      },
      home: home
        ? {
          path: home.path,
          title: home.title,
          description: home.description,
          url: absolute(home.path),
          rawbodyPreview: typeof home.rawbody === 'string'
            ? home.rawbody.slice(0, 2500)
            : undefined,
        }
        : null,
      writing: writings.map(p => ({
        path: p.path,
        title: p.title,
        description: p.description,
        date: p.date,
        tags: 'tags' in p ? p.tags : undefined,
        url: absolute(p.path),
      })),
      works: works.map(w => ({
        stem: w.stem,
        name: w.name,
        description: w.description,
        category: w.category,
        date: w.date,
        url: w.url.startsWith('http') ? w.url : absolute(w.url),
        tags: w.tags,
      })),
      clipboard: clipboards.map(c => ({
        path: c.path,
        title: c.title,
        date: c.date,
        url: absolute(c.path),
      })),
      navigationHints: {
        writingIndex: absolute('/writing'),
        worksIndex: absolute('/works'),
        clipboardIndex: absolute('/clipboard'),
        deeperQueries: 'Use content-list and content-get for full text, search, and drafts.',
      },
    }
  },
})
