import React from 'react'
import AnnouncementCard from '@/components/Shared/AnnouncementCard'
import type { OrgPost } from '@/types'

export type Notification = {
  id: string | number
  title: string
  description?: string
  location?: string
  time?: string
  isNew?: boolean
  icon?: string
}

// Convert legacy Notification to OrgPost format
const convertNotificationToOrgPost = (notification: Notification): OrgPost => ({
  id: notification.id as string,
  title: notification.title,
  body: notification.description || null,
  organization_id: '',
  author_profile_id: '',
  created_at: new Date().toISOString(),
  send_push: true,
  post_type: 'Event',
  demographic: null,
  recurs_on_days: null,
  start_time: notification.time || null,
  end_time: null,
  date: null,
  location: notification.location || null,
  lat: null,
  long: null,
})

export default function NotificationItem({
  notification,
}: {
  notification: Notification
}) {
  const announcement = convertNotificationToOrgPost(notification)

  return (
    <AnnouncementCard
      announcement={announcement}
      showEditButton={false}
      showPublishedDate={true}
    />
  )
}
