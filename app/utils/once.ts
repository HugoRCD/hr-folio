/** Whether something has already happened during this visit, and mark it as happened. */
export function seenThisVisit(key: string, mark = false) {
  try {
    const seen = sessionStorage.getItem(`folio-${key}`) === '1'
    if (mark) sessionStorage.setItem(`folio-${key}`, '1')
    return seen
  } catch {
    return false // private mode: play it every time
  }
}
