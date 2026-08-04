const WORDS_PER_MINUTE = 200

export function readingMinutesFromNodes(nodes: unknown[] | undefined): number {
  const words = plainTextFromNodes(nodes).split(/\s+/).filter(Boolean).length
  if (!words) return 0
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
