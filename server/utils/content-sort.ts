/** Shared across MCP tools and folio list endpoints — sorts any dated content item newest first. */
export function byDateDesc<T extends { date?: string }>(a: T, b: T): number {
  return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
}
