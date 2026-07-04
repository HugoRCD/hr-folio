import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

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

process.env.PUPPETEER_CACHE_DIR = join(homedir(), '.cache', 'puppeteer')

const { default: captureWebsite } = await import('capture-website')

const root = process.cwd()
const worksDir = join(root, 'content/1.works')
const outputDir = join(root, 'public/works')
const chromeExecutable = resolveChromeExecutable()

if (!chromeExecutable) {
  console.error('Chrome for Testing not found. Run: pnpm screenshots:install')
  process.exit(1)
}

function screenshotSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

mkdirSync(outputDir, { recursive: true })

const files = readdirSync(worksDir).filter(file => file.endsWith('.json'))
let generated = 0
let skipped = 0

for (const file of files) {
  const work = JSON.parse(readFileSync(join(worksDir, file), 'utf8'))
  if (work.screenshotUrl || !work.url) {
    skipped++
    continue
  }

  const filename = join(outputDir, `${screenshotSlug(work.name)}.png`)
  if (existsSync(filename)) {
    skipped++
    continue
  }

  console.log(`Generating screenshot for ${work.name}...`)
  await captureWebsite.file(work.url, filename, {
    ...(work.screenshotOptions || { darkMode: true }),
    launchOptions: {
      headless: true,
      executablePath: chromeExecutable,
    },
  })
  console.log(`Saved ${filename}`)
  generated++
}

console.log(`Done. Generated ${generated}, skipped ${skipped}.`)
