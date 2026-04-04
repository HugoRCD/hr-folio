import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: [
        {
          include: '**/*.md',
          exclude: ['_archive/**'],
          prefix: '/'
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
        tags: z.array(z.string()).optional(),
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
        }).optional(),
        tags: z.array(z.string()).optional(),
      })
    }),
  }
})
