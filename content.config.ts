import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'

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
        rawbody: z.string().optional(),
        sitemap: defineSitemapSchema({
          name: 'content',
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
        tags: z.array(z.string()).optional(),
        rawbody: z.string(),
        sitemap: defineSitemapSchema({
          name: 'writing',
        }),
      }),
    }),
    clipboard: defineCollection({
      type: 'page',
      source: '3.clipboard/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        rawbody: z.string(),
        sitemap: defineSitemapSchema({
          name: 'clipboard',
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
    about: defineCollection({
      type: 'data',
      source: 'about.json',
      schema: z.object({
        fullName: z.string(),
        headline: z.string(),
        pronouns: z.string().optional(),
        location: z.object({
          city: z.string().optional(),
          country: z.string().optional(),
          timezone: z.string().optional(),
        }).optional(),
        languages: z.array(z.string()).optional(),
        bio: z.string().describe('Long-form markdown bio. Authoritative source for personal/biographical questions.'),
        currentRole: z.object({
          company: z.string(),
          companyUrl: z.string().optional(),
          role: z.string(),
          since: z.string(),
          focus: z.string().optional(),
        }),
        pastRoles: z.array(z.object({
          company: z.string(),
          companyUrl: z.string().optional(),
          role: z.string(),
          period: z.string(),
          summary: z.string().optional(),
        })).optional(),
        expertise: z.array(z.string()).optional(),
        stack: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
        highlights: z.array(z.object({
          name: z.string(),
          role: z.string().optional(),
          description: z.string(),
          url: z.string().optional(),
          stem: z.string().optional().describe('Optional stem of the matching `works` entry for cross-linking.'),
        })).optional().describe('Flagship/marquee projects, ordered by importance (most important first). Keep tight — for breadth see `ecosystemContributions`.'),
        ecosystemContributions: z.array(z.string()).optional().describe('Free-form list of broader contributions across Nuxt, Nitro, Vercel, and other open-source ecosystems beyond the flagship `highlights` list.'),
        availability: z.string().optional(),
        funFacts: z.array(z.string()).optional(),
        misconceptions: z.array(z.object({
          claim: z.string(),
          correction: z.string(),
        })).optional().describe('Common things assistants get wrong. Each entry corrects one misconception.'),
      }),
    }),
  },
})
