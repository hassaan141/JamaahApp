export function todayISO(): string {
  // Return local date (YYYY-MM-DD), not UTC. Using toISOString() caused an off-by-one
  // for timezones west/east of UTC, which broke daily_prayer_times lookups.
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function minutesSince(ts: string | number | Date): number {
  return (Date.now() - new Date(ts).getTime()) / 60000
}

export function sameLocalDate(
  a: string | number | Date,
  b: string | number | Date,
): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

// Returns 'Just now', 'x min ago', 'x hours ago', etc.
export function timeAgo(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((+now - +date) / 1000)
  if (diff < 60) return diff <= 1 ? 'Just now' : `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return date.toLocaleDateString()
}

// Returns true if within 24 hours
export function isNewAnnouncement(dateString?: string): boolean {
  if (!dateString) return false
  const now = new Date()
  const date = new Date(dateString)
  return +now - +date < 24 * 3600 * 1000
}

// Format a time string (e.g., '13:05.00') to '1:05 PM' style
export function formatTime(time?: string, prayerName = ''): string {
  if (!time) return ''
  const [timeStr] = time.split('.')
  const [hoursStr, minutesStr] = timeStr.split(':')
  const hours = Number.parseInt(hoursStr, 10)
  const minutes = Number.parseInt(minutesStr, 10)
  let period: 'AM' | 'PM' = 'AM'
  if (['Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayerName)) {
    period = 'PM'
  } else if (hours >= 12) {
    period = 'PM'
  }
  const formattedHours = hours % 12 || 12
  const formattedMinutes = minutes.toString().padStart(2, '0')
  return `${formattedHours}:${formattedMinutes} ${period}`
}
