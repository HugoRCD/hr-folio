import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'fix-aliases' },
  setup(_options, nuxt) {
    function cleanAliases(obj: Record<string, unknown> | undefined) {
      if (!obj) return
      for (const key of Object.keys(obj)) {
        if (obj[key] == null) delete obj[key]
      }
    }

    cleanAliases(nuxt.options.alias as Record<string, unknown>)
    cleanAliases(nuxt.options.nitro.alias as Record<string, unknown>)

    nuxt.hook('nitro:config', (config) => {
      cleanAliases(config.alias as Record<string, unknown>)
    })
  },
})
