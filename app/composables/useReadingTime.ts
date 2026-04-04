const WORDS_PER_MINUTE = 200

export function useReadingTime(body: { toc?: { links?: unknown[] }, children?: unknown[] } | undefined): number {
  if (!body) return 0

  function countWords(node: unknown): number {
    if (!node || typeof node !== 'object') return 0
    const n = node as Record<string, unknown>
    if (n.type === 'text' && typeof n.value === 'string') {
      return n.value.split(/\s+/).filter(Boolean).length
    }
    if (Array.isArray(n.children)) {
      return n.children.reduce((sum: number, child: unknown) => sum + countWords(child), 0)
    }
    return 0
  }

  const words = countWords(body)
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
