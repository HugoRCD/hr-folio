// The sheet's revisions, as a drawing lists them above its title block: the newest few commits of
// the branch this deployment was built from, each with its number (its place in the history), its
// date and its first line. Read from GitHub and kept for an hour.
type Commit = { sha: string, commit: { message: string, author: { date: string } } }

const REPO = 'HugoRCD/hr-folio'
const SHOWN = 5

export default defineCachedEventHandler(async (event) => {
  const log = useLogger(event)
  const branch = process.env.VERCEL_GIT_COMMIT_REF ?? 'main'
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'hugorcd.com' }
  try {
    // one commit a page: the last page's number is the number of commits, so the revision of the newest
    const first = await $fetch.raw<Commit[]>(`https://api.github.com/repos/${REPO}/commits`, { headers, query: { sha: branch, per_page: 1 } })
    const last = first.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/)?.[1]
    const total = last ? Number(last) : (first._data?.length ?? 0)
    const list = await $fetch<Commit[]>(`https://api.github.com/repos/${REPO}/commits`, { headers, query: { sha: branch, per_page: SHOWN } })
    const revisions = list.map((c, i) => ({
      n: total - i,
      sha: c.sha.slice(0, 7),
      date: c.commit.author.date,
      message: c.commit.message.split('\n')[0]!.replace(/\s*\(#\d+\)$/, ''),
    }))
    log.set({ revisions: { branch, total } })
    return { branch, total, revisions }
  } catch (error) {
    log.set({ revisions: { branch, unavailable: true } })
    log.error(error as Error)
    return { branch, total: null, revisions: [] }
  }
}, { maxAge: 3600, swr: true, name: 'folio-revisions', getKey: () => process.env.VERCEL_GIT_COMMIT_REF ?? 'main' })
