// The inspection, before the sheet leaves the workshop. A movement gets its seal only once it has
// passed inspection; this site gets its stamp only once its light has: at every build, the red and
// the body text are checked against their ground at every height the sun can take. If either ever
// crosses its floor, the build stops. Otherwise the result is stamped into the page (the title
// block under the sheet) with the date and the commit.
import { createLogger } from 'evlog'
import { defineNuxtModule } from '@nuxt/kit'
import { FLOORS, inspectLight } from '../app/utils/daylight'

export default defineNuxtModule({
  meta: { name: 'inspection' },
  setup(_, nuxt) {
    const logger = createLogger({ tag: 'Inspection' })
    const result = inspectLight()
    const round = (n: number) => Math.floor(n * 100) / 100
    const stamp = {
      at: new Date().toISOString(),
      sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      checked: result.checked,
      red: { ratio: round(result.red.ratio), at: result.red.at, floor: FLOORS.red },
      text: { ratio: round(result.text.ratio), at: result.text.at, floor: FLOORS.text },
    }
    if (!result.pass) {
      logger.error('The light crosses a contrast floor')
      throw new Error(`Inspection failed: red ${stamp.red.ratio} (floor ${FLOORS.red}) at ${stamp.red.at}°, text ${stamp.text.ratio} (floor ${FLOORS.text}) at ${stamp.text.at}°`)
    }
    logger.info(`Light inspected at ${stamp.checked} sun heights: red ≥ ${stamp.red.ratio}:1, text ≥ ${stamp.text.ratio}:1`)
    nuxt.options.runtimeConfig.public.inspection = stamp
  },
})
