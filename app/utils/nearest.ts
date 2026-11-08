// The pages closest to an address that leads nowhere: a mistyped letter (/writng), a word left
// out or added (/writing/how-i-redrew-portfolio), a page asked for by its old name. Each known page
// is compared on its last segment, by edits and by the words they share, and the best of the two
// counts. Only pages close enough to have been meant are kept.
export type Known = { path: string, title: string }

const words = (s: string) => s.split(/[-_.\s]+/).filter(Boolean)
const last = (path: string) => path.toLowerCase().replace(/\/+$/, '').split('/').at(-1) ?? ''

function edits(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const up = row[j]!
      row[j] = Math.min(up + 1, row[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = up
    }
  }
  return row[b.length]!
}

function likeness(asked: string, known: string) {
  if (!asked || !known) return 0
  const spelled = 1 - edits(asked, known) / Math.max(asked.length, known.length)
  const a = new Set(words(asked))
  const b = new Set(words(known))
  const shared = [...a].filter(w => b.has(w)).length
  const worded = shared / Math.max(a.size, b.size)
  return Math.max(spelled, worded)
}

export function nearest(path: string, pages: Known[], count = 2, floor = 0.6) {
  const asked = last(path)
  return pages
    .map(page => ({ page, score: likeness(asked, last(page.path)) }))
    .filter(m => m.score >= floor && m.page.path !== path)
    .sort((x, y) => y.score - x.score)
    .slice(0, count)
    .map(m => m.page)
}

// where to go instead: the nearest page first, then the main ones, four at most
export function instead(near: Known[], places: Known[], count = 4) {
  const first = near.slice(0, 1)
  return [...first, ...places.filter(p => !first.some(f => f.path === p.path))]
    .slice(0, count)
    .map(p => ({ path: p.path, title: p.title }))
}
