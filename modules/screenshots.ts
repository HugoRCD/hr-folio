import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createLogger } from 'evlog'
import { defineNuxtModule } from '@nuxt/kit'

interface ContentFile {
  id?: string
  body?: {
    items: TemplateItem[]
  }
}

interface TemplateItem {
  name: string
  url?: string
  screenshotUrl?: string
  screenshotOptions?: Record<string, any>
}

export default defineNuxtModule((_, nuxt) => {
  if (!nuxt.options.dev) return
  const logger = createLogger({ tag: 'Screenshots' })

  nuxt.hook('content:file:afterParse', async ({ content: file }: { content: ContentFile }) => {
    if (file.id?.includes('works/')) {
      const template = file as TemplateItem
      const url = template.screenshotUrl || template.url
      if (!url || template.screenshotUrl) return

      const name = template.name.toLowerCase().replace(/\s/g, '-')
      const filename = join(process.cwd(), 'public/works', `${name}.png`)

      if (existsSync(filename)) return

      try {
        const { default: captureWebsite } = await import('capture-website')
        logger.info(`Generating screenshot for ${template.name}...`)
        await captureWebsite.file(url, filename, {
          ...(template.screenshotOptions || { darkMode: true }),
          launchOptions: { headless: true },
        })
        logger.info(`Screenshot for ${template.name} generated`)
      } catch (error) {
        logger.error(`Error generating screenshot for ${template.name}: ${error}`)
      }
    }
  })
})
