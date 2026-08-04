/** Comark nodes are compact tuples `[tag, props, ...children]`, text leaves are plain strings. */
type MarkdownNode = string | [string, Record<string, unknown>, ...unknown[]]

/** Flattens parsed Comark `nodes` into a plain-text string, for search/preview purposes. */
export function plainTextFromNodes(nodes: unknown[] | undefined): string {
  if (!nodes?.length) return ''
  let text = ''
  for (const node of nodes as MarkdownNode[]) {
    if (typeof node === 'string') {
      text += `${node} `
    } else if (Array.isArray(node)) {
      text += plainTextFromNodes(node.slice(2))
    }
  }
  return text.trim()
}
