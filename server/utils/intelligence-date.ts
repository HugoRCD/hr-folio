/** Calendar date (YYYY-MM-DD) in Europe/Paris, for daily intelligence filenames and prompts. */
export function getParisCalendarDateISO(ref = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ref)
}
