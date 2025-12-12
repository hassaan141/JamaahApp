import type Feather from '@expo/vector-icons/Feather'
import type React from 'react'

export const formatTime = (time: string | null) => {
  if (!time) return null
  try {
    const [hours, minutes] = time.split(':')
    if (!hours || !minutes) return time
    const hour = parseInt(hours, 10)
    const min = minutes.padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min} ${ampm}`
  } catch {
    return time
  }
}

export const formatDaysOfWeek = (days: number[] | null) => {
  if (!days || days.length === 0) return null
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day) => dayNames[day - 1])
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
