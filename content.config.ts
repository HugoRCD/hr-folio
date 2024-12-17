import { defineCollection, z } from '@nuxt/content'

export const collections = {
  content: defineCollection({
    type: 'page',
    source: '**/*.md'
  }),
  notes: defineCollection({
    type: 'page',
    source: {
      repository: 'HugoRCD/notes',
      authToken: process.env.NUXT_PRIVATE_GITHUB_TOKEN,
      include: 'src/*.md',
    }
  }),
  writing: defineCollection({
    type: 'page',
    source: '2.writing/*.md',
    schema: z.object({
      title: z.string().nonempty(),
      description: z.string().nonempty(),
      date: z.string().nonempty(),
      image: z.string().url(),
    })
  }),
  works: defineCollection({
    type: 'data',
    source: '1.works/*.json',
    schema: z.object({
      name: z.string().nonempty(),
      logo: z.string().nonempty(),
      description: z.string().nonempty(),
      image: z.string().url(),
      link: z.string().url(),
      release: z.string().nonempty(),
      date: z.string().nonempty(),
    })
  })
}
