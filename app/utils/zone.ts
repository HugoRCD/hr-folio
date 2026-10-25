/** Milliseconds a time zone's wall clock is ahead of UTC at an instant. */
export function zoneOffsetMs(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at)
  const n = (t: string) => Number(parts.find(p => p.type === t)!.value)
  const wall = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'))
  return wall - Math.floor(at.getTime() / 1000) * 1000
}

/** Seconds since local midnight in a zone, with milliseconds. */
export function secondsOfDay(now: number, offsetMs: number) {
  return (((now + offsetMs) / 1000) % 86400 + 86400) % 86400
}
