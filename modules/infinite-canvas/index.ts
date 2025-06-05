import { defineNuxtModule, addComponent, addImports, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/infinite-canvas',
    configKey: 'infiniteCanvas',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    prefix: ''
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add components
    addComponent({
      name: `${options.prefix}Canvas`,
      filePath: resolver.resolve('./components/InfiniteCanvas.vue'),
      export: 'default'
    })

    addComponent({
      name: `${options.prefix}CanvasMinimap`,
      filePath: resolver.resolve('./components/CanvasMinimap.vue'),
      export: 'default'
    })

    addComponent({
      name: `${options.prefix}CanvasLoader`,
      filePath: resolver.resolve('./components/CanvasLoader.vue'),
      export: 'default'
    })

    // Add composables
    addImports([
      {
        name: 'useInfiniteCanvas',
        from: resolver.resolve('./composables/useInfiniteCanvas'),
        as: 'useInfiniteCanvas'
      },
      {
        name: 'useImagePreloader',
        from: resolver.resolve('./composables/useImagePreloader'),
        as: 'useImagePreloader'
      }
    ])

    // Add types (optional)
    nuxt.hook('prepare:types', (options) => {
      options.references.push({
        path: resolver.resolve('./types')
      })
    })
  }
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    infiniteCanvas?: ModuleOptions
  }
} 
