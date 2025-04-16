---
title: Background Stripes
description: Create a striped background effect using Tailwind CSS.
date: 2025-04-15
---

# Background Stripes

::code-preview
:div{class="bg-stripes" style="height: 100px; width: 100%;"}

#code
:::code-collapse{class="[&>div>pre]:rounded-t-none [&>div]:my-0"}
```css
.bg-stripes {
  @apply w-full [background-size:4px_4px];
  @apply dark:[background-image:linear-gradient(-45deg,var(--color-neutral-700)_12.50%,transparent_12.50%,transparent_50%,var(--color-neutral-700)_50%,var(--color-neutral-700)_62.50%,transparent_62.50%,transparent_100%)];
  @apply not-dark:[background-image:linear-gradient(-45deg,var(--color-neutral-200)_12.50%,transparent_12.50%,transparent_50%,var(--color-neutral-200)_50%,var(--color-neutral-200)_62.50%,transparent_62.50%,transparent_100%)];
}
```
:::
::
