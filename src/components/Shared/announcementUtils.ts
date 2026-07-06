import type Feather from '@expo/vector-icons/Feather'
import type React from 'react'

export function isPastAnnouncementDate(date: string | null) {
  if (!date) return false

  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return false

  const selectedDate = new Date(year, month - 1, day)
  const today = new Date()
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  return selectedDate.getTime() < todayStart.getTime()
}

export function formatAnnouncementDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return date

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getAnnouncementValidationError(input: {
  announcementTitle: string
  announcementBody: string
  postType: string | null
  startTime: string | null
  endTime: string | null
  demographic: string | null
  recurringDays: number[]
  date: string | null
  locationAddress: string | null
  hasProfile?: boolean
  action?: 'posting' | 'saving'
}) {
  const action = input.action ?? 'posting'

  if (!input.announcementTitle.trim()) {
    return {
      title: 'Title required',
      message: `Add a title before ${action}.`,
    }
  }

  if (!input.announcementBody.trim()) {
    return {
      title: 'Add details',
      message: 'Announcement details cannot be empty.',
    }
  }

  if (!input.postType) {
    return {
      title: 'Post type required',
      message: `Select a post type before ${action}.`,
    }
  }

  if (
    input.postType === 'Repeating_classes' &&
    input.recurringDays.length === 0
  ) {
    return {
      title: 'Schedule required',
      message: 'Select at least one recurring day for classes.',
    }
  }

  if (input.postType !== 'Repeating_classes' && !input.date) {
    return {
      title: 'Date required',
      message: `Choose a date for this announcement before ${action}.`,
    }
  }

  if (input.date && isPastAnnouncementDate(input.date)) {
    return {
      title: 'Invalid date',
      message: `${formatAnnouncementDate(input.date)} is in the past. Choose today or a future date.`,
    }
  }

  if (!input.startTime) {
    return {
      title: 'Start time required',
      message: `Choose a start time before ${action}.`,
    }
  }

  if (!input.endTime) {
    return {
      title: 'End time required',
      message: `Choose an end time before ${action}.`,
    }
  }

  if (!input.demographic) {
    return {
      title: 'Audience required',
      message: `Select an audience before ${action}.`,
    }
  }

  if (!input.locationAddress?.trim()) {
    return {
      title: 'Location required',
      message: `Choose an event location before ${action}.`,
    }
  }

  if (input.hasProfile === false) {
    return {
      title: 'Unable to post',
      message: 'Your organization profile is missing required account details.',
    }
  }

  return null
}

export const formatDaysOfWeek = (
  days: (number | string)[] | null,
  style: 'short' | 'long' = 'short',
) => {
  if (!days || days.length === 0) return null
  const dayNames =
    style === 'long'
      ? [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ]
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days
    .map((day) => {
      const dayNumber = typeof day === 'string' ? parseInt(day, 10) : day
      if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 7) {
        return null
      }
      return dayNames[dayNumber - 1]
    })
    .filter(Boolean) as string[]
}

export const chunkIntoPairs = (items: string[] | null) => {
  if (!items) return null
  const chunks: string[] = []
  for (let i = 0; i < items.length; i += 2) {
    chunks.push(items.slice(i, i + 2).join(', '))
  }
  return chunks
}

export const formatDate = (dateString: string | null) => {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const getEventTypeIcon = (
  postType: string | null,
): React.ComponentProps<typeof Feather>['name'] => {
  switch (postType) {
    case 'Event':
      return 'calendar'
    case 'Repeating_classes':
      return 'book-open'
    case 'Janazah':
      return 'heart'
    case 'Volunteerng':
    case 'Volunteering':
      return 'users'
    default:
      return 'calendar'
  }
}

export const getEventTypeColor = (postType: string | null) => {
  switch (postType) {
    case 'Event':
      return '#2F855A'
    case 'Repeating_classes':
      return '#3182CE'
    case 'Janazah':
      return '#E53E3E'
    case 'Volunteerng':
    case 'Volunteering':
      return '#805AD5'
    default:
      return '#2F855A'
  }
}
