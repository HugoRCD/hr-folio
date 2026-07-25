---
name: nucleo
description: Workflow guidelines and slash command execution for Nucleo App SVG icons and local Iconify collections in Nuxt/Vue projects. Use whenever the user asks for /nucleo, nucleo icons, importing or converting local Nucleo SVGs, configuring custom collections, or handling currentColor styling.
---

# Nucleo Icon Integration & Workflow

This skill defines the canonical rules and instructions for accessing, formatting, and integrating SVG icons from the local **Nucleo App** into **Nuxt** (`@nuxt/icon` / `@nuxt/ui`) or Vue projects.

---

## 1. Local Nucleo Source Vault

Nucleo stores exported or synced local icon projects in the default macOS Application Support directory:

```text
/Users/hugorichard/Library/Application Support/Nucleo/icons
```

When referencing source icons directly from Nucleo, inspect this path or project-local SVG asset directories.

---

## 2. Dynamic `currentColor` & SVG Sanitization Rules

Nucleo SVG exports often include hardcoded fills (`fill="#000000"`, `stroke="#111827"`), explicit width/height dimensions, or inline style blocks. To ensure icons adapt dynamically to CSS text colors (e.g., Nuxt UI / Tailwind classes like `text-primary`, `text-gray-500`):

1. **Remove explicit root dimensions:** Remove `width="..."` and `height="..."` attributes on `<svg>`. Always preserve `viewBox="0 0 W H"`.
2. **Convert active color attributes to `currentColor`:**
   - Convert `fill="#..."` or `fill="rgb(...)"` (except `fill="none"`) to `fill="currentColor"`.
   - Convert `stroke="#..."` or `stroke="rgb(...)"` (except `stroke="none"`) to `stroke="currentColor"`.
3. **Multi-tone / Accent layers:** Preserve opacity settings (e.g. `opacity="0.4"` or `fill-opacity="0.4"`) for secondary detail paths.

---

## 3. Nuxt & `@nuxt/icon` / `@nuxt/ui` Configuration

Nuxt projects register local SVG folders using `@nuxt/icon`'s `customCollections` option.

### Direct Local Directory Setup (`nuxt.config.ts`)

```ts
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: ['@nuxt/ui'], // or '@nuxt/icon'

  icon: {
    customCollections: [
      {
        prefix: 'nucleo',
        dir: resolve('./app/assets/icons/nucleo'),
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
  },
})
```

### Usage in Components
```vue
<template>
  <UIcon name="i-nucleo-user" class="w-5 h-5 text-primary-500" />
  <Icon name="i-nucleo-settings" class="w-6 h-6 text-gray-700 dark:text-gray-200" />
</template>
```

---

## 4. Automated Build-Time Transformation Hook (`app.config.ts`)

Alternatively, to avoid modifying raw SVG files manually, convert strokes and fills on-the-fly via the Nuxt Icon runtime hook:

```ts
// app.config.ts
export default defineAppConfig({
  icon: {
    customize(content, name, prefix) {
      if (prefix !== 'nucleo') return content

      return content
        .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
        .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
    },
  },
})
```

---

## 5. `/nucleo` Slash Command Behavior

When the user types `/nucleo` or requests a Nucleo action:

1. Do **not** automatically execute batch file transfers or mass modifications unless explicitly requested.
2. Ask or confirm what specific task is needed:
   - Locating specific icons in `/Users/hugorichard/Library/Application Support/Nucleo/icons`
   - Setting up a custom Nucleo collection in `nuxt.config.ts`
   - Converting specific raw SVG files to `currentColor`
   - Generating component usage code snippets (`<UIcon name="i-nucleo-..." />`)
