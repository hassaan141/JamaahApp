import React from 'react'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import type { OrgPost } from '@/types'

export type ProgramsNotification = {
  id: string | number
  title?: string
  description?: string
  location?: string
  time?: string
  isNew?: boolean
  type?: string
  actionText?: string
}

const getPostType = (type?: string): string => {
  switch (type) {
    case 'school':
    case 'quran':
      return 'Repeating_classes'
    case 'khutbah':
    case 'event':
      return 'Event'
    default:
      return 'Event'
  }
}

// Convert ProgramsNotification to OrgPost format
const convertProgramsNotificationToOrgPost = (
  notification: ProgramsNotification,
): OrgPost => ({
  id: notification.id as string,
  title: notification.title || 'Untitled',
  body: notification.description || null,
  organization_id: '',
  author_profile_id: '',
  created_at: new Date().toISOString(),
  send_push: true,
  type: null,
  post_type: getPostType(notification.type),
  demographic: null,
  recurs_on_days: null,
  start_time: notification.time || null,
  end_time: null,
  date: null,
})

export default function NotificationItem({
  notification,
}: {
  notification: ProgramsNotification
}) {
  const announcement = convertProgramsNotificationToOrgPost(notification)

  return (
    <AnnouncementCard
      announcement={announcement}
      showEditButton={false}
      showPublishedDate={true}
    />
  )
}
