// The time the watch stopped at is the error: 404 is 4:04, 500 is 5:00. The hands' angles are in
// degrees from XII, clockwise.
export function stoppedAt(code: number) {
  const h = Math.floor(code / 100) % 12
  const m = code % 100 < 60 ? code % 100 : 0
  return {
    label: `${Math.floor(code / 100)}:${String(m).padStart(2, '0')}`,
    hour: h * 30 + m * 0.5,
    minute: m * 6,
  }
}
