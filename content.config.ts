import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: [
        {
          include: '**/*.md',
          prefix: '/'
        },
        {
          repository: 'https://github.com/HugoRCD/notes',
          include: '*.md',
          prefix: '/notes',
          authToken: process.env.NUXT_PRIVATE_GITHUB_TOKEN,
        }
      ],
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        image: z.string().optional(),
      })
    }),
    writing: defineCollection({
      type: 'page',
      source: '2.writing/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        draft: z.boolean().default(false),
      })
    }),
    playground: defineCollection({
      type: 'page',
      source: '3.playground/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        draft: z.boolean().default(false),
      })
    }),
    works: defineCollection({
      type: 'data',
      source: '1.works/*.json',
      schema: z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        release: z.string().optional(),
        date: z.string(),
        url: z.string(),
        screenshotUrl: z.string().optional(),
        screenshotOptions: z.object({
          delay: z.number()
        }).optional()
      })
    }),
    canvas: defineCollection({
      type: 'page',
      source: 'canvas/*.yml',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        items: z.array(z.object({
          title: z.string(),
          description: z.string(),
          link: z.string(),
          image: z.string(),
        })),
      })
    }),
  }
})
