const WORDS_PER_MINUTE = 200

export function useReadingTime(rawbody: string | undefined | null): number {
  if (!rawbody) return 0

  const text = rawbody
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/!?\[.*?\]\(.*?\)/g, '')
    .replace(/[#*>`~_\-|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
