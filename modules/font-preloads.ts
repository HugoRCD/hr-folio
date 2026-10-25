// The faces the first screen is set in are preloaded, so they arrive with the page rather than after
// its first paint: a font that swaps in late breaks lines in other places, and the text below moves.
// The links are read from the stylesheet @nuxt/fonts writes for its global families, so the hashed
// file names are always the ones served: the Latin face of each family (a face with no unicode-range
// covers everything), at its first url(). Fonts are fetched in CORS mode, so the links say so too.
// Geist and Geist Mono, which set the running text, are also given font-display: optional: preloaded,
// they are nearly always there for the first paint, and when they are not, the page keeps its
// width-matched fallback (main.css) for that visit rather than reflowing once they arrive. Redaction,
// the titles, keeps swap: short lines that rarely break differently, and its look matters more.
import { addTemplate, defineNuxtModule } from '@nuxt/kit'

const LATIN = 'U+0000-00FF'

export default defineNuxtModule({
  meta: { name: 'font-preloads' },
  setup(_, nuxt) {
    const global = nuxt.options.build.templates.find(t => t.filename === 'nuxt-fonts-global.css')
    const generate = global?.getContents
    if (global && generate) {
      global.getContents = async (data) => {
        const css = String(await generate(data))
        return css.split('@font-face').map(face => /font-family: '(Geist|Geist Mono)'/.test(face)
          ? face.replace('font-display: swap', 'font-display: optional')
          : face).join('@font-face')
      }
    }
    // written as a template the app reads with useHead (app.vue): links put in app.head here did
    // not reach the production HTML
    addTemplate({
      filename: 'font-preloads.mjs',
      async getContents() {
        const template = nuxt.options.build.templates.find(t => t.filename === 'nuxt-fonts-global.css')
        const css = template?.getContents ? String(await template.getContents({ nuxt, app: {} as never, options: {} })) : ''
        const hrefs = new Set(css
          .split('@font-face')
          .filter(face => !face.includes('unicode-range') || face.includes(LATIN))
          .map(face => /url\("?([^")]+)"?\)/.exec(face)?.[1])
          .filter((href): href is string => !!href))
        const links = [...hrefs].map(href => ({
          rel: 'preload',
          as: 'font',
          href,
          type: href.endsWith('.ttf') ? 'font/ttf' : 'font/woff2',
          crossorigin: 'anonymous',
        }))
        return `export default ${JSON.stringify(links)}`
      },
    })
    addTemplate({
      filename: 'font-preloads.d.mts',
      getContents: () => 'declare const links: Array<Record<string, string>>\nexport default links\n',
    })
  },
})
