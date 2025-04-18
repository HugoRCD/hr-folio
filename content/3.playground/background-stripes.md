---
title: Background Stripes
description: A simple background stripe pattern using Tailwind CSS.
date: 2025-04-15
---

# Background Stripes

The `bg-stripes` utility class creates a diagonal-striped pattern using CSS linear gradients. The implementation:

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

## Usage

Add the `bg-stripes` class to any container element:

This pattern works particularly well for:
- Section backgrounds
- Card headers
- Loading placeholders
- Accent elements

## Customization

You can easily modify the stripe pattern by adjusting the following properties:

- **Stripe size**: Change the `background-size` value (e.g., `8px 8px` for larger stripes)
- **Stripe angle**: Modify the gradient angle (e.g., `-60deg` for a steeper diagonal)
- **Stripe colors**: Replace the color variables with custom values

### Example with custom colors

::code-preview
:div{class="bg-stripes-custom" style="height: 100px; width: 100%;"}

#code
```css
.bg-stripes-custom {
  @apply w-full [background-size:6px_6px];
  @apply [background-image:linear-gradient(-45deg,#3b82f6_12.50%,transparent_12.50%,transparent_50%,#3b82f6_50%,#3b82f6_62.50%,transparent_62.50%,transparent_100%)];
}
```
::
