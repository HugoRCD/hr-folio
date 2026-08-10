/**
 * Sorts any dated content item newest first. Lives in `shared/` (not
 * `server/utils/`) because it's needed on both sides: server handlers (MCP
 * tools, `llms.txt`) and client components (`SearchCommand`) that sort
 * `clientContent.list()` results.
 */
export function byDateDesc<T extends { date?: string }>(a: T, b: T): number {
  return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
}
