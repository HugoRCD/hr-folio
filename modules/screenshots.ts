import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createLogger } from 'evlog'
import { defineNuxtModule } from '@nuxt/kit'

interface WorkEntry {
  name: string
  url?: string
  screenshotUrl?: string
  screenshotOptions?: Record<string, unknown>
}

function screenshotSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function resolveChromeExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }

  const cacheDir = join(homedir(), '.cache', 'puppeteer', 'chrome')
  if (!existsSync(cacheDir)) return undefined

  const versions = readdirSync(cacheDir)
    .filter(name => name.startsWith('mac_'))
    .sort()
    .reverse()

  for (const version of versions) {
    const executable = join(
      cacheDir,
      version,
      'chrome-mac-arm64',
      'Google Chrome for Testing.app',
      'Contents',
      'MacOS',
      'Google Chrome for Testing',
    )
    if (existsSync(executable)) return executable
  }

  return undefined
}

async function generateScreenshot(work: WorkEntry, logger: ReturnType<typeof createLogger>) {
  if (work.screenshotUrl || !work.url) return

  const outputDir = join(process.cwd(), 'public/works')
  const filename = join(outputDir, `${screenshotSlug(work.name)}.png`)

  if (existsSync(filename)) return

  mkdirSync(outputDir, { recursive: true })

  const chromeExecutable = resolveChromeExecutable()
  if (!chromeExecutable) {
    logger.warn(`Chrome for Testing not found — run pnpm screenshots:install`)
    return
  }

  try {
    const { default: captureWebsite } = await import('capture-website')
    logger.info(`Generating screenshot for ${work.name}...`)
    await captureWebsite.file(work.url, filename, {
      ...(work.screenshotOptions || { darkMode: true }),
      launchOptions: {
        headless: true,
        executablePath: chromeExecutable,
      },
    })
    logger.info(`Screenshot for ${work.name} generated`)
  } catch (error) {
    logger.error(`Error generating screenshot for ${work.name}: ${error}`)
  }
}

export default defineNuxtModule((_, nuxt) => {
  if (!nuxt.options.dev) return

  process.env.PUPPETEER_CACHE_DIR = join(homedir(), '.cache', 'puppeteer')

  const logger = createLogger({ tag: 'Screenshots' })

  nuxt.hook('ready', async () => {
    const { cms } = await import('../server/utils/cms')

    cms.hooks.hook('watch:file:update', async (_source, key, file) => {
      if (!key.includes('1.works/') || !key.endsWith('.json')) return
      await generateScreenshot(file.data as WorkEntry, logger)
    })

    await cms.watch()
  })
})
