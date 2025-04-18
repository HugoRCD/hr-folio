import { existsSync } from 'node:fs'
import { defineNuxtModule } from '@nuxt/kit'
import { join } from 'pathe'
import captureWebsite from 'capture-website'

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
  nuxt.hook('content:file:afterParse', async ({ content: file }: { content: ContentFile }) => {
    if (file.id?.includes('works/')) {
      const template = file as TemplateItem
      const url = template.screenshotUrl || template.url
      if (!url) {
        console.error(`Work ${template.name} has no "url" or "screenshotUrl" to take a screenshot from`)
        return
      }
      if (template.screenshotUrl) return

      const name = template.name.toLowerCase().replace(/\s/g, '-')
      const filename = join(process.cwd(), 'public/assets/works', `${name}.png`)

      if (existsSync(filename)) return

      console.log(`Generating screenshot for work ${template.name} hitting ${url}...`)

      try {
        await captureWebsite.file(url, filename, {
          ...(template.screenshotOptions || {
            darkMode: true
          }),
          launchOptions: {
            headless: true,
          }
        })

        console.log(`Screenshot for ${template.name} generated successfully`)
      } catch (error) {
        console.error(`Error generating screenshot for ${template.name}:`, error)
      }
    }
  })
})
