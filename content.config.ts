import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'

function publishedForSitemap(entry: { draft?: boolean }) {
  return !entry.draft
}

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        image: z.string().optional(),
        draft: z.boolean().default(false),
        rawbody: z.string().optional(),
        sitemap: defineSitemapSchema({
          name: 'content',
          filter: publishedForSitemap,
        }),
      }),
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
        rawbody: z.string(),
        sitemap: defineSitemapSchema({
          name: 'writing',
          filter: publishedForSitemap,
        }),
      }),
    }),
    clipboard: defineCollection({
      type: 'page',
      source: '3.clipboard/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        draft: z.boolean().default(false),
        rawbody: z.string(),
        sitemap: defineSitemapSchema({
          name: 'clipboard',
          filter: publishedForSitemap,
        }),
      }),
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
        github: z.string().optional(),
        screenshotUrl: z.string().optional(),
        screenshotOptions: z.object({
          delay: z.number(),
        }).optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
  },
})
