# Evidence artifact design

Inspired by https://vercel.com/design.md. Apply its judgment and restraint, not Vercel authorship. Do not add the Vercel wordmark or logo unless the artifact is genuinely official.

## Goal

Make the changed behavior understandable in one glance. Design around evidence, not a generic report template.

## Visual direction

- Use Geist Sans for prose and Geist Mono only for commands, paths, identifiers, logs, and raw responses.
- Use a monochrome canvas. Reserve semantic red and green for exact failing and successful states, paired with text labels.
- Prefer one continuous surface, strong alignment, precise hierarchy, and purposeful spacing.
- Match dimensions, wrapping, crop, density, and baselines across before and after.
- Use sentence-case headings that state the observed behavior.
- Keep the exact command or prompt close to its output.
- Make output the dominant object in the first viewport.
- Include only metadata needed to trust the comparison: state, revision/environment, input, and result.

## Reject

- Source diffs, `git show`, allowlists, config objects, or code snippets presented as behavioral proof
- Generic dashboard cards, nested panels, pills, all-caps eyebrows, and repeated boxes
- Gradients, glows, glass, fake depth, textures, ornamental shadows, and decorative icons
- Tiny gray text, arbitrary sizes, excessive borders, or decorative color
- Large titles or explanations that push evidence below the fold
- Fake terminal chrome or output that was rewritten instead of captured

## Composition

- **Same prompt, different result:** show the prompt once, then aligned outputs
- **Capability change:** show the same real discovery call and its results
- **Build/runtime fix:** show the same command and aligned outcomes with exit codes
- **Interaction fix:** show paired short videos with the same starting state and actions

Use separate artifacts for independent behaviors.

## Review

1. Output, not title, dominates.
2. Before and after are visually comparable.
3. Every visible evidence line comes from captured input or output.
4. The claim remains clear in light and dark contexts.
5. Nothing removable remains.
