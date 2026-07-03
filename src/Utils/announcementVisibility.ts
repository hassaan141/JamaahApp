type AnnouncementLike = {
  post_type?: string | null
  date?: string | null
  start_time?: string | null
  end_time?: string | null
}

// Re-express `now` as the wall-clock time in `timezone`, on the device-local
// basis, so it can be compared against the announcement's naive local times.
// ponytail: quick fix — proper solution is storing a timestamptz end instant.
function nowInZone(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const hour = get('hour') === 24 ? 0 : get('hour')
  return new Date(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second'),
  )
}

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function parseTimeParts(timeStr: string | null | undefined) {
  if (!timeStr) return null
  const [hh, mm = '0', ss = '0'] = timeStr.split(':')
  const hours = Number(hh)
  const minutes = Number(mm)
  const seconds = Number(ss)

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return null
  }

  return { hours, minutes, seconds }
}

export function isAnnouncementUpcoming<T extends AnnouncementLike>(
  announcement: T,
  now = new Date(),
  timezone?: string | null,
) {
  const type = announcement.post_type

  // Compare against the org's wall clock, not the device's, so a BC event
  // stays visible to a viewer in a different timezone until it ends there.
  if (timezone) now = nowInZone(now, timezone)

  // Recurring classes should remain available unless product rules change.
  if (type === 'Repeating_classes') return true

  // If there is no scheduled date, keep showing it rather than hiding data.
  if (!announcement.date) return true

  const eventDate = parseLocalDate(announcement.date)
  if (!eventDate) return true

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDayStart = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  )

  if (eventDayStart.getTime() > todayStart.getTime()) return true
  if (eventDayStart.getTime() < todayStart.getTime()) return false

  const endTime = parseTimeParts(announcement.end_time) ?? {
    hours: 23,
    minutes: 59,
    seconds: 59,
  }

  const eventEnd = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
    endTime.hours,
    endTime.minutes,
    endTime.seconds,
  )

  return eventEnd.getTime() >= now.getTime()
}
