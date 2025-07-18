/**
 * @fileoverview Nuxt module for infinite canvas functionality
 */

import { defineNuxtModule, createResolver, addComponent, addImports } from '@nuxt/kit'

/**
 * Module configuration options
 */
export interface ModuleOptions {
  /** Component name prefix (default: '') */
  prefix?: string
}

/**
 * Infinite Canvas Nuxt Module
 * 
 * Provides components and composables for creating infinite, zoomable canvases
 * with drag interactions, touch support, and performance optimizations.
 * 
 * @example
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['./modules/infinite-canvas']
 * })
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxt/infinite-canvas',
    configKey: 'infiniteCanvas'
  },
  defaults: {
    prefix: ''
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register components
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

    // Register composables
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

    // Register utilities (optional, for advanced usage)
    addImports([
      {
        name: 'getTouchDistance',
        from: resolver.resolve('./utils'),
        as: 'getTouchDistance'
      },
      {
        name: 'getTouchCenter',
        from: resolver.resolve('./utils'),
        as: 'getTouchCenter'
      },
      {
        name: 'isVideo',
        from: resolver.resolve('./utils'),
        as: 'isVideo'
      },
      {
        name: 'isMobileDevice',
        from: resolver.resolve('./utils'),
        as: 'isMobileDevice'
      }
    ])

    // Add type definitions
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
