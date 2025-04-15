import { defineCollection, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

export const collections = {
  content: defineCollection(
    asSeoCollection({
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
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.string().nonempty(),
      })
    })
  ),
  writing: defineCollection(
    asSeoCollection({
      type: 'page',
      source: '2.writing/*.md',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.string().nonempty(),
      })
    })
  ),
  playground: defineCollection(
    asSeoCollection({
      type: 'page',
      source: '3.playground/*.md',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.string().nonempty(),
      })
    })
  ),
  works: defineCollection({
    type: 'data',
    source: '1.works/*.json',
    schema: z.object({
      name: z.string().nonempty(),
      description: z.string().nonempty(),
      category: z.string().nonempty(),
      link: z.string().url(),
      release: z.string().optional(),
      date: z.string().nonempty(),
    })
  }),
}
